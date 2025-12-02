import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Checkbox,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  Pagination,
  TableFooter
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Description as DescriptionIcon,
  InsertDriveFile as FileIcon,
  Folder as FolderIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import Title from '../../components/Title';
import api from '../../services/api';
import toastError from '../../errors/toastError';

const FileManager = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    loadStats();
  }, [page]);

  // Limpar blob URL quando fechar o preview
  const handleClosePreview = () => {
    if (previewFile?.blobUrl) {
      window.URL.revokeObjectURL(previewFile.blobUrl);
    }
    setPreviewFile(null);
    setPreviewOpen(false);
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/file-manager/stats', {
        params: { page, limit }
      });
      setStats(data);
      setSelectedFiles([]);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFileIcon = (file) => {
    const iconSx = { mr: 1, fontSize: 20 };
    switch (file.type) {
      case 'image':
        return <ImageIcon sx={iconSx} color="success" />;
      case 'video':
        return <VideoIcon sx={iconSx} color="error" />;
      case 'audio':
        return <AudioIcon sx={iconSx} color="primary" />;
      case 'document':
        return <DescriptionIcon sx={iconSx} color="warning" />;
      default:
        return <FileIcon sx={iconSx} color="action" />;
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedFiles(stats.files.map(file => file.path));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (filePath) => {
    setSelectedFiles(prev => {
      if (prev.includes(filePath)) {
        return prev.filter(p => p !== filePath);
      } else {
        return [...prev, filePath];
      }
    });
  };

  const handlePreview = async (file) => {
    try {
      const response = await api.get('/file-manager/view', {
        params: { filePath: file.path },
        responseType: 'blob'
      });

      const blobUrl = window.URL.createObjectURL(response.data);
      
      setPreviewFile({ ...file, blobUrl });
      setPreviewOpen(true);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDownload = async (filePath) => {
    try {
      const response = await api.get('/file-manager/download', {
        params: { filePath },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filePath.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Arquivo baixado com sucesso!');
    } catch (err) {
      toastError(err);
    }
  };

  const handleDownloadSelected = async () => {
    for (const filePath of selectedFiles) {
      await handleDownload(filePath);
    }
  };

  const handleDeleteSelected = async () => {
    setDeleting(true);
    try {
      const { data } = await api.post('/file-manager/delete', {
        filePaths: selectedFiles
      });

      if (data.deleted.length > 0) {
        toast.success(`${data.deleted.length} arquivo(s) deletado(s) com sucesso!`);
      }

      if (data.errors.length > 0) {
        data.errors.forEach(error => toast.error(error));
      }

      setSelectedFiles([]);
      setDeleteDialogOpen(false);
      
      const remainingFiles = stats.files.length - data.deleted.length;
      if (remainingFiles === 0 && page > 1) {
        setPage(page - 1);
      } else {
        await loadStats();
      }
    } catch (err) {
      toastError(err);
    } finally {
      setDeleting(false);
    }
  };

  const isAllSelected = stats?.files?.length > 0 && selectedFiles.length === stats.files.length;
  const isSomeSelected = selectedFiles.length > 0 && !isAllSelected;

  return (
    <MainContainer>
      <MainHeader>
        <Title>Gerenciador de Arquivos - Pasta Public</Title>
      </MainHeader>

      <Paper 
        sx={{ 
          flex: 1, 
          p: 3, 
          overflowY: 'scroll',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        ) : stats && (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <StorageIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Typography variant="h6" fontWeight="600">
                        Tamanho Total
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {stats.totalSizeFormatted}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {stats.totalSize.toLocaleString()} bytes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <FileIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                      <Typography variant="h6" fontWeight="600">
                        Arquivos
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {stats.total || stats.fileCount}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      total de arquivos
                    </Typography>
                    <Typography variant="caption" display="block" color="primary" mt={1} fontWeight="600">
                      Página {stats.page} de {stats.totalPages}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <FolderIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                      <Typography variant="h6" fontWeight="600">
                        Pastas
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {stats.folderCount}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      total de pastas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                      <Typography variant="h6" fontWeight="600">
                        Selecionados
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {selectedFiles.length}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      arquivo(s) selecionado(s)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {selectedFiles.length > 0 && (
              <Box mt={3}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </Alert>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadSelected}
                    sx={{ mr: 1 }}
                  >
                    Baixar Selecionados
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Deletar Selecionados
                  </Button>
                </Box>
              </Box>
            )}

            <TableContainer component={Paper} sx={{ mt: 3 }} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={isSomeSelected}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Tamanho</TableCell>
                    <TableCell>Modificado</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.files.map((file) => (
                    <TableRow
                      key={file.path}
                      hover
                      sx={{
                        backgroundColor: selectedFiles.includes(file.path) ? 'action.selected' : 'inherit'
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedFiles.includes(file.path)}
                          onChange={() => handleSelectFile(file.path)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getFileIcon(file)}
                          <Typography variant="body2" fontFamily="monospace">
                            {file.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={file.type}
                          size="small"
                          color={
                            file.type === 'image' ? 'success' :
                            file.type === 'video' ? 'error' :
                            file.type === 'document' ? 'warning' :
                            'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{file.sizeFormatted}</TableCell>
                      <TableCell>
                        {new Date(file.modifiedAt).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell align="right">
                        {(file.isImage || file.isVideo || file.type === 'audio') && (
                          <Tooltip title="Visualizar">
                            <IconButton
                              size="small"
                              onClick={() => handlePreview(file)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.light' }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Baixar">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(file.path)}
                            color="primary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deletar">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedFiles([file.path]);
                              setDeleteDialogOpen(true);
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" py={2}>
                        <Typography variant="body2" color="textSecondary">
                          Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, stats.total)} de {stats.total} arquivos
                        </Typography>
                        <Pagination
                          count={stats.totalPages}
                          page={page}
                          onChange={handlePageChange}
                          color="primary"
                          size="large"
                          showFirstButton
                          showLastButton
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewFile?.name}
          <Chip 
            label={previewFile?.type || 'arquivo'} 
            size="small" 
            sx={{ ml: 2 }}
            color={
              previewFile?.isImage ? 'success' : 
              previewFile?.isVideo ? 'error' : 
              previewFile?.type === 'audio' ? 'primary' : 
              'default'
            }
          />
        </DialogTitle>
        <DialogContent>
          {previewFile?.isImage && previewFile?.blobUrl && (
            <Box display="flex" justifyContent="center" p={2}>
              <img
                src={previewFile.blobUrl}
                alt={previewFile.name}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                onError={(e) => {
                  console.error('Erro ao carregar imagem');
                  e.target.src = '';
                  e.target.alt = 'Erro ao carregar imagem';
                }}
              />
            </Box>
          )}
          {previewFile?.isVideo && previewFile?.blobUrl && (
            <Box display="flex" justifyContent="center" p={2}>
              <video
                controls
                autoPlay
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
                onError={(e) => {
                  console.error('Erro ao carregar vídeo');
                }}
              >
                <source src={previewFile.blobUrl} />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </Box>
          )}
          {previewFile?.type === 'audio' && previewFile?.blobUrl && (
            <Box display="flex" flexDirection="column" alignItems="center" p={4}>
              <AudioIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
              <Typography variant="h6" mb={3}>
                {previewFile.name}
              </Typography>
              <audio
                controls
                autoPlay
                style={{ width: '100%', maxWidth: '500px' }}
                onError={(e) => {
                  console.error('Erro ao carregar áudio');
                }}
              >
                <source src={previewFile.blobUrl} />
                Seu navegador não suporta o elemento de áudio.
              </audio>
              <Typography variant="caption" color="textSecondary" mt={2}>
                Tamanho: {previewFile.sizeFormatted}
              </Typography>
            </Box>
          )}
          {!previewFile?.blobUrl && (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          )}
          {!previewFile?.isImage && !previewFile?.isVideo && previewFile?.type !== 'audio' && previewFile?.blobUrl && (
            <Box p={4} textAlign="center">
              <DescriptionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Preview não disponível para este tipo de arquivo
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Use o botão de download para obter o arquivo
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleDownload(previewFile?.path)} 
            color="primary"
            startIcon={<DownloadIcon />}
          >
            Baixar
          </Button>
          <Button onClick={handleClosePreview}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar {selectedFiles.length} arquivo(s)?
          </Typography>
          <Typography variant="caption" color="error" mt={1}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteSelected}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting && <CircularProgress size={20} />}
          >
            {deleting ? 'Deletando...' : 'Deletar'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default FileManager;
