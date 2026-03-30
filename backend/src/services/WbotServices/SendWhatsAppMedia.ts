import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import mime from "mime-types";
import path from "path";
import { promisify } from "util";
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";

const writeFileAsync = promisify(fs.writeFile);

import formatBody from "../../helpers/Mustache";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
  mentions?: string[];
  sendAsDocument?: boolean;
}

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

const transcodeAudioToOpus = (inputPath: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec("libopus")
      .audioBitrate("32k") 
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
  body,
  mentions,
  sendAsDocument: forceSendAsDocument
}: Request): Promise<WbotMessage> => {
  let finalMediaPath = media.path;
  let shouldDeleteCompressed = false;

  try {
    const wbot = await GetTicketWbot(ticket);
    
    const getChatId = () => {
      let id = ticket.contact.number;
      if (!id.includes('@')) {
        id = `${id}@${ticket.isGroup ? "g" : "c"}.us`;
      }
      return id;
    };
    
    const chatId = getChatId();
    
    const state = await wbot.getState();
    
    if (state !== 'CONNECTED') {
      throw new AppError('WhatsApp não está conectado. Por favor, reconecte o WhatsApp.');
    }
    
    const lidChatId = `${ticket.contact.number}@lid`;

    const preFn = new Function('pnId', 'lidId', [
      'return (async function() {',
      '  var ids = [pnId, lidId];',
      '  for (var i = 0; i < ids.length; i++) {',
      '    try {',
      '      var wid = window.require("WAWebWidFactory").createWid(ids[i]);',
      '      var chatResult = await window.require("WAWebFindChatAction").findOrCreateLatestChat(wid);',
      '      var chat = chatResult && chatResult.chat ? chatResult.chat : chatResult;',
      '      if (chat) { await window.require("WAWebCmd").Cmd.openChatBottom({ chat: chat }); break; }',
      '    } catch(_) {}',
      '  }',
      '})();'
    ].join('\n'));

    try {
      await (wbot as any).pupPage.evaluate(preFn, chatId, lidChatId);
      await new Promise(r => setTimeout(r, 2000));
    } catch (_) {}

    const sendWithLidFallback = async (media: any, opts: any): Promise<any> => {
      try {
        return await wbot.sendMessage(chatId, media, opts);
      } catch (e: any) {
        const isLidErr = e?.message?.includes("No LID for user") || String(e).includes("No LID for user");
        if (!isLidErr) throw e;
        console.warn(`[LID_FALLBACK_MEDIA] Tentando com WID @lid: ${lidChatId}`);
        return await wbot.sendMessage(lidChatId, media, opts);
      }
    };
    
    const { getIO } = require("../../libs/socket");
    const hasBody = body
      ? formatBody(body as string, ticket)
      : undefined;

    const isVideo = media.mimetype.startsWith('video/');
    const isAudio = media.mimetype.startsWith('audio/');
    const isImage = media.mimetype.startsWith('image/');
    const fileSizeInMB = media.size / (1024 * 1024);
    
    let maxSizeForMedia, maxSizeForDocument;
    if (isVideo) {
      maxSizeForMedia = 100; 
      maxSizeForDocument = 2048; 
    } else if (isAudio) {
      maxSizeForMedia = 100; 
      maxSizeForDocument = 2048; 
    } else if (isImage) {
      maxSizeForMedia = 100; 
      maxSizeForDocument = 2048; 
    } else {
      maxSizeForMedia = 100; 
      maxSizeForDocument = 2048; 
    }
    
    if (isAudio) {
      try {
        const oggOutput = path.join(
          path.dirname(media.path),
          `voice_${Date.now()}_${media.filename.replace(/\.[^/.]+$/, "")}.ogg`
        );
        await transcodeAudioToOpus(media.path, oggOutput);
        finalMediaPath = oggOutput;
        shouldDeleteCompressed = true;
      } catch (audioErr) {
        console.warn("Falha ao transcodificar áudio para Opus. Tentando enviar arquivo original:", audioErr?.message || audioErr);
      }
    }

    if (isVideo && fileSizeInMB > 200) {      
      const compressedPath = path.join(
        path.dirname(media.path),
        `compressed_${Date.now()}_${media.filename.replace(/\.[^/.]+$/, ".mp4")}`
      );
      
      try {
        const io = getIO();
    
        io.emit(`video-compression-progress-${ticket.id}`, {
          ticketId: ticket.id,
          progress: 0,
          status: 'starting'
        });
        
        await compressVideo(media.path, compressedPath, ticket.id, io);
        finalMediaPath = compressedPath;
        shouldDeleteCompressed = true;
      } catch (compressionError) {
        console.error('Erro na compressão, enviando arquivo original:', compressionError);
      }
    }

    const finalStats = fs.statSync(finalMediaPath);
    const finalSizeInMB = finalStats.size / (1024 * 1024);
    
    if (finalSizeInMB > maxSizeForDocument) {
      throw new AppError(`Arquivo muito grande (${finalSizeInMB.toFixed(2)}MB). Tamanho máximo: ${maxSizeForDocument}MB`);
    }
    let mimeType = mime.lookup(finalMediaPath) || media.mimetype;
    
    if (media.filename.toLowerCase().endsWith('.webm') && !mimeType.includes('webm')) {
      mimeType = 'video/webm';
    }
    
    if ((finalMediaPath.toLowerCase().endsWith('.ogg') || finalMediaPath.toLowerCase().endsWith('.opus')) && !mimeType.includes('ogg') && !mimeType.includes('opus')) {
      mimeType = 'audio/ogg';
    }
    let sentMessage;
    let sendAsDocument = false;
    
    if (forceSendAsDocument) {
      sendAsDocument = true;
    } else if (media.mimetype.startsWith('text/')) {
      sendAsDocument = true;
    } else if (finalSizeInMB > maxSizeForMedia) {
      sendAsDocument = true;
    } else if (finalSizeInMB < 1 && !isVideo) {
      sendAsDocument = false;
    }
    
    try {
      const fileData = fs.readFileSync(finalMediaPath, { encoding: 'base64' });
      const maxBase64Size = 140000000; 
      
      if (fileData.length > maxBase64Size) {
        console.log(`Arquivo muito grande para base64: ${(fileData.length / 1000000).toFixed(1)}MB`);
        throw new AppError(`Arquivo muito grande para processamento (${(fileData.length / 1000000).toFixed(1)}MB em base64). Tente comprimir o arquivo ou enviar um arquivo menor.`);
      }
      const sanitizedFilename = media.filename
        .replace(/[^\w\s.-]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 100);
      
      const newMedia = new MessageMedia(mimeType, fileData, sanitizedFilename);
      if (sendAsDocument) {
        try {
          const chat = await wbot.getChatById(chatId);
          await chat.sendStateTyping();
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch (e) {}
        const docOptions: any = {
          caption: hasBody,
          sendMediaAsDocument: true
        };
        if (mentions && mentions.length > 0) {
          docOptions.mentions = mentions;
        }

        try {
          sentMessage = await sendWithLidFallback(newMedia, docOptions);
          
        } catch (docError) {
          console.error('[SendWhatsAppMedia] Erro ao enviar documento:', {
            error: docError.message,
            stack: docError.stack
          });
          throw docError;
        }
      } else {
        const options: any = {
          caption: hasBody
        };
        
        if (isAudio) {
          options.sendAudioAsVoice = true;
        }
        
        if (mentions && mentions.length > 0) {
          options.mentions = mentions;
        }
        try {
          try {
            const chat = await wbot.getChatById(chatId);
            if (isAudio) {
              await chat.sendStateRecording();
            } else {
              await chat.sendStateTyping();
            }
            await new Promise(resolve => setTimeout(resolve, 400));
          } catch (e) {}
          sentMessage = await sendWithLidFallback(newMedia, options);

          try {
            const chat = await wbot.getChatById(chatId);
            await chat.clearState();
          } catch (e) {}
          
        } catch (mediaError) {
          try {
            const chat = await wbot.getChatById(chatId);
            await chat.sendStateTyping();
            await new Promise(resolve => setTimeout(resolve, 400));
          } catch (e) {}
          const fallbackOptions: any = {
            caption: hasBody,
            sendMediaAsDocument: true
          };
          if (mentions && mentions.length > 0) {
            fallbackOptions.mentions = mentions;
          }
          sentMessage = await sendWithLidFallback(newMedia, fallbackOptions);
      
          try {
            const chat = await wbot.getChatById(chatId);
            await chat.clearState();
          } catch (e) {}
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
    await ticket.reload();
    
    let savedFilename = media.filename;
    let downloadSuccess = false;
    
    try {
      const downloadedMedia = await sentMessage.downloadMedia();
      
      if (downloadedMedia && downloadedMedia.data) {
        if (!downloadedMedia.filename) {
          const ext = downloadedMedia.mimetype.split("/")[1].split(";")[0];
          const shortTime = new Date().getTime().toString().slice(-6);
          downloadedMedia.filename = `sent_${shortTime}.${ext}`;
        } else {
          const shortTime = new Date().getTime().toString().slice(-6);
          downloadedMedia.filename = `${shortTime}_${downloadedMedia.filename}`;
        }
        
        const publicPath = path.join(__dirname, "..", "..", "..", "public", downloadedMedia.filename);
        await writeFileAsync(publicPath, downloadedMedia.data, "base64");
        
        if (fs.existsSync(publicPath)) {
          savedFilename = downloadedMedia.filename;
          downloadSuccess = true;
        } else {
          console.error("[SendWhatsAppMedia] ❌ Arquivo NÃO existe no disco após salvar!");
        }
      } else {
        console.warn("[SendWhatsAppMedia] downloadedMedia sem dados");
      }
    } catch (downloadErr) {
      console.error("[SendWhatsAppMedia] Erro ao baixar/salvar mídia enviada:", downloadErr);
    }
    
    if (!downloadSuccess && fs.existsSync(finalMediaPath)) {
      try {
        console.log("[SendWhatsAppMedia] FALLBACK: Copiando arquivo original para /public/");
        const shortTime = new Date().getTime().toString().slice(-6);
        const ext = path.extname(media.originalname || media.filename);
        const baseName = path.basename(media.originalname || media.filename, ext);
        const sanitizedBaseName = baseName.replace(/[^\w\s.-]/g, '_').substring(0, 50);
        savedFilename = `${shortTime}_${sanitizedBaseName}${ext}`;
        
        const publicPath = path.join(__dirname, "..", "..", "..", "public", savedFilename);
        fs.copyFileSync(finalMediaPath, publicPath);
        
        if (fs.existsSync(publicPath)) {
          console.log("[SendWhatsAppMedia] ✅ FALLBACK: Arquivo copiado com sucesso:", savedFilename);
          downloadSuccess = true;
        } else {
          console.error("[SendWhatsAppMedia] ❌ FALLBACK: Falha ao copiar arquivo");
        }
      } catch (copyErr) {
        console.error("[SendWhatsAppMedia] Erro no fallback ao copiar arquivo:", copyErr);
      }
    }
    
    let fileSize = null;
    try {
      const stats = fs.statSync(path.join(__dirname, "..", "..", "..", "public", savedFilename));
      fileSize = stats.size;
    } catch (err) {
      console.warn("[SendWhatsAppMedia] Não foi possível obter tamanho do arquivo:", err?.message);
    }

    const messageData = {
      id: sentMessage.id.id,
      ticketId: ticket.id,
      contactId: undefined,
      body: body || media.filename,
      fromMe: true,
      mediaType: media.mimetype.split("/")[0],
      mediaUrl: savedFilename,
      read: true,
      userId: ticket.userId,
      fileSize: fileSize
    };

    const CreateMessageService = require("../MessageServices/CreateMessageService").default;
    
    try {
      await CreateMessageService({ messageData });
    } catch (err) {
      console.error("Erro ao salvar mensagem de mídia no banco de dados:", err);
    }

    fs.unlinkSync(media.path);
    if (shouldDeleteCompressed && fs.existsSync(finalMediaPath)) {
      fs.unlinkSync(finalMediaPath);
    }

    return sentMessage;
  } catch (err) {
    console.error("Erro ao enviar mídia:", err);
    
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
