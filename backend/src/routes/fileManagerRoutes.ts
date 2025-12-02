import { Router } from 'express';
import * as FileManagerController from '../controllers/FileManagerController';
import isAuth from '../middleware/isAuth';

const fileManagerRoutes = Router();

fileManagerRoutes.get('/file-manager/stats', isAuth, FileManagerController.getPublicFolderStats);
fileManagerRoutes.post('/file-manager/delete', isAuth, FileManagerController.deleteFiles);
fileManagerRoutes.get('/file-manager/download', isAuth, FileManagerController.downloadFile);
fileManagerRoutes.get('/file-manager/view', isAuth, FileManagerController.viewFile);

export default fileManagerRoutes;
