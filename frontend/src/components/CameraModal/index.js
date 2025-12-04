import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Fab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Close, 
  PhotoCamera, 
  Videocam, 
  Stop, 
  FlipCameraIos,
  CameraAlt
} from '@mui/icons-material';

const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '400px',
  backgroundColor: '#000',
  borderRadius: 8,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const Video = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ControlsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
}));

const CaptureButton = styled(Fab)(({ theme, recording }) => ({
  width: 70,
  height: 70,
  backgroundColor: recording ? theme.palette.error.main : theme.palette.common.white,
  color: recording ? theme.palette.common.white : theme.palette.grey[800],
  '&:hover': {
    backgroundColor: recording ? theme.palette.error.dark : theme.palette.grey[100],
  },
  border: `4px solid ${theme.palette.common.white}`,
}));

const CameraModal = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); 
  const [recordedChunks, setRecordedChunks] = useState([]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        startCamera();
      }, 100);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, facingMode]);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: true
      };

      if (facingMode) {
        constraints.video.facingMode = facingMode;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        try {
          await videoRef.current.play();
        } catch (playError) {
          setTimeout(async () => {
            try {
              await videoRef.current.play();
            } catch (retryError) {
              console.error('Erro na segunda tentativa:', retryError);
            }
          }, 100);
        }
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      let errorMessage = 'Não foi possível acessar a câmera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão da câmera negada. Permita o acesso para continuar.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Configurações da câmera não suportadas pelo dispositivo.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !streamRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture([file]);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const supportedMimeTypes = [
      'video/mp4;codecs=h264',
      'video/mp4',
      'video/webm;codecs=h264',
      'video/webm;codecs=vp8',
      'video/webm'
    ];

    let selectedMimeType = null;
    for (const mimeType of supportedMimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        break;
      }
    }

    if (!selectedMimeType) {
      setError('Formato de vídeo não suportado pelo navegador.');
      return;
    }

    const options = {
      mimeType: selectedMimeType,
      videoBitsPerSecond: 1000000, 
      audioBitsPerSecond: 128000
    };

    try {
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMimeType });
        
        let extension = 'mp4';
        let fileType = 'video/mp4';
        
        if (selectedMimeType.includes('webm')) {
          extension = 'webm';
          fileType = 'video/webm';
        }
        
        const maxSizeBytes = 20 * 1024 * 1024; 
        if (blob.size > maxSizeBytes) {
          setError(`Vídeo muito grande (${(blob.size / 1024 / 1024).toFixed(1)}MB). Máximo permitido: 20MB. Tente gravar um vídeo mais curto.`);
          return;
        }
        
        const file = new File([blob], `video_${Date.now()}.${extension}`, { type: fileType });
        console.log('Vídeo gravado:', {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          type: file.type,
          mimeType: selectedMimeType
        });
        
        onCapture([file]);
        onClose();
      };

      mediaRecorderRef.current.start(1000); 
      setIsRecording(true);
      setRecordedChunks(chunks);
      
      console.log('Gravação iniciada com MIME type:', selectedMimeType);
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      setError('Não foi possível iniciar a gravação.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const switchCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    await startCameraWithMode(newFacingMode);
  };

  const startCameraWithMode = async (mode) => {
    setIsLoading(true);
    setError(null);

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      let errorMessage = 'Não foi possível acessar a câmera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão da câmera negada. Permita o acesso para continuar.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
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
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          <CameraAlt sx={{ mr: 1, verticalAlign: 'middle' }} />
          Câmera
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleClose}
          aria-label="close"
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <VideoContainer>
          {isLoading && (
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <CircularProgress color="inherit" sx={{ mb: 2 }} />
              <Typography>Iniciando câmera...</Typography>
            </Box>
          )}
          
          {error && (
            <Box sx={{ textAlign: 'center', color: 'white', p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>⚠️</Typography>
              <Typography>{error}</Typography>
            </Box>
          )}
          
          {!isLoading && !error && (
            <>
              <Video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onCanPlay={() => {
                  console.log('Video can play');
                }}
                onLoadedData={() => {
                  console.log('Video loaded data');
                }}
              />
              
              <ControlsContainer>
                <IconButton 
                  onClick={switchCamera}
                  sx={{ 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <FlipCameraIos />
                </IconButton>
                
                <CaptureButton
                  recording={isRecording}
                  onClick={isRecording ? stopRecording : capturePhoto}
                  onDoubleClick={!isRecording ? startRecording : undefined}
                >
                  {isRecording ? <Stop /> : <PhotoCamera />}
                </CaptureButton>
                
                <IconButton 
                  onClick={startRecording}
                  disabled={isRecording}
                  sx={{ 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <Videocam />
                </IconButton>
              </ControlsContainer>
            </>
          )}
        </VideoContainer>
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: 'center',
        p: 2,
        backgroundColor: (theme) => theme.palette.grey[50]
      }}>
        <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>
          Clique no botão para tirar foto • Clique no ícone de vídeo para gravar • Duplo clique no botão central para gravar
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

export default CameraModal;
