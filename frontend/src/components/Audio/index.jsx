import { Button, Box, styled } from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const LS_NAME = "audioMessageRate";

const AudioContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  width: "100%",
  maxWidth: "400px",
  margin: "8px 0",
}));

const AudioElement = styled("audio")(({ theme }) => ({
  width: "100%",
  borderRadius: theme.shape.borderRadius,
  outline: "none",
}));

const SpeedButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  right: 0,
  bottom: "8px",
  minWidth: "36px",
  padding: "4px 8px",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  fontSize: "0.75rem",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Audio = ({ url }) => {
  const audioRef = useRef(null);
  const [audioRate, setAudioRate] = useState(() =>
    parseFloat(localStorage.getItem(LS_NAME) || "1")
  );
  const [showButtonRate, setShowButtonRate] = useState(false);
  const isIOS = useMemo(
    () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    []
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioRate;
    }
    localStorage.setItem(LS_NAME, audioRate);
  }, [audioRate]);

  useEffect(() => {
    if (!audioRef.current) return;

    const handlePlaying = () => setShowButtonRate(true);
    const handlePause = () => setShowButtonRate(false);
    const handleEnded = () => setShowButtonRate(false);

    const audio = audioRef.current;
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const toggleRate = useCallback(() => {
    const newRate =
      {
        0.5: 1,
        1: 1.5,
        1.5: 2,
        2: 0.5,
      }[audioRate] || 1;

    setAudioRate(newRate);
  }, [audioRate]);

  const getAudioSource = useCallback(() => {
    const sourceUrl = isIOS ? url.replace(".ogg", ".mp3") : url;
    return <source src={sourceUrl} type={isIOS ? "audio/mp3" : "audio/ogg"} />;
  }, [url, isIOS]);

  return (
    <AudioContainer>
      <AudioElement ref={audioRef} controls>
        {getAudioSource()}
      </AudioElement>
      {showButtonRate && (
        <SpeedButton 
          variant="contained" 
          size="small" 
          onClick={toggleRate}
          startIcon={<SpeedIcon fontSize="small" />}
        >
          {audioRate}x
        </SpeedButton>
      )}
    </AudioContainer>
  );
};

export default Audio;
