import { Button } from "@material-ui/core";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const LS_NAME = "audioMessageRate";

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

  const buttonStyle = useMemo(
    () => ({
      marginLeft: "5px",
      marginTop: "-45px",
    }),
    []
  );

  return (
    <>
      <audio ref={audioRef} controls>
        {getAudioSource()}
      </audio>
      {showButtonRate && (
        <Button style={buttonStyle} onClick={toggleRate}>
          {audioRate}x
        </Button>
      )}
    </>
  );
};

export default Audio;
