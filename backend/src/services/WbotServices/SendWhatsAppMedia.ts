import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import mime from "mime-types";
import path from "path";
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
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

// Função para transcodificar áudio para voz (OGG/Opus) compatível com WhatsApp
const transcodeAudioToOpus = (inputPath: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec("libopus")
      .audioBitrate("32k") // 16-32 kbps funciona bem; 32k mantém qualidade
      .audioChannels(1)
      .audioFrequency(16000)
      .format("ogg")
      .outputOptions([
        "-application", "voip",
        "-frame_duration", "20",
        "-map_metadata", "-1"
      ])
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
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
      maxSizeForMedia = 100; // 100MB para áudios
      maxSizeForDocument = 2048; // 2GB para documentos
    } else if (isImage) {
      maxSizeForMedia = 100; // 100MB para imagens
      maxSizeForDocument = 2048; // 2GB para documentos
    } else {
      maxSizeForMedia = 100; // Padrão para outros tipos
      maxSizeForDocument = 2048; // 2GB para documentos
    }
    
    // Quando for áudio, tentar transcodificar para OGG/Opus (voz) para compatibilidade
    if (isAudio) {
      try {
        const oggOutput = path.join(
          path.dirname(media.path),
          `voice_${Date.now()}_${media.filename.replace(/\.[^/.]+$/, "")}.ogg`
        );
        await transcodeAudioToOpus(media.path, oggOutput);
        finalMediaPath = oggOutput;
        shouldDeleteCompressed = true;
        console.log("Áudio transcodificado para OGG/Opus (voz)");
      } catch (audioErr) {
        console.warn("Falha ao transcodificar áudio para Opus. Tentando enviar arquivo original:", audioErr?.message || audioErr);
      }
    }

    // Comprimir vídeos grandes
    if (isVideo && fileSizeInMB > 200) {
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
    
    // Melhor tratamento do MIME type para vídeos WebM e áudios OGG/Opus
    let mimeType = mime.lookup(finalMediaPath) || media.mimetype;
    
    // Garantir MIME type correto para WebM
    if (media.filename.toLowerCase().endsWith('.webm') && !mimeType.includes('webm')) {
      mimeType = 'video/webm';
    }
    // Garantir MIME type correto para OGG/Opus de voz
    if ((finalMediaPath.toLowerCase().endsWith('.ogg') || finalMediaPath.toLowerCase().endsWith('.opus')) && !mimeType.includes('ogg') && !mimeType.includes('opus')) {
      mimeType = 'audio/ogg';
    }
    
    console.log(`MIME type detectado: ${mimeType}`);
    
    // Determinar método de envio baseado no tamanho e tipo
    let sentMessage;
    let sendAsDocument = false;
    
    // Decidir se deve enviar como documento
    if (finalSizeInMB > maxSizeForMedia) {
      sendAsDocument = true;
      console.log(`Arquivo excede limite de mídia (${maxSizeForMedia}MB), enviando como documento`);
    }
    
    // Remover lógica específica para vídeos da câmera - tratar como qualquer vídeo
    // if (isVideo && media.filename.includes('video_')) {
    //   sendAsDocument = false;
    //   console.log(`Vídeo da câmera detectado (${finalSizeInMB.toFixed(2)}MB), tentando como mídia para ter player`);
    // }
    
    // Para arquivos muito pequenos que não são vídeos, sempre enviar como mídia
    if (finalSizeInMB < 1 && !isVideo) {
      sendAsDocument = false;
    }
    
    try {
      const fileData = fs.readFileSync(finalMediaPath, { encoding: 'base64' });
      
      // Limite do puppeteer para base64 (aproximadamente 100MB em base64)
      const maxBase64Size = 140000000; // ~100MB em base64 (para arquivos até 100MB)
      if (fileData.length > maxBase64Size) {
        console.log(`Arquivo muito grande para base64: ${(fileData.length / 1000000).toFixed(1)}MB`);
        throw new AppError(`Arquivo muito grande para processamento (${(fileData.length / 1000000).toFixed(1)}MB em base64). Tente comprimir o arquivo ou enviar um arquivo menor.`);
      }
      
      console.log(`Criando MessageMedia - Tipo: ${mimeType}, Tamanho base64: ${(fileData.length / 1000000).toFixed(1)}MB`);
      const newMedia = new MessageMedia(mimeType, fileData, media.filename);
      
      if (sendAsDocument) {
        // Enviar como documento
        console.log(`Enviando como documento - Tipo: ${mimeType}`);
        sentMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
          newMedia,
          {
            caption: hasBody,
            sendMediaAsDocument: true
          }
        );
        console.log('Documento enviado com sucesso');
      } else {
        // Enviar como mídia normal com fallback para documento
        const options: any = {
          caption: hasBody
        };
        
        // Para áudios, usar sendAudioAsVoice
        if (isAudio) {
          options.sendAudioAsVoice = true;
        }
        
        try {
          console.log(`Tentando enviar mídia - Tipo: ${mimeType}, Como documento: ${sendAsDocument}`);
          sentMessage = await wbot.sendMessage(
            `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
            newMedia,
            options
          );
          console.log('Mídia enviada com sucesso');
        } catch (mediaError) {
          console.log('Falha ao enviar como mídia, tentando como documento:', mediaError.message);
          // Fallback automático para documento
          sentMessage = await wbot.sendMessage(
            `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
            newMedia,
            {
              caption: hasBody,
              sendMediaAsDocument: true
            }
          );
          console.log('Arquivo enviado como documento (fallback automático)');
        }
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
