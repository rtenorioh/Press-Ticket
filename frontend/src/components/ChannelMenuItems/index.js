import React from "react";
import { ListItemText, MenuItem, Typography, Box, Divider, Button, useTheme, Chip, IconButton } from "@mui/material";
import { Check, SyncAlt, WhatsApp, Email, Instagram, Telegram, Sms, Facebook, ClearAll } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const ChannelMenuItems = ({
  channels,
  selectedChannelIds = [],
  onChange,
  onClose
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleToggle = (channelId) => {
    const currentIndex = selectedChannelIds.indexOf(channelId);
    const newSelectedChannelIds = [...selectedChannelIds];
    
    if (currentIndex === -1) {
      newSelectedChannelIds.push(channelId);
    } else {
      newSelectedChannelIds.splice(currentIndex, 1);
    }
    
    onChange(newSelectedChannelIds);
  };
  
  const handleSelectAll = () => {
    if (channels?.length > 0) {
      const allChannelIds = channels.map(channel => channel.id);
      onChange(allChannelIds);
    }
  };
  
  const handleClearAll = () => {
    onChange([]);
  };

  const getChannelIcon = (channel) => {
    switch (channel.channel) {
      case "facebook":
        return <Facebook fontSize="small" sx={{ color: "#3b5998" }} />;
      case "instagram":
        return <Instagram fontSize="small" sx={{ color: "#cd486b" }} />;
      case "telegram":
        return <Telegram fontSize="small" sx={{ color: "#85b2ff" }} />;
      case "email":
        return <Email fontSize="small" sx={{ color: "#004f9f" }} />;
      case "webchat":
        return <Sms fontSize="small" sx={{ color: "#EB6D58" }} />;
      case "wwebjs":
        return <WhatsApp fontSize="small" sx={{ color: "#075e54" }} />;
      default:
        return <WhatsApp fontSize="small" sx={{ color: "#075e54" }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONNECTED":
        return "success";
      case "OPENING":
      case "PAIRING":
        return "warning";
      case "qrcode":
        return "info";
      default:
        return "error";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "CONNECTED":
        return "Conectado";
      case "OPENING":
        return "Abrindo";
      case "PAIRING":
        return "Pareando";
      case "qrcode":
        return "QR Code";
      case "DISCONNECTED":
        return "Desconectado";
      default:
        return status;
    }
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: "8px 16px",
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: "bold",
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <SyncAlt fontSize="small" />
          Canais
        </Typography>
        
        <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Button 
            size="small" 
            variant="text" 
            onClick={handleSelectAll}
            sx={{ 
              minWidth: 'auto', 
              padding: '4px 8px',
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}
          >
            {t("all")}
          </Button>
          <IconButton 
            size="small" 
            onClick={handleClearAll}
            sx={{ 
              padding: '4px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
            title="Limpar seleção"
          >
            <ClearAll fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ maxHeight: '300px', overflowY: 'auto', padding: '4px 0' }}>
        {channels?.length > 0 ? (
          channels.map(channel => (
            <MenuItem 
              dense 
              key={channel.id} 
              onClick={() => handleToggle(channel.id)}
              sx={{ 
                borderRadius: theme.shape.borderRadius,
                margin: "4px 8px",
                padding: "8px 12px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'translateX(2px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                {getChannelIcon(channel)}
                <ListItemText 
                  primary={channel.name} 
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    style: { fontWeight: selectedChannelIds.indexOf(channel.id) > -1 ? 'bold' : 'normal' }
                  }}
                />
                <Chip 
                  label={getStatusLabel(channel.status)}
                  color={getStatusColor(channel.status)}
                  size="small"
                  sx={{ 
                    height: '20px',
                    fontSize: '0.65rem',
                    fontWeight: 'bold'
                  }}
                />
                {selectedChannelIds.indexOf(channel.id) > -1 && (
                  <Check fontSize="small" color="primary" sx={{ marginLeft: '4px' }} />
                )}
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled sx={{ margin: "4px 8px" }}>
            <ListItemText primary="Nenhum canal disponível" />
          </MenuItem>
        )}
      </Box>
    </>
  );
};

export default ChannelMenuItems;
