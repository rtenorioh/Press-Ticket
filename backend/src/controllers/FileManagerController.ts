import { Request, Response } from 'express';
import * as FileManagerService from '../services/FileManagerService';
import path from 'path';

export const getPublicFolderStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const stats = await FileManagerService.getPublicFolderStats(page, limit);
    return res.status(200).json(stats);
  } catch (err) {
    console.error('Erro ao obter estatísticas da pasta public:', err);
    return res.status(500).json({ error: 'Erro ao obter estatísticas da pasta public' });
  }
};

export const deleteFiles = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { filePaths } = req.body;

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return res.status(400).json({ error: 'Lista de arquivos inválida' });
    }

    const result = await FileManagerService.deleteFiles(filePaths);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(207).json(result);
    }
  } catch (err) {
    console.error('Erro ao deletar arquivos:', err);
    return res.status(500).json({ error: 'Erro ao deletar arquivos' });
  }
};

export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filePath } = req.query;

    if (!filePath || typeof filePath !== 'string') {
      res.status(400).json({ error: 'Caminho do arquivo inválido' });
      return;
    }

    const fullPath = FileManagerService.getFilePath(filePath);

    if (!fullPath) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }

    const fileName = path.basename(fullPath);
    res.download(fullPath, fileName);
  } catch (err) {
    console.error('Erro ao baixar arquivo:', err);
    res.status(500).json({ error: 'Erro ao baixar arquivo' });
  }
};

export const viewFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filePath } = req.query;

    if (!filePath || typeof filePath !== 'string') {
      res.status(400).json({ error: 'Caminho do arquivo inválido' });
      return;
    }

    const fullPath = FileManagerService.getFilePath(filePath);

    if (!fullPath) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }

    const fs = require('fs');
    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'Arquivo não existe' });
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.mkv': 'video/x-matroska',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.flac': 'audio/flac'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    res.sendFile(fullPath);
  } catch (err) {
    console.error('Erro ao visualizar arquivo:', err);
    res.status(500).json({ error: 'Erro ao visualizar arquivo' });
  }
};
