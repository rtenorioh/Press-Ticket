import React, { useState, useRef } from "react";
import { styled } from "@mui/material/styles";
import { 
  Box, 
  Dialog, 
  DialogContent, 
  IconButton, 
  Fade,
  Tooltip,
  Snackbar,
  Alert,
  Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CropFreeIcon from "@mui/icons-material/CropFree";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "react-i18next";

const StyledImage = styled(Box)(({ theme }) => ({
  objectFit: "cover",
  margin: 15,
  width: 160,
  height: 160,
  borderRadius: 10,
  cursor: "pointer",
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    overflow: 'hidden',
    maxWidth: '100vw',
    maxHeight: '100vh',
    margin: 0,
  },
  '& .MuiDialogContent-root': {
    padding: '0 0 20px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }
}));

const ToolBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: -50,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  borderRadius: 24,
  padding: theme.spacing(1, 2),
  zIndex: 10,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  '&.MuiIconButton-root': {
    padding: 8,
  }
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  zIndex: 10,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  }
}));

const ModalImageContatc = ({ imageUrl }) => {
  const { t } = useTranslation();
  const defaultImage = '/default-profile.png';
  const addCacheBuster = (url) => {
    if (!url || url === defaultImage) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };
  const source = imageUrl && imageUrl.trim() !== '' ? addCacheBuster(imageUrl) : defaultImage;
  const [open, setOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const imageRef = useRef(null);
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    resetImageView();
  };
  
  const resetImageView = () => {
    setRotation(0);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };
  
  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };
  
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };
  
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };
  
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    setScale(newScale);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(source)
      .then(() => {
        setSnackbarMessage(t("modalImageContact.snackbar.copyLinkSuccess"));
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('Erro ao copiar link: ', err);
        setSnackbarMessage(t("modalImageContact.snackbar.copyLinkError"));
        setSnackbarOpen(true);
      });
  };
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = source;
    link.download = 'imagem-contato.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      <StyledImage
        component="img"
        src={source}
        alt={t("modalImageContact.alt")}
        onClick={handleOpen}
      />
      
      <StyledDialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        fullScreen={isFullscreen}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <DialogContent>
          <CloseButton onClick={handleClose}>
            <CloseIcon />
          </CloseButton>
          
          <Box
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: '100%',
              height: '100%',
              position: 'relative',
              marginBottom: 0
            }}>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: '100%',
              height: '100%',
              position: 'relative'
            }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  margin: '0 auto',
                }}
              >
                <Box
                  ref={imageRef}
                  component="img"
                  src={source}
                  alt={t("modalImageContact.alt")}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                  sx={{
                    maxWidth: scale === 1 ? '90vw' : 'none',
                    maxHeight: scale === 1 ? '85vh' : 'none',
                    objectFit: 'contain',
                    borderRadius: 2,
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                    transition: scale === 1 ? 'transform 0.3s ease' : 'none',
                    cursor: scale > 1 ? 'grab' : 'default',
                    position: 'relative',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    ...(isDragging && { cursor: 'grabbing' }),
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
          </Box>
          
          <ToolBar>
            <Tooltip title={t("modalImageContact.toolBar.zoomOut")} arrow>
              <ActionButton onClick={handleZoomOut}>
                <ZoomOutIcon />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={t("modalImageContact.toolBar.resetZoom")} arrow>
              <ActionButton onClick={handleResetZoom}>
                <CropFreeIcon />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={t("modalImageContact.toolBar.zoomIn")} arrow>
              <ActionButton onClick={handleZoomIn}>
                <ZoomInIcon />
              </ActionButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            
            <Tooltip title={t("modalImageContact.toolBar.rotateLeft")} arrow>
              <ActionButton onClick={handleRotateLeft}>
                <RotateLeftIcon />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={t("modalImageContact.toolBar.rotateRight")} arrow>
              <ActionButton onClick={handleRotateRight}>
                <RotateRightIcon />
              </ActionButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            
            <Tooltip title={isFullscreen ? t("modalImageContact.toolBar.fullscreenExit") : t("modalImageContact.toolBar.fullscreen")} arrow>
              <ActionButton onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={t("modalImageContact.toolBar.copyLink")} arrow>
              <ActionButton onClick={handleCopyLink}>
                <ContentCopyIcon />
              </ActionButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            
            <Tooltip title={t("modalImageContact.toolBar.download")} arrow>
              <ActionButton onClick={handleDownload}>
                <DownloadIcon />
              </ActionButton>
            </Tooltip>
          </ToolBar>
        </DialogContent>
      </StyledDialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ModalImageContatc;
