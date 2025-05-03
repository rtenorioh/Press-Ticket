import { Button, Typography, Paper, Box, styled } from "@mui/material";
import PropTypes from "prop-types";
import React, { useRef, useEffect, useCallback } from "react";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MapIcon from "@mui/icons-material/Map";

const Container = styled(Paper)(({ theme }) => ({
  width: "450px",
  maxWidth: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  backgroundColor: theme.palette.background.paper,
  margin: "0 auto",
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  width: "100%",
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 0,
  backgroundColor: "#f5f5f5",
  width: "120px",
  height: "120px",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  marginRight: theme.spacing(2),
}));

const InfoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "hidden",
  alignItems: "center",
  textAlign: "center",
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(1),
}));

const LocationTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1rem",
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(1),
}));

const StyledMapIcon = styled(MapIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: "1.5rem",
}));

const LocationAddress = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  wordBreak: "break-word",
  lineHeight: 1.4,
  fontSize: "0.9rem",
  fontWeight: 500,
  marginBottom: theme.spacing(2),
  flex: 1,
  width: "100%",
  textAlign: "center",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(1),
  textTransform: "uppercase",
  fontWeight: "bold",
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  transition: "all 0.3s ease",
  alignSelf: "center",
  margin: "0 auto",
  display: "flex",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  }
}));

const LocationPreview = ({ image, link, description }) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  
  const handleLocation = useCallback(async () => {
    try {
      if (link) {
        window.open(link, "_blank", "noopener, noreferrer");
      }
    } catch (err) {
      toastError(err);
    }
  }, [link]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const createImageElement = () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      const imgElement = document.createElement('img');
      
      Object.assign(imgElement.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        cursor: 'pointer',
        backgroundColor: '#f5f5f5',
        transition: 'all 0.3s ease'
      });
      
      imgElement.alt = description || t("locationPreview.alt");
      imgElement.onclick = handleLocation;
      imgElement.onerror = () => {
        imgElement.src = "/placeholder-image.png";
      };
      
      if (typeof image === 'string' && image.startsWith('data:image')) {
        imgElement.src = image;
      } else {
        imgElement.src = "/placeholder-image.png";
      }
      
      container.appendChild(imgElement);
    };
    
    createImageElement();
    
    return () => {
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [image, description, t, link, handleLocation]);

  return (
    <Container elevation={2}>
      <ContentContainer>
        <ImageContainer>
          <div
            ref={containerRef}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
          />
        </ImageContainer>
        
        <InfoContainer>
          <TitleContainer>
            <StyledMapIcon />
            <LocationTitle variant="h6">
              {t("locationPreview.title") || "Localização recebida"}
            </LocationTitle>
          </TitleContainer>
          
          <LocationAddress variant="body2">
            {description ? (
              description.split("\\n").map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))
            ) : (
              link && link.includes("maps.google.com/maps?q=") ? (
                (() => {
                  try {
                    const coordsMatch = link.match(/maps\.google\.com\/maps\?q=([\d.-]+)%2C([\d.-]+)/);
                    if (coordsMatch && coordsMatch.length >= 3) {
                      const lat = coordsMatch[1];
                      const lng = coordsMatch[2];
                      return (
                        <Box sx={{ textAlign: 'center', width: '100%' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {t("locationPreview.latitude")}: {lat}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {t("locationPreview.longitude")}: {lng}
                          </Typography>
                        </Box>
                      );
                    }
                    return t("locationPreview.noCoordinates");
                  } catch (error) {
                    return t("locationPreview.noCoordinates");
                  }
                })()
              ) : (
                t("locationPreview.noCoordinates")
              )
            )}
          </LocationAddress>
          
          <StyledButton
            variant="contained"
            onClick={handleLocation}
            disabled={!link}
            startIcon={<LocationOnOutlinedIcon />}
            size="small"
          >
            {t("locationPreview.buttons.view")}
          </StyledButton>
        </InfoContainer>
      </ContentContainer>
    </Container>
  );
};

LocationPreview.propTypes = {
  image: PropTypes.string,
  link: PropTypes.string,
  description: PropTypes.string,
};

LocationPreview.defaultProps = {
  image: null,
  link: null,
  description: "",
};

export default LocationPreview;
