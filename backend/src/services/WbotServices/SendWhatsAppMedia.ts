import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import mime from "mime-types";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

// Função para comprimir vídeo com progresso
const compressVideo = (inputPath: string, outputPath: string, ticketId: number, socketIo?: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size('480x?')
      .videoBitrate('500k')
      .audioBitrate('64k')
      .format('mp4')
      .outputOptions([
        '-movflags', 'faststart',
        '-preset', 'fast',
        '-crf', '28'
      ])
      .on('progress', (progress) => {
        if (socketIo && progress.percent) {
          const percent = Math.round(progress.percent);
          console.log(`Progresso da compressão: ${percent}%`);
          socketIo.emit(`video-compression-progress-${ticketId}`, {
            ticketId,
            progress: percent,
            status: 'compressing'
          });
        }
      })
      .on('end', () => {
        if (socketIo) {
          socketIo.emit(`video-compression-progress-${ticketId}`, {
            ticketId,
            progress: 100,
            status: 'completed'
          });
        }
        resolve();
      })
      .on('error', (err) => {
        if (socketIo) {
          socketIo.emit(`video-compression-progress-${ticketId}`, {
            ticketId,
            progress: 0,
            status: 'error',
            error: err.message
          });
        }
        reject(err);
      })
      .save(outputPath);
  });
};

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<WbotMessage> => {
  let finalMediaPath = media.path;
  let shouldDeleteCompressed = false;

  try {
    const wbot = await GetTicketWbot(ticket);
    
    // Importar socket.io para emitir eventos de progresso
    const { getIO } = require("../../libs/socket");
    const hasBody = body
      ? formatBody(body as string, ticket)
      : undefined;

    // Identificar tipo de mídia
    const isVideo = media.mimetype.startsWith('video/');
    const isAudio = media.mimetype.startsWith('audio/');
    const isImage = media.mimetype.startsWith('image/');
    const fileSizeInMB = media.size / (1024 * 1024);
    
    // Definir limites por tipo de mídia
    let maxSizeForMedia, maxSizeForDocument;
    if (isVideo) {
      maxSizeForMedia = 100; // 100MB para vídeos como mídia
      maxSizeForDocument = 2048; // 2GB para documentos
    } else if (isAudio) {
      maxSizeForMedia = 16; // 16MB para áudios
      maxSizeForDocument = 2048; // 2GB para documentos
    } else if (isImage) {
      maxSizeForMedia = 100; // 100MB para imagens
      maxSizeForDocument = 2048; // 2GB para documentos
    } else {
      maxSizeForMedia = 100; // Padrão para outros tipos
      maxSizeForDocument = 2048; // 2GB para documentos
    }
    
    // Comprimir vídeos grandes
    if (isVideo && fileSizeInMB > 64) {
      console.log(`Vídeo muito grande (${fileSizeInMB.toFixed(2)}MB), comprimindo...`);
      
      const compressedPath = path.join(
        path.dirname(media.path),
        `compressed_${Date.now()}_${media.filename.replace(/\.[^/.]+$/, ".mp4")}`
      );
      
      try {
        const io = getIO();
        
        // Emitir evento de início da compressão
        console.log(`Emitindo evento de início para ticket ${ticket.id}`);
        io.emit(`video-compression-progress-${ticket.id}`, {
          ticketId: ticket.id,
          progress: 0,
          status: 'starting'
        });
        
        await compressVideo(media.path, compressedPath, ticket.id, io);
        finalMediaPath = compressedPath;
        shouldDeleteCompressed = true;
        console.log('Vídeo comprimido com sucesso');
      } catch (compressionError) {
        console.error('Erro na compressão, enviando arquivo original:', compressionError);
      }
    }

    // Verificar tamanho final do arquivo
    const finalStats = fs.statSync(finalMediaPath);
    const finalSizeInMB = finalStats.size / (1024 * 1024);
    
    // Verificar se excede limite máximo absoluto
    if (finalSizeInMB > maxSizeForDocument) {
      throw new AppError(`Arquivo muito grande (${finalSizeInMB.toFixed(2)}MB). Tamanho máximo: ${maxSizeForDocument}MB`);
    }

    console.log(`Enviando arquivo: ${media.filename} (${finalSizeInMB.toFixed(2)}MB)`);
    
    const mimeType = mime.lookup(finalMediaPath) || media.mimetype;
    
    // Determinar método de envio baseado no tamanho e tipo
    let sentMessage;
    let sendAsDocument = false;
    
    // Decidir se deve enviar como documento
    if (finalSizeInMB > maxSizeForMedia) {
      sendAsDocument = true;
      console.log(`Arquivo excede limite de mídia (${maxSizeForMedia}MB), enviando como documento`);
    }
    
    // Para arquivos muito pequenos, sempre enviar como mídia
    if (finalSizeInMB < 1) {
      sendAsDocument = false;
    }
    
    try {
      const fileData = fs.readFileSync(finalMediaPath, { encoding: 'base64' });
      
      // Limite do puppeteer para base64 (aproximadamente 50MB em base64)
      const maxBase64Size = 67000000; // ~50MB
      if (fileData.length > maxBase64Size) {
        throw new AppError(`Arquivo muito grande para processamento (${(fileData.length / 1000000).toFixed(1)}MB em base64). Tente comprimir o arquivo.`);
      }
      
      const newMedia = new MessageMedia(mimeType, fileData, media.filename);
      
      if (sendAsDocument) {
        // Enviar como documento
        sentMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
          newMedia,
          {
            caption: hasBody,
            sendMediaAsDocument: true
          }
        );
      } else {
        // Enviar como mídia normal
        const options: any = {
          caption: hasBody
        };
        
        // Para áudios, usar sendAudioAsVoice
        if (isAudio) {
          options.sendAudioAsVoice = true;
        }
        
        sentMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
          newMedia,
          options
        );
      }
      
    } catch (error) {
      console.error('Erro no envio:', error);
      
      if (error.message && error.message.includes('base64')) {
        throw new AppError("Arquivo muito grande para processamento. Tente um arquivo menor.");
      }
      
      throw new AppError("Erro ao processar arquivo para envio");
    }

    await ticket.update({ lastMessage: body || media.filename });
    
    const messageData = {
      id: sentMessage.id.id,
      ticketId: ticket.id,
      contactId: undefined,
      body: body || media.filename,
      fromMe: true,
      mediaType: media.mimetype.split("/")[0],
      read: true,
      userId: ticket.userId
    };

    const CreateMessageService = require("../MessageServices/CreateMessageService").default;
    
    try {
      await CreateMessageService({ messageData });
    } catch (err) {
      console.error("Erro ao salvar mensagem de mídia no banco de dados:", err);
    }

    // Limpar arquivos
    fs.unlinkSync(media.path);
    if (shouldDeleteCompressed && fs.existsSync(finalMediaPath)) {
      fs.unlinkSync(finalMediaPath);
    }

    return sentMessage;
  } catch (err) {
    console.error("Erro ao enviar mídia:", err);
    
    // Limpar arquivos em caso de erro
    if (fs.existsSync(media.path)) {
      fs.unlinkSync(media.path);
    }
    if (shouldDeleteCompressed && fs.existsSync(finalMediaPath)) {
      fs.unlinkSync(finalMediaPath);
    }
    
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
