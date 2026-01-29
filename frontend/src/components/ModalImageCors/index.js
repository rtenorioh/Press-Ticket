import React, { useState, useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import { 
  Box, 
  CircularProgress, 
  Dialog, 
  DialogContent, 
  IconButton, 
  Backdrop,
  Fade,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Button
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
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CompareIcon from "@mui/icons-material/Compare";
import CropIcon from "@mui/icons-material/Crop";
import CheckIcon from "@mui/icons-material/Check";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

const ImageThumbnail = styled('img')(({ theme }) => ({
  objectFit: "cover",
  width: 250,
  height: 200,
  borderRadius: 8,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 250,
  height: 200,
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.7)' : 'rgba(240, 240, 240, 0.7)',
  boxShadow: theme.shadows[1],
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

const NavigationButton = styled(({ position, ...props }) => (
  <Tooltip title={props.title} arrow placement={position === 'left' ? 'right' : 'left'}>
    <IconButton {...props} />
  </Tooltip>
))(({ theme, position }) => ({
  position: 'absolute',
  [position]: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  zIndex: 10,
  width: 40,
  height: 40,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 28,
  }
}));

const ModalImageCors = ({ imageUrl, allImages = [], currentIndex = 0, isDeleted = false }) => {
  const { t } = useTranslation();
  const fullscreenRef = useRef(null);
  const imageRef = useRef(null); 
  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");
  const [error, setError] = useState(false);
  const blobUrlRef = useRef("");
  const [open, setOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [compareMode, setCompareMode] = useState(false);
  const [secondImageUrl, setSecondImageUrl] = useState("");
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const hasMultipleImages = Array.isArray(allImages) && allImages.length > 1;
  const currentImageUrl = hasMultipleImages ? allImages[currentImageIndex] : imageUrl;

  useEffect(() => {
    const imgUrl = currentImageUrl || imageUrl;
    
    if (!imgUrl) {
      console.log("[ModalImageCors] URL vazia, abortando");
      return;
    }
    
    setFetching(true);
    setError(false);
    
    const fetchImage = async () => {
      try { 
        const { data, headers } = await api.get(imgUrl, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers["content-type"] })
        );
        if (blobUrlRef.current) {
          window.URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = url;
        setBlobUrl(url);
        setFetching(false);
      } catch (err) {
        console.error("[ModalImageCors] Erro ao carregar imagem:", err);
        console.error("[ModalImageCors] URL da imagem com erro:", imgUrl);
        console.error("[ModalImageCors] Detalhes do erro:", {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          statusText: err.response?.statusText
        });
        setError(true);
        setFetching(false);
      }
    };
    
    fetchImage();
    
    return () => {
      if (blobUrlRef.current) {
        window.URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = "";
      }
    };
  }, [currentImageUrl, imageUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    setOpen(true);
    resetImageView();
  };

  const handleClose = () => {
    setOpen(false);
    if (isFullscreen) {
      exitFullscreen();
    }
    setCropMode(false);
    setCompareMode(false);
  };
  
  const resetImageView = () => {
    setRotation(0);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `image-${currentImageIndex}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const enterFullscreen = () => {
    const element = fullscreenRef.current;
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };
  
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };
  
  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentImageUrl || imageUrl)
      .then(() => {
        setSnackbarMessage(t("modalImageCors.snackbar.copyLinkSuccess"));
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('Erro ao copiar link: ', err);
        setSnackbarMessage(t("modalImageCors.snackbar.copyLinkError"));
        setSnackbarOpen(true);
      });
  };
  
  const handlePreviousImage = () => {
    if (hasMultipleImages) {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1;
      setCurrentImageIndex(newIndex);
      resetImageView();
    }
  };
  
  const handleNextImage = () => {
    if (hasMultipleImages) {
      const newIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0;
      setCurrentImageIndex(newIndex);
      resetImageView();
    }
  };
  
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (!compareMode && hasMultipleImages) {
      const nextIndex = (currentImageIndex + 1) % allImages.length;
      setSecondImageUrl(allImages[nextIndex]);
    }
  };
  
  const toggleCropMode = () => {
    setCropMode(!cropMode);
    if (!cropMode) {
      setCropArea({ x: 0, y: 0, width: 0, height: 0 });
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };
  
  const [cropStartPoint, setCropStartPoint] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  
  const handleCropStart = (e) => {
    if (!cropMode) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return;
    }
    
    setCropStartPoint({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
    setIsCropping(true);
    e.preventDefault();
  };
  
  const handleCropMove = (e) => {
    if (!cropMode || !isCropping) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const currentY = Math.min(Math.max(0, e.clientY - rect.top), rect.height);
    const width = Math.abs(currentX - cropStartPoint.x);
    const height = Math.abs(currentY - cropStartPoint.y);
    const x = Math.min(cropStartPoint.x, currentX);
    const y = Math.min(cropStartPoint.y, currentY);
    
    setCropArea({ x, y, width, height });
    e.preventDefault();
  };
  
  const handleCropEnd = (e) => {
    if (!cropMode) return;
    setIsCropping(false);
    if (e) e.preventDefault();
  };
  
  const applyCrop = () => {
    if (!cropMode || cropArea.width < 10 || cropArea.height < 10) {
      setSnackbarMessage("Selecione uma área válida para recorte");
      setSnackbarOpen(true);
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;
    const realCropX = cropArea.x * scaleX;
    const realCropY = cropArea.y * scaleY;
    const realCropWidth = cropArea.width * scaleX;
    const realCropHeight = cropArea.height * scaleY;
    
    canvas.width = realCropWidth;
    canvas.height = realCropHeight;
    
    ctx.drawImage(
      img,
      realCropX, realCropY, realCropWidth, realCropHeight,
      0, 0, realCropWidth, realCropHeight
    );
    
    try {
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setBlobUrl(croppedImageUrl);
      setCropMode(false);
      setCropArea({ x: 0, y: 0, width: 0, height: 0 });
      setSnackbarMessage(t("modalImageCors.snackbar.cropSuccess"));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao recortar imagem:', error);
      setSnackbarMessage(t("modalImageCors.snackbar.cropError"));
      setSnackbarOpen(true);
    }
  };
  
  const cancelCrop = () => {
    setCropMode(false);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };
  
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3)); 
  };
  
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };
  
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (fetching) {
    return (
      <LoadingContainer>
        <CircularProgress size={40} color="primary" />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <LoadingContainer>
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          {t("modalImageCors.error.loadImage")}
        </Box>
      </LoadingContainer>
    );
  }

  return (
    <>
      <ImageThumbnail 
        src={blobUrl} 
        alt="image" 
        onClick={handleOpen} 
      />
      
      <StyledDialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' }
        }}
      >
        <DialogContent ref={fullscreenRef}>
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
            
            {hasMultipleImages && (
              <NavigationButton 
                position="left" 
                onClick={handlePreviousImage}
                title={t("modalImageCors.navigation.previous")}
              >
                <NavigateBeforeIcon />
              </NavigationButton>
            )}
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: compareMode ? '50%' : '100%',
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
                  src={blobUrl}
                  alt="image"
                  onMouseDown={cropMode ? handleCropStart : handleMouseDown}
                  onMouseMove={cropMode ? handleCropMove : handleMouseMove}
                  onMouseUp={cropMode ? handleCropEnd : handleMouseUp}
                  onMouseLeave={cropMode ? handleCropEnd : handleMouseUp}
                  onWheel={!cropMode ? handleWheel : undefined}
                  sx={{
                    maxWidth: scale === 1 ? (compareMode ? '45vw' : '90vw') : 'none',
                    maxHeight: scale === 1 ? '85vh' : 'none',
                    objectFit: 'contain',
                    borderRadius: 2,
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                    transition: scale === 1 ? 'transform 0.3s ease' : 'none',
                    cursor: cropMode ? 'crosshair' : (scale > 1 ? 'grab' : 'default'),
                    position: 'relative',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    ...(isDragging && !cropMode && { cursor: 'grabbing' }),
                    ...(cropMode && { border: '2px dashed #fff' }),
                    display: 'block',
                  }}
                />
                
                {cropMode && (
                  <>
                    <Box sx={{
                      position: 'absolute',
                      border: '2px solid #2196f3',
                      backgroundColor: 'rgba(33, 150, 243, 0.2)',
                      left: `${cropArea.x}px`,
                      top: `${cropArea.y}px`,
                      width: `${cropArea.width}px`,
                      height: `${cropArea.height}px`,
                      pointerEvents: 'none',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                      zIndex: 5,
                    }} />
                  
                    {!isCropping && cropArea.width > 10 && cropArea.height > 10 && (
                      <Box sx={{
                        position: 'absolute',
                        top: `${cropArea.y + cropArea.height + 10}px`,
                        left: `${cropArea.x + cropArea.width / 2 - 70}px`,
                        display: 'flex',
                        gap: 1,
                        zIndex: 6,
                      }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          onClick={applyCrop}
                          startIcon={<CheckIcon />}
                          sx={{ borderRadius: 20 }}
                        >
                          {t("modalImageCors.button.applyCrop")}
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="inherit" 
                          size="small"
                          onClick={cancelCrop}
                          sx={{ color: 'white', borderColor: 'white', borderRadius: 20 }}
                        >
                          {t("modalImageCors.button.cancelCrop")}
                        </Button>
                      </Box>
                    )}
                    
                    {cropArea.width < 10 && cropArea.height < 10 && (
                      <Box sx={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        zIndex: 6,
                      }}>
                        {t("modalImageCors.dragToCrop")}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
            
            {compareMode && secondImageUrl && (
              <Box sx={{ 
                width: '50%', 
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Box
                  component="img"
                  src={secondImageUrl}
                  alt="comparison image"
                  sx={{
                    maxWidth: '45vw',
                    maxHeight: '85vh',
                    objectFit: 'contain',
                    borderRadius: 2,
                  }}
                />
              </Box>
            )}
            
            {hasMultipleImages && (
              <NavigationButton 
                position="right" 
                onClick={handleNextImage}
                title={t("modalImageCors.navigation.next")}
              >
                <NavigateNextIcon />
              </NavigationButton>
            )}
          </Box>
          
          <ToolBar>
            <Tooltip title={t("modalImageCors.toolBar.rotateLeft")} arrow>
              <ActionButton onClick={handleRotateLeft}>
                <RotateLeftIcon />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={t("modalImageCors.toolBar.rotateRight")} arrow>
              <ActionButton onClick={handleRotateRight}>
                <RotateRightIcon />
              </ActionButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            
            <Tooltip title={t("modalImageCors.toolBar.zoomIn")} arrow>
              <ActionButton onClick={handleZoomIn}>
                <ZoomInIcon />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={t("modalImageCors.toolBar.zoomOut")} arrow>
              <ActionButton onClick={handleZoomOut}>
                <ZoomOutIcon />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={t("modalImageCors.toolBar.resetZoom")} arrow>
              <ActionButton onClick={handleResetZoom}>
                <CropFreeIcon />
              </ActionButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            
            <Tooltip title={isFullscreen ? t("modalImageCors.toolBar.exitFullscreen") : t("modalImageCors.toolBar.fullscreen")} arrow>
              <ActionButton onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={t("modalImageCors.toolBar.copyLink")} arrow>
              <ActionButton onClick={handleCopyLink}>
                <ContentCopyIcon />
              </ActionButton>
            </Tooltip>
            
            {hasMultipleImages && (
              <Tooltip title={compareMode ? t("modalImageCors.toolBar.disableCompare") : t("modalImageCors.toolBar.compareImages")} arrow>
                <ActionButton onClick={toggleCompareMode} color={compareMode ? "primary" : "default"}>
                  <CompareIcon />
                </ActionButton>
              </Tooltip>
            )}
            
            <Tooltip title={cropMode ? t("modalImageCors.toolBar.cancelCrop") : t("modalImageCors.toolBar.cropImage")} arrow>
              <ActionButton onClick={toggleCropMode} color={cropMode ? "primary" : "default"}>
                <CropIcon />
              </ActionButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            
            <Tooltip title={t("modalImageCors.toolBar.downloadImage")} arrow>
              <ActionButton onClick={handleDownload}>
                <DownloadIcon />
              </ActionButton>
            </Tooltip>
          </ToolBar>
          
          {hasMultipleImages && (
            <Box sx={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: 16,
              fontSize: 14,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}>
              {currentImageIndex + 1} / {allImages.length}
            </Box>
          )}
        </DialogContent>
      </StyledDialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%', backgroundColor: '#333', color: 'white' }}
          icon={<CheckIcon />}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ModalImageCors;
