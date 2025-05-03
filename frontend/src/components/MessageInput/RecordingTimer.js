import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";

const TimerBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "6px 12px",
  borderRadius: "18px",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows[2],
  margin: "0 8px",
  gap: "8px",
  animation: "pulse 1.5s infinite",
  "@keyframes pulse": {
    "0%": {
      opacity: 1,
    },
    "50%": {
      opacity: 0.7,
    },
    "100%": {
      opacity: 1,
    },
  },
}));

const TimeText = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "0.9rem",
  letterSpacing: "0.5px",
  fontFamily: "'Roboto Mono', monospace",
}));

const RecordingTimer = () => {
  const initialState = {
    minutes: 0,
    seconds: 0,
  };
  const [timer, setTimer] = useState(initialState);

  useEffect(() => {
    const interval = setInterval(
      () =>
        setTimer(prevState => {
          if (prevState.seconds === 59) {
            return { ...prevState, minutes: prevState.minutes + 1, seconds: 0 };
          }
          return { ...prevState, seconds: prevState.seconds + 1 };
        }),
      1000
    );
    return () => {
      clearInterval(interval);
    };
  }, []);

  const addZero = n => {
    return n < 10 ? "0" + n : n;
  };

  return (
    <TimerBox>
      <MicIcon fontSize="small" />
      <TimeText variant="body2">
        {`${addZero(timer.minutes)}:${addZero(timer.seconds)}`}
      </TimeText>
    </TimerBox>
  );
};

export default RecordingTimer;
