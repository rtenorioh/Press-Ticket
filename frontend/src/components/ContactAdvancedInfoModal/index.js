import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Info as InfoIcon,
  Group as GroupIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import WhatsAppFeaturesService from "../../services/whatsappFeatures";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";
import ConfirmationModal from "../ConfirmationModal";

const ContactAdvancedInfoModal = ({ open, onClose, contactId, whatsappId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [aboutInfo, setAboutInfo] = useState(null);
  const [commonGroups, setCommonGroups] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

  useEffect(() => {
    if (open && contactId) {
      loadContactInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contactId]);

  const loadContactInfo = async () => {
    setLoading(true);
    try {
      const [aboutData, groupsData, contactInfo] = await Promise.allSettled([
        WhatsAppFeaturesService.getContactAbout(whatsappId, contactId),
        WhatsAppFeaturesService.getCommonGroups(whatsappId, contactId),
        WhatsAppFeaturesService.getContactInfo(whatsappId, contactId)
      ]);

      if (aboutData.status === "fulfilled") setAboutInfo(aboutData.value);
      if (groupsData.status === "fulfilled") setCommonGroups(groupsData.value || []);
      if (contactInfo.status === "fulfilled") setIsBlocked(contactInfo.value?.isBlocked || false);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    setBlockLoading(true);
    try {
      if (isBlocked) {
        await WhatsAppFeaturesService.unblockContact(whatsappId, contactId);
        setIsBlocked(false);
        toastSuccess(t("contactActions.unblockSuccess"));
      } else {
        await WhatsAppFeaturesService.blockContact(whatsappId, contactId);
        setIsBlocked(true);
        toastSuccess(t("contactActions.blockSuccess"));
      }
    } catch (err) {
      toastError(err);
    } finally {
      setBlockLoading(false);
      setBlockConfirmOpen(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClose = () => {
    setTabValue(0);
    setAboutInfo(null);
    setCommonGroups([]);
    setIsBlocked(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t("contactActions.info")}
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab icon={<InfoIcon />} label={t("contactActions.about")} />
          <Tab icon={<GroupIcon />} label={t("contactActions.commonGroups")} />
          <Tab icon={<BlockIcon />} label={isBlocked ? t("contactActions.unblock") : t("contactActions.block")} />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Aba Sobre */}
            {tabValue === 0 && (
              <Box>
                {aboutInfo ? (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Nome
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aboutInfo.contactName}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                      Número
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {aboutInfo.contactNumber}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                      Sobre / Status
                    </Typography>
                    <Typography 
                      variant="body1" 
                      gutterBottom
                      sx={{ 
                        fontStyle: aboutInfo.about ? 'normal' : 'italic',
                        color: aboutInfo.about ? 'text.primary' : 'text.secondary'
                      }}
                    >
                      {aboutInfo.about || "Este contato não configurou um status"}
                    </Typography>
                  </>
                ) : (
                  <Typography color="textSecondary">
                    Nenhuma informação disponível
                  </Typography>
                )}
              </Box>
            )}

            {/* Aba Grupos em Comum */}
            {tabValue === 1 && (
              <Box>
                {commonGroups.length > 0 ? (
                  <>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {commonGroups.length} grupo(s) em comum
                    </Typography>
                    <List>
                      {commonGroups.map((group, index) => (
                        <Fragment key={group.id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar src={group.profilePicUrl}>
                                <GroupIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={group.name}
                              secondary={`${group.participantsCount} participantes`}
                            />
                          </ListItem>
                          {index < commonGroups.length - 1 && <Divider variant="inset" component="li" />}
                        </Fragment>
                      ))}
                    </List>
                  </>
                ) : (
                  <Typography color="textSecondary">
                    Nenhum grupo em comum
                  </Typography>
                )}
              </Box>
            )}

            {/* Aba Bloquear/Desbloquear */}
            {tabValue === 2 && (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <BlockIcon sx={{ fontSize: 48, color: isBlocked ? "error.main" : "text.secondary", mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  {isBlocked
                    ? "Este contato está bloqueado. Deseja desbloquear?"
                    : t("contactActions.blockConfirm")}
                </Typography>
                <Button
                  variant="contained"
                  color={isBlocked ? "primary" : "error"}
                  onClick={() => setBlockConfirmOpen(true)}
                  disabled={blockLoading}
                  sx={{ mt: 2 }}
                >
                  {blockLoading ? <CircularProgress size={20} /> : (isBlocked ? t("contactActions.unblock") : t("contactActions.block"))}
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
      <ConfirmationModal
        title={isBlocked ? t("contactActions.unblock") : t("contactActions.block")}
        open={blockConfirmOpen}
        onClose={() => setBlockConfirmOpen(false)}
        onConfirm={handleToggleBlock}
      >
        {isBlocked ? "Deseja desbloquear este contato?" : t("contactActions.blockConfirm")}
      </ConfirmationModal>
    </Dialog>
  );
};

export default ContactAdvancedInfoModal;
