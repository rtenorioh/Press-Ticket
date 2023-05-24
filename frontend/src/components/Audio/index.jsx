import React, { useRef, useEffect, useState } from "react";
import ReactPlayer from "react-player";

const LS_NAME = 'audioMessageRate';

export default function AudioPlayer({ url }) {
  const audioRef = useRef(null);
  const [audioRate, setAudioRate] = useState(
    parseFloat(localStorage.getItem(LS_NAME) || "1")
  );
  const [showButtonRate, setShowButtonRate] = useState(false);

  useEffect(() => {
    audioRef.current.seekTo(0);
    audioRef.current.playbackRate = audioRate;
    localStorage.setItem(LS_NAME, audioRate);
  }, [audioRate]);

  useEffect(() => {
    audioRef.current.wrapper.addEventListener("play", () => {
      setShowButtonRate(true);
    });
    audioRef.current.wrapper.addEventListener("pause", () => {
      setShowButtonRate(false);
    });
    audioRef.current.wrapper.addEventListener("ended", () => {
      setShowButtonRate(false);
    });

    return () => {
      audioRef.current.wrapper.removeEventListener("play", () => {
        setShowButtonRate(true);
      });
      audioRef.current.wrapper.removeEventListener("pause", () => {
        setShowButtonRate(false);
      });
      audioRef.current.wrapper.removeEventListener("ended", () => {
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

  return (
    <>
      <ReactPlayer
        ref={audioRef}
        url={url}
        controls
        width="100%"
        height="auto"
      />
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
