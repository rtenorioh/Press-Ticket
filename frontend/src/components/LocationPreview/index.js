import { Button, Divider, Typography, styled } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

const Container = styled('div')(({ theme }) => ({
  minWidth: "250px",
  display: "flex",
  flexDirection: "column",
}));

const ImageContainer = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const Image = styled('img')(({ theme }) => ({
  width: "100px",
  cursor: "pointer",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const Description = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(1, 2),
  color: theme.palette.text.primary,
  wordBreak: "break-word",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const LocationPreview = ({ image, link, description }) => {
  const { t } = useTranslation();
  const handleLocation = async () => {
    try {
      if (link) {
        window.open(link, "_blank", "noopener, noreferrer");
      }
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Container>
      <ImageContainer>
        <Image
          src={image || "/placeholder-image.png"}
          alt={description || t("locationPreview.alt")}
          onClick={handleLocation}
        />
      </ImageContainer>
      {description && (
        <Description variant="subtitle1">
          {description.split("\\n").map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
        </Description>
      )}
      <Divider />
      <StyledButton
        fullWidth
        color="primary"
        variant="contained"
        onClick={handleLocation}
        disabled={!link}
      >
        {t("locationPreview.buttons.view")}
      </StyledButton>
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
