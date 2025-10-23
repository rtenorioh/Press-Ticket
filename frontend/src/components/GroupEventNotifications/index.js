import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Box,
  Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import useGroupEvents from "../../hooks/useGroupEvents";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: 360,
    maxHeight: 480,
    marginTop: theme.spacing(1),
  },
}));

const EventListItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const GroupEventNotifications = ({ whatsappId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { events, unreadCount, markAsRead, clearEvents, formatEventMessage } = useGroupEvents(whatsappId);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    markAsRead();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClearAll = () => {
    clearEvents();
    handleClose();
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "PARTICIPANT_ADDED":
        return <PersonAddIcon fontSize="small" color="success" />;
      case "PARTICIPANT_REMOVED":
        return <PersonRemoveIcon fontSize="small" color="error" />;
      case "PARTICIPANT_PROMOTED":
        return <ArrowUpwardIcon fontSize="small" color="primary" />;
      case "PARTICIPANT_DEMOTED":
        return <ArrowDownwardIcon fontSize="small" color="warning" />;
      case "GROUP_NAME_CHANGED":
      case "GROUP_DESCRIPTION_CHANGED":
        return <EditIcon fontSize="small" color="info" />;
      case "GROUP_ANNOUNCE_CHANGED":
      case "GROUP_RESTRICT_CHANGED":
        return <SettingsIcon fontSize="small" color="secondary" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Eventos de Grupos
          </Typography>
          {events.length > 0 && (
            <Chip
              label="Limpar Tudo"
              size="small"
              onClick={handleClearAll}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        <Divider />

        {events.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum evento recente
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {events.slice(0, 10).map((event, index) => (
              <React.Fragment key={event.id || index}>
                <EventListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getEventIcon(event.eventType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {formatEventMessage(event)}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {event.createdAt ? formatDistanceToNow(new Date(event.createdAt), {
                          addSuffix: true,
                          locale: ptBR
                        }) : 'Agora'}
                      </Typography>
                    }
                  />
                </EventListItem>
                {index < events.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </StyledMenu>
    </>
  );
};

export default GroupEventNotifications;
