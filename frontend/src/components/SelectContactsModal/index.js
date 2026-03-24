import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Avatar,
  Stack,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import api from "../../services/api";

const SelectContactsModal = ({ open, onClose, onConfirm, excludeIds = [], title }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState({}); 
  const [error, setError] = useState("");

  const fetchContacts = async (reset = false) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/contacts/", {
        params: { searchParam, pageNumber, isGroup: "false" }
      });
      setContacts(prev => reset ? data.contacts : [...prev, ...data.contacts]);
      setHasMore(Boolean(data.hasMore));
    } catch (e) {
      console.error("[SelectContactsModal] Erro ao buscar contatos:", e);
      setError("Erro ao carregar contatos");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!open) return;
    setContacts([]);
    setPageNumber(1);
    fetchContacts(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = setTimeout(() => fetchContacts(true), 400);
    return () => clearTimeout(h);
  }, [searchParam]);

  useEffect(() => {
    if (!open || pageNumber === 1) return;
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const toggle = (c) => {
    if (!c || excludeIds.includes(c.id)) return;
    setSelected(prev => {
      const clone = { ...prev };
      if (clone[c.id]) delete clone[c.id]; else clone[c.id] = c;
      return clone;
    });
  };

  const filtered = useMemo(() => contacts.filter(c => !excludeIds.includes(c.id)), [contacts, excludeIds]);

  const handleConfirm = () => {
    const list = Object.values(selected);
    onConfirm?.(list);
    setSelected({});
  };

  const handleClose = () => {
    setSelected({});
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      keepMounted
      PaperProps={{ sx: { zIndex: (theme) => (theme.zIndex?.modal || 1300) + 3 } }}
      BackdropProps={{ sx: { zIndex: (theme) => (theme.zIndex?.modal || 1300) + 2 } }}
      TransitionProps={{ timeout: 150 }}
    >
      <DialogTitle>{title || t("groupActions.selectContacts") || "Selecionar contatos"}</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("common.search") || "Buscar"}
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }}
          />
          <Tooltip title={t("common.refresh") || "Atualizar"}>
            <span>
              <IconButton size="small" onClick={() => fetchContacts(true)} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'center', py: 1 }}>
            {error}
          </Typography>
        )}
        <List dense sx={{ maxHeight: 360, overflowY: "auto" }}>
          {filtered.map(c => {
            const checked = Boolean(selected[c.id]);
            return (
              <ListItem key={c.id} button onClick={() => toggle(c)} disabled={excludeIds.includes(c.id)}>
                <ListItemIcon>
                  <Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple />
                </ListItemIcon>
                <Avatar src={c.profilePicUrl || undefined} sx={{ mr: 1 }}>{(c.name || c.number || "?").substring(0,1)}</Avatar>
                <ListItemText
                  primary={c.name || c.number}
                  secondary={c.number}
                />
              </ListItem>
            );
          })}
        </List>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="caption">{Object.keys(selected).length} {t("common.selected") || "selecionados"}</Typography>
          {loading && <CircularProgress size={18} />}
          <Pagination
            size="small"
            color="primary"
            page={pageNumber}
            count={hasMore ? pageNumber + 1 : pageNumber}
            onChange={(_, value) => {
              if (value > pageNumber && hasMore) setPageNumber(value);
              if (value < pageNumber) setPageNumber(value);
            }}
            siblingCount={0}
            boundaryCount={1}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("common.cancel") || "Cancelar"}</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!Object.keys(selected).length}>{t("common.confirm") || "Confirmar"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectContactsModal;
