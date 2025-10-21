import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  CircularProgress,
  Tooltip,
  LinearProgress,
  ClickAwayListener
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close, Delete, Description, PictureAsPdf, InsertDriveFile, Image, Send, CloudUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import openSocket from '../../services/socket-io';
import api from "../../services/api";

const PreviewContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  position: 'relative',
  height: '300px',
  overflow: 'hidden',
  boxShadow: theme.shadows[1],
}));

const FilePreview = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    maxWidth: '100%',
    maxHeight: '250px',
    objectFit: 'contain',
    borderRadius: 4,
  },
  '& iframe': {
    width: '100%',
    height: '250px',
    border: 'none',
    borderRadius: 4,
  },
  '& object': {
    width: '100%',
    height: '250px',
    border: 'none',
    borderRadius: 4,
  }
}));

const FileListContainer = styled(List)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  maxHeight: '200px',
  overflowY: 'auto',
  marginBottom: theme.spacing(2),
  padding: 0,
  boxShadow: theme.shadows[1],
}));

const FileItemAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200],
  color: theme.palette.primary.main,
  borderRadius: 8,
  width: 40,
  height: 40,
}));

const MentionsListWrapper = styled('ul')(({ theme }) => ({
  margin: 0,
  position: "absolute",
  bottom: "100%",
  background: theme.palette.background.paper,
  padding: 0,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  left: 0,
  width: "100%",
  maxHeight: "200px",
  overflowY: "auto",
  boxShadow: theme.shadows[3],
  zIndex: 1060,
  marginBottom: 8,
  "& li": {
    listStyle: "none",
    "& a": {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px 12px",
      fontSize: '0.9rem',
      color: theme.palette.text.primary,
      borderBottom: `1px solid ${theme.palette.divider}`,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      "&:hover": {
        background: theme.palette.action.hover,
      },
      "& .mention-avatar": {
        width: 36,
        height: 36,
        borderRadius: '50%',
        objectFit: 'cover',
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.9rem',
      },
      "& .mention-info": {
        flex: 1,
        overflow: 'hidden',
        "& .mention-name": {
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        "& .mention-number": {
          fontSize: '0.8rem',
          color: theme.palette.text.secondary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
    },
    "&:last-child a": {
      borderBottom: "none",
    },
  },
  scrollbarWidth: "thin",
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
  },
}));

const getFileIcon = (file) => {
  const fileType = file.type.split('/')[0];
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (fileType === 'image') {
    return <Image />;
  } else if (fileExtension === 'pdf') {
    return <PictureAsPdf />;
  } else if (['doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension)) {
    return <Description />;
  } else {
    return <InsertDriveFile />;
  }
};

const UploadModal = ({ open, onClose, files, onSend, loading, initialCaption }) => {
  const { t } = useTranslation();
  const { ticketId } = useParams();
  const [caption, setCaption] = useState(initialCaption || '');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [localFiles, setLocalFiles] = useState([]);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const captionInputRef = useRef(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionsList, setMentionsList] = useState([]);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [isGroup, setIsGroup] = useState(false);

  const FILE_LIMITS = {
    image: 100,
    video: 100,
    audio: 100,
    document: 2048,
    default: 100
  };

  const getFileType = (file) => {
    const mimeType = file.type.split('/')[0];
    if (mimeType === 'image') return 'image';
    if (mimeType === 'video') return 'video';
    if (mimeType === 'audio') return 'audio';
    return 'document';
  };

  const getFileSizeLimit = (file) => {
    const fileType = getFileType(file);
    return FILE_LIMITS[fileType] || FILE_LIMITS.default;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    const fileSizeMB = file.size / (1024 * 1024);
    const limit = getFileSizeLimit(file);
    const fileType = getFileType(file);
    
    return {
      isValid: fileSizeMB <= limit,
      size: fileSizeMB,
      limit: limit,
      type: fileType,
      message: fileSizeMB > limit 
        ? `Arquivo muito grande. Máximo ${limit}MB para ${fileType === 'document' ? 'documentos' : fileType === 'video' ? 'vídeos' : fileType === 'audio' ? 'áudios' : 'imagens'}`
        : 'OK'
    };
  };

  const shouldCompressVideo = (file) => {
    const fileSizeMB = file.size / (1024 * 1024);
    return getFileType(file) === 'video' && fileSizeMB > 200;
  };

  const sendAsDocument = (file) => {
    const fileType = getFileType(file);
    const mimeType = file.type;
    
    if (fileType === 'document') {
      return true;
    }
    
    if (mimeType.startsWith('text/')) {
      return true;
    }
    
    if (mimeType === 'application/pdf') {
      return true;
    }
    
    return false;
  };

  const handleMentionClick = (participant) => {
    const textBefore = caption.substring(0, mentionStartPos);
    const inputElement = captionInputRef.current?.querySelector('textarea') || captionInputRef.current?.querySelector('input');
    const cursorPos = inputElement?.selectionStart || caption.length;
    const textAfter = caption.substring(cursorPos);
    const newText = `${textBefore}@${participant.number} ${textAfter}`;
    
    setCaption(newText);
    setShowMentions(false);
    setMentionSearch("");
    
    const mentionId = `${participant.number}@c.us`;
    if (!selectedMentions.includes(mentionId)) {
      setSelectedMentions([...selectedMentions, mentionId]);
    }
    
    setTimeout(() => {
      if (inputElement) {
        inputElement.focus();
        const newCursorPos = mentionStartPos + participant.number.length + 2;
        inputElement.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleCaptionChange = (e) => {
    const value = e.target.value;
    setCaption(value);
    
    if (isGroup && mentionsList.length > 0) {
      const inputElement = e.target;
      const cursorPos = inputElement.selectionStart;
      const textBeforeCursor = value.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
          setMentionSearch(textAfterAt.toLowerCase());
          setMentionStartPos(lastAtIndex);
          setShowMentions(true);
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }
    }
  };

  const handleSend = async () => {
    if (localFiles.length === 0) return;
    
    setIsUploading(true);
    const results = [];
    
    const initialProgress = {};
    const initialStatus = {};
    localFiles.forEach((file, index) => {
      initialProgress[index] = 0;
      initialStatus[index] = 'pending';
    });
    setUploadProgress(initialProgress);
    setUploadStatus(initialStatus);

    for (let i = 0; i < localFiles.length; i++) {
      const file = localFiles[i];
      const validation = validateFile(file);
      
      try {
        setUploadStatus(prev => ({ ...prev, [i]: 'uploading' }));
        setUploadProgress(prev => ({ ...prev, [i]: 10 }));

        if (!validation.isValid) {
          throw new Error(validation.message);
        }

        const formData = new FormData();
        formData.append("medias", file);
        
        const fileCaption = (i === 0 || localFiles.length === 1) ? caption.trim() : '';
        if (fileCaption) {
          formData.append("body", fileCaption);
        } else {
          formData.append("body", file.name);
        }
        formData.append("fromMe", true);
        
        if (selectedMentions.length > 0 && (i === 0 || localFiles.length === 1)) {
          formData.append("mentions", JSON.stringify(selectedMentions));
        }

        if (sendAsDocument(file)) {
          formData.append("sendAsDocument", "true");
        }
        if (shouldCompressVideo(file)) {
          formData.append("compressVideo", "true");
        }

        setUploadProgress(prev => ({ ...prev, [i]: 50 }));

        const response = await api.post(`/messages/${ticketId}`, formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [i]: Math.max(50, progress) }));
          }
        });

        setUploadProgress(prev => ({ ...prev, [i]: 100 }));
        setUploadStatus(prev => ({ ...prev, [i]: 'success' }));
        results.push({ file: file.name, status: 'success', response });

      } catch (error) {
        console.error(`Erro ao enviar arquivo ${file.name}:`, error);
        setUploadStatus(prev => ({ ...prev, [i]: 'error' }));
        setUploadProgress(prev => ({ ...prev, [i]: 0 }));
        results.push({ 
          file: file.name, 
          status: 'error', 
          error: error.response?.data?.message || error.message || 'Erro desconhecido'
        });
      }

      if (i < localFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    if (errorCount > 0) {
      console.error(`${errorCount} arquivo(s) falharam no envio`);
      results.filter(r => r.status === 'error').forEach(r => {
        console.error(`${r.file}: ${r.error}`);
      });
    }

    setIsUploading(false);
    
    setTimeout(() => {
      setCaption('');
      setSelectedFileIndex(0);
      setLocalFiles([]);
      setUploadProgress({});
      setUploadStatus({});
      setSelectedMentions([]);
      setShowMentions(false);
      onClose();
    }, 2000);
  };

  useEffect(() => {
    if (initialCaption) {
      setCaption(initialCaption);
    }
  }, [initialCaption]);

  useEffect(() => {
    const fetchTicketInfo = async () => {
      if (!ticketId) return;
      
      try {
        const { data } = await api.get(`/tickets/${ticketId}`);
        const isGroupChat = Boolean(data.contact?.isGroup);
        setIsGroup(isGroupChat);
        
        if (isGroupChat) {
          const gId = data.contact?.number || data.contact?.remoteJid;
          if (gId) {
            try {
              const { data: groupData } = await api.get(`/groups/${encodeURIComponent(gId)}/participants`);
              setMentionsList(groupData.participants || []);
            } catch (err) {
              console.error("Erro ao carregar participantes:", err);
              setMentionsList([]);
            }
          }
        } else {
          setMentionsList([]);
        }
      } catch (err) {
        console.error("Erro ao carregar informações do ticket:", err);
      }
    };
    
    if (open) {
      fetchTicketInfo();
    }
  }, [ticketId, open]);

  React.useEffect(() => {
    if (files && files.length > 0) {
      const filesChanged = files.length !== localFiles.length || 
        files.some((file, index) => localFiles[index] !== file);
      
      if (filesChanged) {
        setLocalFiles(files);
        setSelectedFileIndex(0);
      }
    }
  }, [files, localFiles]);

  React.useEffect(() => {
    if (open && localFiles.length > 0) {
      const focusInput = () => {
        if (captionInputRef.current) {
          const input = captionInputRef.current;
          const inputElement = input.querySelector('textarea') || input.querySelector('input') || input;
          if (inputElement && inputElement.focus) {
            inputElement.focus();
            if (inputElement.value) {
              inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
            }
          }
        }
      };

      focusInput();
      
      const timer1 = setTimeout(focusInput, 50);
      const timer2 = setTimeout(focusInput, 150);
      const timer3 = setTimeout(focusInput, 300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [open, localFiles.length, selectedFileIndex]);

  useEffect(() => {
    if (!ticketId || !open) return;

    const socket = openSocket();
    
    const handleCompressionProgress = (data) => {
      if (data.ticketId === parseInt(ticketId)) {
        setCompressionProgress(data.progress);
        setCompressionStatus(data.status);
        
        if (data.status === 'starting') {
          setIsCompressing(true);
          setCompressionProgress(0);
        } else if (data.status === 'compressing') {
          setIsCompressing(true);
        } else if (data.status === 'completed') {
          setIsCompressing(false);
          setCompressionProgress(100);
          setTimeout(() => {
            setCompressionProgress(0);
            setCompressionStatus('');
          }, 2000);
        } else if (data.status === 'error') {
          setIsCompressing(false);
          setCompressionProgress(0);
          setCompressionStatus('error');
        }
      }
    };

    socket.on(`video-compression-progress-${ticketId}`, handleCompressionProgress);
    

    return () => {
      socket.off(`video-compression-progress-${ticketId}`, handleCompressionProgress);
    };
  }, [ticketId, open]);

  const handleRemoveFile = (index) => {
    const newFiles = [...localFiles];
    newFiles.splice(index, 1);
    setLocalFiles(newFiles);
    
    if (newFiles.length === 0) {
      onClose();
      return;
    }
    
    if (selectedFileIndex >= newFiles.length) {
      setSelectedFileIndex(newFiles.length - 1);
    }
  };

  const fileUrls = React.useMemo(() => {
    return localFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
  }, [localFiles]);

  React.useEffect(() => {
    return () => {
      fileUrls.forEach(item => URL.revokeObjectURL(item.url));
    };
  }, [fileUrls]);

  const renderFilePreview = (file) => {
    const fileType = file.type.split('/')[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileUrl = fileUrls.find(item => item.file === file)?.url;
    
    if (!fileUrl) return null;
    
    if (fileType === 'image') {
      return <img src={fileUrl} alt={file.name} />;
    } else if (fileExtension === 'pdf') {
      return (
        <object 
          data={fileUrl}
          type="application/pdf"
          title={file.name}
        >
          <Typography variant="body2" color="error" sx={{ p: 2 }}>
            {t('uploadModal.pdfError')}
          </Typography>
        </object>
      );
    } else {
      return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Box sx={{ fontSize: 60, mb: 2 }}>
            {getFileIcon(file)}
          </Box>
          <Typography variant="body2" noWrap>
            {file.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {(file.size / 1024).toFixed(2)} KB
          </Typography>
        </Box>
      );
    }
  };

  if (!open || localFiles.length === 0) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      onTransitionEnd={() => {
        if (open && captionInputRef.current) {
          setTimeout(() => {
            const input = captionInputRef.current;
            const inputElement = input.querySelector('textarea') || input.querySelector('input') || input;
            if (inputElement && inputElement.focus) {
              inputElement.focus();
            }
          }, 50);
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          '& .MuiDialogTitle-root': {
            padding: 0,
          }
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: (theme) => theme.palette.primary.main,
          color: (theme) => theme.palette.primary.contrastText,
          p: 0,
          m: 0,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2,
          gap: 1.5 
        }}>
          <CloudUpload fontSize="medium" />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {t('uploadModal.title')}
          </Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
          sx={{ mr: 1 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, mt: 1 }}>
        {localFiles.length > 0 && (
          <>
            <PreviewContainer>
              <FilePreview key={`preview-${selectedFileIndex}`}>
                {renderFilePreview(localFiles[selectedFileIndex])}
              </FilePreview>
            </PreviewContainer>
            
            {localFiles.length > 1 && (
              <FileListContainer>
                {localFiles.map((file, index) => (
                  <ListItem 
                    key={index}
                    button
                    selected={index === selectedFileIndex}
                    onClick={() => setSelectedFileIndex(index)}
                    sx={{
                      borderBottom: (theme) => 
                        index !== localFiles.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                      '&.Mui-selected': {
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                      },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <FileItemAvatar>
                        {getFileIcon(file)}
                      </FileItemAvatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={file.name} 
                      secondary={`${(file.size / 1024).toFixed(2)} KB`}
                      primaryTypographyProps={{ noWrap: true }}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title={t('uploadModal.remove')} arrow>
                        <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </FileListContainer>
            )}
            
            {isCompressing && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                  {compressionStatus === 'starting' && 'Iniciando compressão do vídeo...'}
                  {compressionStatus === 'compressing' && `Comprimindo vídeo... ${compressionProgress}%`}
                  {compressionStatus === 'completed' && 'Compressão concluída!'}
                  {compressionStatus === 'error' && 'Erro na compressão'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={compressionProgress} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: (theme) => theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: (theme) => 
                        compressionStatus === 'error' ? theme.palette.error.main : theme.palette.primary.main,
                    }
                  }}
                />
              </Box>
            )}

            {isUploading && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                  Enviando arquivos...
                </Typography>
                {localFiles.map((file, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" noWrap sx={{ maxWidth: '70%' }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color={
                        uploadStatus[index] === 'success' ? 'success.main' :
                        uploadStatus[index] === 'error' ? 'error.main' :
                        uploadStatus[index] === 'uploading' ? 'primary.main' : 'text.secondary'
                      }>
                        {uploadStatus[index] === 'success' && '✓ Enviado'}
                        {uploadStatus[index] === 'error' && '✗ Erro'}
                        {uploadStatus[index] === 'uploading' && `${uploadProgress[index] || 0}%`}
                        {uploadStatus[index] === 'pending' && 'Aguardando...'}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress[index] || 0}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: (theme) => theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          backgroundColor: (theme) => 
                            uploadStatus[index] === 'success' ? theme.palette.success.main :
                            uploadStatus[index] === 'error' ? theme.palette.error.main :
                            theme.palette.primary.main,
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {localFiles.length > 0 && !isUploading && (
              <Box sx={{ mb: 2 }}>
                {localFiles.map((file, index) => {
                  const validation = validateFile(file);
                  if (!validation.isValid) {
                    return (
                      <Box key={index} sx={{ 
                        p: 1, 
                        mb: 1, 
                        backgroundColor: 'error.light', 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography variant="caption" color="error.contrastText">
                          ⚠️ {file.name}: {validation.message}
                        </Typography>
                      </Box>
                    );
                  }
                  return null;
                })}
              </Box>
            )}

            <Box sx={{ position: 'relative' }}>
              {showMentions && isGroup && (
                <ClickAwayListener onClickAway={() => setShowMentions(false)}>
                  <MentionsListWrapper>
                    {mentionsList
                      .filter(p => {
                        const searchLower = mentionSearch.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(searchLower) ||
                          p.number.includes(mentionSearch)
                        );
                      })
                      .slice(0, 10)
                      .map((participant, index) => {
                        const initial = participant.name ? participant.name.charAt(0).toUpperCase() : '?';
                        return (
                          <li key={index}>
                            <a onClick={() => handleMentionClick(participant)}>
                              {participant.avatar ? (
                                <img 
                                  src={participant.avatar} 
                                  alt={participant.name}
                                  className="mention-avatar"
                                />
                              ) : (
                                <div className="mention-avatar">{initial}</div>
                              )}
                              <div className="mention-info">
                                <div className="mention-name">{participant.name}</div>
                                <div className="mention-number">+{participant.number}</div>
                              </div>
                            </a>
                          </li>
                        );
                      })}
                  </MentionsListWrapper>
                </ClickAwayListener>
              )}
              <TextField
                fullWidth
                label={t('uploadModal.caption')}
                placeholder={t('uploadModal.captionPlaceholder')}
                value={caption}
                onChange={handleCaptionChange}
                variant="outlined"
                inputRef={captionInputRef}
                multiline
                rows={2}
                disabled={isCompressing || isUploading}
                autoFocus={true}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) => theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) => theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  }
                }}
                sx={{
                  mt: 1,
                  '& .MuiInputLabel-root': {
                    color: (theme) => theme.palette.text.secondary,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: (theme) => theme.palette.primary.main,
                  }
                }}
              />
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: 'space-between',
        p: 2,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.grey[50]
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          color="inherit"
          disabled={loading || isCompressing || isUploading}
          sx={{ 
            borderRadius: 20,
            px: 3,
            textTransform: 'uppercase',
            fontWeight: 500
          }}
        >
          {t('uploadModal.cancel')}
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          color="primary"
          disabled={loading || isCompressing || isUploading}
          startIcon={loading || isCompressing || isUploading ? <CircularProgress size={20} /> : <Send />}
          sx={{ 
            borderRadius: 20,
            px: 3,
            textTransform: 'uppercase',
            fontWeight: 500
          }}
        >
          {isCompressing || isUploading ? 'Enviando...' : t('uploadModal.send')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadModal;
