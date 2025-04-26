import React from "react";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";

const MainContainerStyled = styled(Container)(({ theme }) => ({
  flex: 1,
  padding: 0,
  height: "92%",
}));

const ContentWrapper = styled('div')({
  height: "100%",
  overflowY: "hidden",
  display: "flex",
  flexDirection: "column",
});

const MainContainer = ({ children }) => {
  return (
    <MainContainerStyled maxWidth={false}>
      <ContentWrapper>{children}</ContentWrapper>
    </MainContainerStyled>
  );
};

export default MainContainer;
