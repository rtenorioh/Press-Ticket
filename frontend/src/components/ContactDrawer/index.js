import { 
  Drawer, 
  IconButton, 
  InputLabel, 
  Link, 
  Typography, 
  Button, 
  Paper, 
  Divider
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/Auth/AuthContext";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import ContactModal from "../ContactModal";
import CopyToClipboard from "../CopyToClipboard";
import WhatsMarked from "react-whatsmarked";
import { TagsContainer } from "../TagsContainer";
import ModalImageContatc from "./ModalImage";

const drawerWidth = 320;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    display: "flex",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  }
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: "flex",
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  minHeight: "73px",
  justifyContent: "flex-start",
}));

const DrawerContent = styled('div')(({ theme }) => ({
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
  padding: theme.spacing(2),
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  "& > *": {
    margin: theme.spacing(0.5),
  },
}));

const ContactDetails = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
}));

const ContactExtraInfo = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
}));

const ContactDrawer = ({ open, handleDrawerClose, contact, loading }) => {
  const { user } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <StyledDrawer
      variant="persistent"
      anchor="right"
      open={open}
      PaperProps={{ style: { position: "absolute" } }}
      BackdropProps={{ style: { position: "absolute" } }}
      ModalProps={{
        container: document.getElementById("drawer-container"),
        style: { position: "absolute" },
      }}
    >
      <DrawerHeader>
        <IconButton
          color="inherit"
          onClick={handleDrawerClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500 }}>
          {t("contactDrawer.header")}
        </Typography>
      </DrawerHeader>
      {loading ? (
        <ContactDrawerSkeleton />
      ) : (
        <DrawerContent>
          <ContactHeader square variant="outlined">
            <ModalImageContatc imageUrl={contact.profilePicUrl} />
            <Typography>
              {contact.name}
              <CopyToClipboard content={contact.name} color="secondary" />
            </Typography>
            <Typography>
              <Link href={`tel:${user?.isTricked === "enabled" ? contact?.number : contact?.number.slice(0, -4) + "****"}`}>{user?.isTricked === "enabled" ? contact?.number : contact?.number.slice(0, -4) + "****"}</Link>
              <CopyToClipboard content={user?.isTricked === "enabled" ? contact?.number : contact?.number.slice(0, -4) + "****"} color="secondary" />
            </Typography>
            {contact.address && (
              <Typography>
                {contact.address}
                <CopyToClipboard content={contact?.address} color="secondary" />
              </Typography>
            )}
            {contact.email && (
              <Typography>
                <Link href={`mailto:${contact?.email}`}>{contact?.email}</Link>
                <CopyToClipboard content={contact?.email} color="secondary" />
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={() => setModalOpen(true)}
              sx={{
                borderRadius: 20,
                mt: 1,
                backgroundColor: theme => theme.palette.primary.main,
                color: '#fff',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: theme => theme.palette.primary.dark,
                }
              }}
            >
              {t("contactDrawer.buttons.edit")}
            </Button>
          </ContactHeader>
          <TagsContainer contact={contact} sx={{ marginTop: 2 }} />
          <ContactDetails square variant="outlined">
            <ContactModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              contactId={contact.id}
            ></ContactModal>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1.5, mt: 1 }}>
              {t("contactDrawer.extraInfo")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {contact?.extraInfo?.map(info => (
              <ContactExtraInfo
                key={info.id}
                square
                variant="outlined"
              >
                <InputLabel>
                  {info.name}
                  <CopyToClipboard content={info.value} color="secondary" />
                </InputLabel>
                <Typography component="div" noWrap style={{ paddingTop: 2 }}>
                  <WhatsMarked>{info.value}</WhatsMarked>
                </Typography>
              </ContactExtraInfo>
            ))}
          </ContactDetails>
        </DrawerContent>
      )}
    </StyledDrawer>
  );
};

export default ContactDrawer;
