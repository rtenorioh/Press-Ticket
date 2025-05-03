import React, { useState, useRef } from 'react';
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
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close, Delete, Description, PictureAsPdf, InsertDriveFile, Image, Send, CloudUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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

const UploadModal = ({ open, onClose, files, onSend, loading }) => {
  const { t } = useTranslation();
  const [caption, setCaption] = useState('');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [localFiles, setLocalFiles] = useState([]);
  const captionInputRef = useRef(null);

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
    if (open && captionInputRef.current) {
      captionInputRef.current.focus();
    }
  }, [open, selectedFileIndex]);

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

  const handleSend = () => {
    onSend(localFiles, caption.trim());
    setCaption('');
    setSelectedFileIndex(0);
    setLocalFiles([]);
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
            
            <TextField
              fullWidth
              label={t('uploadModal.caption')}
              placeholder={t('uploadModal.captionPlaceholder')}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              variant="outlined"
              inputRef={captionInputRef}
              multiline
              rows={2}
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
          disabled={loading}
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          sx={{ 
            borderRadius: 20,
            px: 3,
            textTransform: 'uppercase',
            fontWeight: 500
          }}
        >
          {t('uploadModal.send')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadModal;
