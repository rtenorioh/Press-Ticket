import React, { useRef, useEffect, useState } from "react";
import { AudioPlayer } from 'mui-audio-player';

const LS_NAME = 'audioMessageRate';

export default function ({ url }) {
    const audioRef = useRef(null);
    const [audioRate] = useState(parseFloat(localStorage.getItem(LS_NAME) || "1"));
    const [,setShowButtonRate] = useState(false);

    useEffect(() => {
        audioRef.current.playbackRate = audioRate;
        localStorage.setItem(LS_NAME, audioRate);
    }, [audioRate]);

    useEffect(() => {
        audioRef.current.onplaying = () => {
            setShowButtonRate(true);
        };
        audioRef.current.onpause = () => {
            setShowButtonRate(false);
        };
        audioRef.current.onended = () => {
            setShowButtonRate(false);
        };
    }, []);

    return (
        <>
            <AudioPlayer
                debug={false}
                width="450px"
                download={true}
                ref={audioRef} controls
                src={url} type="audio/ogg"
                autoPlay={false}
                rounded={true}
                elevation={4}
            />
        </>
    );
}  