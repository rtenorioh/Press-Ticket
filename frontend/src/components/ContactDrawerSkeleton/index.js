import { Paper, Typography, styled } from "@mui/material";
import { Skeleton } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const Content = styled('div')(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  flexDirection: "column",
  padding: "8px 0px 8px 8px",
  height: "100%",
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const ContactHeader = styled(Paper)(({ theme }) => ({
  display: "flex",
  padding: 8,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "& > *": {
    margin: 4,
  },
}));

const ContactAvatar = styled(Skeleton)(({ theme }) => ({
  margin: 15,
  width: 160,
  height: 160,
  borderRadius: 10,
}));

const ContactDetails = styled(Paper)(({ theme }) => ({
  marginTop: 8,
  padding: 8,
  display: "flex",
  flexDirection: "column",
}));

const ContactExtraInfo = styled(Paper)(({ theme }) => ({
  marginTop: 4,
  padding: 6,
}));

const ContactDrawerSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Content>
      <ContactHeader square variant="outlined">
        <ContactAvatar
          animation="wave"
          variant="circular"
          width={160}
          height={160}
        />
        <Skeleton animation="wave" height={25} width={90} />
        <Skeleton animation="wave" height={25} width={80} />
        <Skeleton animation="wave" height={25} width={80} />
      </ContactHeader>
      <ContactDetails square>
        <Typography variant="subtitle1">
          {t("contactDrawer.extraInfo")}
        </Typography>
        <ContactExtraInfo square variant="outlined">
          <Skeleton animation="wave" height={20} width={60} />
          <Skeleton animation="wave" height={20} width={160} />
        </ContactExtraInfo>
        <ContactExtraInfo square variant="outlined">
          <Skeleton animation="wave" height={20} width={60} />
          <Skeleton animation="wave" height={20} width={160} />
        </ContactExtraInfo>
        <ContactExtraInfo square variant="outlined">
          <Skeleton animation="wave" height={20} width={60} />
          <Skeleton animation="wave" height={20} width={160} />
        </ContactExtraInfo>
      </ContactDetails>
    </Content>
  );
};

export default ContactDrawerSkeleton;
