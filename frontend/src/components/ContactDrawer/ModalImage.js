import React from "react";
import { styled } from "@mui/material/styles";
import ModalImage from "react-modal-image";

const StyledModalImage = styled(ModalImage)(({ theme }) => ({
  objectFit: "cover",
  margin: 15,
  width: 160,
  height: 160,
  borderRadius: 10,
}));
 
const ModalImageContatc = ({ imageUrl }) => {
  const defaultImage = '/default-profile.png';
  const source = imageUrl && imageUrl.trim() !== '' ? imageUrl : defaultImage;
  return (
    <StyledModalImage
      smallSrcSet={source}
      medium={source}
      large={source}
      showRotate="true"
      alt="image"
    />
  );
};

export default ModalImageContatc;
