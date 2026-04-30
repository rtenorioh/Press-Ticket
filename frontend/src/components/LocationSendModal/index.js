import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useTranslation } from "react-i18next";
import WhatsAppFeaturesService from "../../services/whatsappFeatures";
import toastError from "../../errors/toastError";
import toastSuccess from "../../errors/toastSuccess";

const LocationSendModal = ({ open, onClose, ticketId }) => {
  const { t } = useTranslation();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        setGettingLocation(false);
      },
      () => {
        setGettingLocation(false);
        toastError(new Error("Não foi possível obter sua localização"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSend = async () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toastError(new Error(t("locationSendModal.invalidCoords")));
      return;
    }

    setLoading(true);
    try {
      await WhatsAppFeaturesService.sendLocation(ticketId, lat, lng, description, address);
      toastSuccess(t("locationSendModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLatitude("");
    setLongitude("");
    setDescription("");
    setAddress("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {t("locationSendModal.title")}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <TextField
              fullWidth
              label={t("locationSendModal.latitude")}
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              type="number"
              inputProps={{ step: "any", min: -90, max: 90 }}
              size="small"
            />
            <TextField
              fullWidth
              label={t("locationSendModal.longitude")}
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              type="number"
              inputProps={{ step: "any", min: -180, max: 180 }}
              size="small"
            />
            <IconButton
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation}
              color="primary"
              title="Usar minha localização"
              sx={{ flexShrink: 0 }}
            >
              {gettingLocation ? <CircularProgress size={24} /> : <MyLocationIcon />}
            </IconButton>
          </Box>
          <TextField
            fullWidth
            label={t("locationSendModal.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
          />
          <TextField
            fullWidth
            label={t("locationSendModal.address")}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t("locationSendModal.cancel")}
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={loading || !latitude || !longitude}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {t("locationSendModal.send")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationSendModal;
