import React, { useState } from "react";
import { Box, IconButton, styled } from "@mui/material";
import { Close, NavigateBefore, NavigateNext } from "@mui/icons-material";

const AlbumContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: "4px",
  maxWidth: "400px",
  cursor: "pointer",
  borderRadius: "8px",
  overflow: "hidden",
  position: "relative",
}));

const AlbumImage = styled("div")(({ theme, gridArea }) => ({
  gridArea: gridArea,
  position: "relative",
  overflow: "hidden",
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
}));

const MoreItemsOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: "32px",
  fontWeight: "bold",
}));

const LightboxOverlay = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const LightboxContent = styled(Box)({
  position: "relative",
  maxWidth: "90vw",
  maxHeight: "90vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const LightboxImage = styled("img")({
  maxWidth: "100%",
  maxHeight: "90vh",
  objectFit: "contain",
});

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  width: "48px",
  height: "48px",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    border: "2px solid rgba(255, 255, 255, 0.5)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "32px",
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 16,
  right: 16,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "#fff",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  width: "48px",
  height: "48px",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    border: "2px solid rgba(255, 255, 255, 0.5)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "28px",
  },
}));

const ImageCounter = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 16,
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: "20px",
  fontSize: "16px",
  fontWeight: "500",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
}));

const AlbumPreview = ({ messages }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!messages || messages.length === 0) return null;

  const imageMessages = messages.filter(msg => msg.mediaType === "image" || msg.mediaType === "video");
  const count = imageMessages.length;

  if (count === 0) return null;

  const getGridTemplate = () => {
    if (count === 1) {
      return {
        gridTemplateColumns: "1fr",
        gridTemplateRows: "300px",
        gridTemplateAreas: '"a"',
      };
    } else if (count === 2) {
      return {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "200px",
        gridTemplateAreas: '"a b"',
      };
    } else if (count === 3) {
      return {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "200px 200px",
        gridTemplateAreas: '"a a" "b c"',
      };
    } else if (count === 4) {
      return {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "200px 200px",
        gridTemplateAreas: '"a b" "c d"',
      };
    } else {
      return {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "200px 200px",
        gridTemplateAreas: '"a b" "c d"',
      };
    }
  };

  const gridAreas = ["a", "b", "c", "d"];
  const gridTemplate = getGridTemplate();
  const displayCount = Math.min(count, 4);

  const handleOpenLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : count - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < count - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <AlbumContainer style={gridTemplate}>
        {imageMessages.slice(0, displayCount).map((message, index) => (
          <AlbumImage
            key={message.id}
            gridArea={gridAreas[index]}
            onClick={() => handleOpenLightbox(index)}
          >
            <img src={message.mediaUrl} alt="" />
            {index === 3 && count > 4 && (
              <MoreItemsOverlay>+{count - 4}</MoreItemsOverlay>
            )}
          </AlbumImage>
        ))}
      </AlbumContainer>

      {lightboxOpen && (
        <LightboxOverlay onClick={handleCloseLightbox}>
          <LightboxContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={handleCloseLightbox}>
              <Close />
            </CloseButton>

            {count > 1 && (
              <>
                <NavigationButton
                  onClick={handlePrevious}
                  style={{ left: 16 }}
                >
                  <NavigateBefore />
                </NavigationButton>

                <NavigationButton
                  onClick={handleNext}
                  style={{ right: 16 }}
                >
                  <NavigateNext />
                </NavigationButton>

                <ImageCounter>
                  {currentIndex + 1} / {count}
                </ImageCounter>
              </>
            )}

            <LightboxImage
              src={imageMessages[currentIndex].mediaUrl}
              alt=""
            />
          </LightboxContent>
        </LightboxOverlay>
      )}
    </>
  );
};

export default AlbumPreview;
