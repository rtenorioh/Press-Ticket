import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";

import ModalImage from "react-modal-image";
import api from "../../services/api";

const ModalImageStyled = styled(ModalImage)(({ theme }) => ({
  "& img": {
    objectFit: "cover",
    width: 250,
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  }
}));

const ModalImageCors = ({ imageUrl }) => {
  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (!imageUrl) return;
    const fetchImage = async () => {
      const { data, headers } = await api.get(imageUrl, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([data], { type: headers["content-type"] })
      );
      setBlobUrl(url);
      setFetching(false);
    };
    fetchImage();
  }, [imageUrl]);

  return (
    <ModalImageStyled
      smallSrcSet={fetching ? imageUrl : blobUrl}
      medium={fetching ? imageUrl : blobUrl}
      large={fetching ? imageUrl : blobUrl}
      showRotate="true"
      alt="image"
    />
  );
};

export default ModalImageCors;
