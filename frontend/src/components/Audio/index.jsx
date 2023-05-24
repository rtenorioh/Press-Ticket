import React, { useRef, useEffect, useState } from "react";

const LS_NAME = 'audioMessageRate';

export default function AudioPlayer({ url }) {
  const audioRef = useRef(null);
  const [audioRate, setAudioRate] = useState(
    parseFloat(localStorage.getItem(LS_NAME) || "1")
  );
  const [showButtonRate, setShowButtonRate] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    audioRef.current.playbackRate = audioRate;
    localStorage.setItem(LS_NAME, audioRate);
  }, [audioRate]);

  useEffect(() => {
    const isDeviceIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isDeviceIOS);

    audioRef.current.addEventListener("play", () => {
      setShowButtonRate(true);
    });
    audioRef.current.addEventListener("pause", () => {
      setShowButtonRate(false);
    });
    audioRef.current.addEventListener("ended", () => {
      setShowButtonRate(false);
    });

    return () => {
      audioRef.current.removeEventListener("play", () => {
        setShowButtonRate(true);
      });
      audioRef.current.removeEventListener("pause", () => {
        setShowButtonRate(false);
      });
      audioRef.current.removeEventListener("ended", () => {
        setShowButtonRate(false);
      });
    };
  }, []);

  const toggleRate = () => {
    let newRate = null;

    switch (audioRate) {
      case 0.5:
        newRate = 1;
        break;
      case 1:
        newRate = 1.5;
        break;
      case 1.5:
        newRate = 2;
        break;
      case 2:
        newRate = 0.5;
        break;
      default:
        newRate = 1;
        break;
    }

    setAudioRate(newRate);
  };

  const playAudio = () => {
    audioRef.current.play();
  };

  return (
    <>
      {isIOS ? (
        <button onClick={playAudio}>Play Audio</button>
      ) : (
        <audio ref={audioRef} controls>
          <source src={url} type="audio/ogg" />
        </audio>
      )}
      {showButtonRate && (
        <button
          style={{ marginLeft: "5px", marginTop: "-45px" }}
          onClick={toggleRate}
        >
          {audioRate}x
        </button>
      )}
    </>
  );
}
