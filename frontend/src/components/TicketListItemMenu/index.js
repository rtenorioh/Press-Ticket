import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const ArrowButton = styled(IconButton)(({ theme }) => ({
  padding: 2,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  borderRadius: "50%",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "scale(1.1)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "1rem",
    color: theme.palette.text.secondary,
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(0.75, 2),
  minHeight: 36,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const TicketListItemMenu = ({ ticket, onToggle }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const handleToggle = async (e, field) => {
    if (e) e.stopPropagation();
    setLoading(true);
    try {
      const { data } = await api.put(`/tickets/${ticket.id}/toggle-state`, { field });
      if (onToggle && data.ticket) {
        onToggle(data.ticket);
      }
    } catch (err) {
      if (err?.response?.data?.code === "PIN_LIMIT_REACHED") {
        toastError({ message: t("ticketListMenu.pinLimitReached") });
      } else {
        toastError(err);
      }
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  return (
    <>
      <ArrowButton onClick={handleOpen} size="small">
        <KeyboardArrowDownIcon />
      </ArrowButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              boxShadow: 3,
              borderRadius: 2,
            },
          },
        }}
      >
        {loading ? (
          <MenuItem disabled sx={{ justifyContent: "center", py: 2 }}>
            <CircularProgress size={20} />
          </MenuItem>
        ) : (
          [
            <StyledMenuItem key="pin" onClick={(e) => handleToggle(e, "pinnedChat")}>
              <ListItemIcon>
                {ticket.pinnedChat
                  ? <PushPinIcon fontSize="small" color="primary" />
                  : <PushPinOutlinedIcon fontSize="small" />
                }
              </ListItemIcon>
              <ListItemText
                primary={ticket.pinnedChat
                  ? t("ticketListMenu.unpin")
                  : t("ticketListMenu.pin")
                }
              />
            </StyledMenuItem>,
            <StyledMenuItem key="mute" onClick={(e) => handleToggle(e, "mutedChat")}>
              <ListItemIcon>
                {ticket.mutedChat
                  ? <VolumeUpIcon fontSize="small" color="warning" />
                  : <VolumeOffIcon fontSize="small" />
                }
              </ListItemIcon>
              <ListItemText
                primary={ticket.mutedChat
                  ? t("ticketListMenu.unmute")
                  : t("ticketListMenu.mute")
                }
              />
            </StyledMenuItem>,
            <StyledMenuItem key="favorite" onClick={(e) => handleToggle(e, "favoritedChat")}>
              <ListItemIcon>
                {ticket.favoritedChat
                  ? <FavoriteIcon fontSize="small" color="error" />
                  : <FavoriteBorderIcon fontSize="small" />
                }
              </ListItemIcon>
              <ListItemText
                primary={ticket.favoritedChat
                  ? t("ticketListMenu.unfavorite")
                  : t("ticketListMenu.favorite")
                }
              />
            </StyledMenuItem>,
          ]
        )}
      </Menu>
    </>
  );
};

export default TicketListItemMenu;
