import React, { useEffect, useMemo, useState } from "react";
import { Paper, Typography, Button, Divider, Stack, Switch, Snackbar, Alert, Tooltip, Grid, Chip, List, ListItem, ListItemIcon, ListItemText, Avatar, TextField, IconButton, Badge, Pagination } from "@mui/material";
import { useTranslation } from "react-i18next";
import GroupService from "../../services/group";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import TitleIcon from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import LogoutIcon from "@mui/icons-material/Logout";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CampaignIcon from "@mui/icons-material/Campaign";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SelectContactsModal from "../SelectContactsModal";

const GroupActionsPanel = ({ groupId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const notify = (message, severity = "success") => setSnack({ open: true, message, severity });
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return participants;
    return participants.filter(p =>
      (p.name || "").toLowerCase().includes(term) ||
      (p.number || "").toLowerCase().includes(term) ||
      (p.about || "").toLowerCase().includes(term)
    );
  }, [search, participants]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginated = filtered.slice(start, end);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const data = await GroupService.listParticipants(groupId);
      setParticipants(data?.participants || []);
    } catch (e) {
      notify(t("groupActions.messages.requestsErr"), "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadParticipants(); }, [groupId]);
  useEffect(() => { setPage(1); }, [search, rowsPerPage]);

  const handleAddParticipants = () => setAddModalOpen(true);

  const handleConfirmAdd = async (contacts) => {
    const participantIds = (contacts || [])
      .map(c => (c.number?.includes("@c.us") ? c.number : `${c.number}@c.us`))
      .filter(Boolean);
    if (!participantIds.length) { setAddModalOpen(false); return; }
    try {
      setLoading(true);
      await GroupService.addParticipants(groupId, participantIds, { autoSendInviteV4: true });
      notify(t("groupActions.messages.addOk"));
      await loadParticipants();
    } catch (e) {
      notify(t("groupActions.messages.addErr"), "error");
    } finally { setLoading(false); setAddModalOpen(false); }
  };

  const handleRemoveParticipants = async () => {
    const ids = window.prompt(t("groupActions.prompts.participantsPlaceholder"));
    if (!ids) return;
    const participantIds = ids.split(',').map(s => s.trim()).filter(Boolean);
    try {
      setLoading(true);
      await GroupService.removeParticipants(groupId, participantIds);
      notify(t("groupActions.messages.removeOk"));
    } catch (e) { notify(t("groupActions.messages.removeErr"), "error"); } finally { setLoading(false); }
  };

  const handlePromote = async () => {
    const ids = window.prompt(t("groupActions.prompts.participantsPlaceholder"));
    if (!ids) return;
    const participantIds = ids.split(',').map(s => s.trim()).filter(Boolean);
    try {
      setLoading(true);
      await GroupService.promoteParticipants(groupId, participantIds);
      notify(t("groupActions.messages.promoteOk"));
    } catch (e) { notify(t("groupActions.messages.promoteErr"), "error"); } finally { setLoading(false); }
  };

  const handleDemote = async () => {
    const ids = window.prompt(t("groupActions.prompts.participantsPlaceholder"));
    if (!ids) return;
    const participantIds = ids.split(',').map(s => s.trim()).filter(Boolean);
    try {
      setLoading(true);
      await GroupService.demoteParticipants(groupId, participantIds);
      notify(t("groupActions.messages.demoteOk"));
    } catch (e) { notify(t("groupActions.messages.demoteErr"), "error"); } finally { setLoading(false); }
  };

  const handleGetInvite = async () => {
    try {
      setLoading(true);
      const { code, link } = await GroupService.getInvite(groupId);
      if (code) {
        await navigator.clipboard.writeText(link);
        notify(t("groupActions.messages.inviteCopied"));
      } else {
        notify(t("groupActions.messages.inviteNone"), "warning");
      }
    } catch (e) { notify(t("groupActions.messages.inviteErr"), "error"); } finally { setLoading(false); }
  };

  const handleRevokeInvite = async () => {
    try {
      setLoading(true);
      const { link } = await GroupService.revokeInvite(groupId);
      await navigator.clipboard.writeText(link);
      notify(t("groupActions.messages.inviteRevoked"));
    } catch (e) { notify(t("groupActions.messages.inviteRevokeErr"), "error"); } finally { setLoading(false); }
  };

  const handleToggleMemberAddMode = async (e) => {
    try {
      setLoading(true);
      await GroupService.setMemberAddMode(groupId, e.target.checked);
      notify(t("groupActions.messages.settingsOk"));
    } catch (err) { notify(t("groupActions.messages.settingsErr"), "error"); } finally { setLoading(false); }
  };

  const handleToggleAnnouncement = async (e) => {
    try {
      setLoading(true);
      await GroupService.setAnnouncement(groupId, e.target.checked);
      notify(t("groupActions.messages.settingsOk"));
    } catch (err) { notify(t("groupActions.messages.settingsErr"), "error"); } finally { setLoading(false); }
  };

  const handleToggleRestrict = async (e) => {
    try {
      setLoading(true);
      await GroupService.setRestrict(groupId, e.target.checked);
      notify(t("groupActions.messages.settingsOk"));
    } catch (err) { notify(t("groupActions.messages.settingsErr"), "error"); } finally { setLoading(false); }
  };

  const handleSetSubject = async () => {
    const subject = window.prompt(t("groupActions.prompts.subject"));
    if (subject == null) return;
    try { setLoading(true); await GroupService.setSubject(groupId, subject); notify(t("groupActions.messages.subjectOk")); }
    catch (e) { notify(t("groupActions.messages.subjectErr"), "error"); } finally { setLoading(false); }
  };

  const handleSetDescription = async () => {
    const description = window.prompt(t("groupActions.prompts.description"));
    if (description == null) return;
    try { setLoading(true); await GroupService.setDescription(groupId, description); notify(t("groupActions.messages.descriptionOk")); }
    catch (e) { notify(t("groupActions.messages.descriptionErr"), "error"); } finally { setLoading(false); }
  };

  const handleSetPicture = async () => {
    const url = window.prompt(t("groupActions.prompts.pictureUrl"));
    if (!url) return;
    try {
      setLoading(true);
      const resp = await fetch(url);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.toString().split(",").pop();
        await GroupService.setPicture(groupId, { data: base64, mimetype: blob.type, filename: "group.jpg" });
        notify(t("groupActions.messages.pictureOk"));
      };
      reader.readAsDataURL(blob);
    } catch (e) { notify(t("groupActions.messages.pictureErr"), "error"); } finally { setLoading(false); }
  };

  const handleDeletePicture = async () => {
    try { setLoading(true); await GroupService.deletePicture(groupId); notify(t("groupActions.messages.pictureDelOk")); }
    catch (e) { notify(t("groupActions.messages.pictureDelErr"), "error"); } finally { setLoading(false); }
  };

  const handleLeave = async () => {
    if (!window.confirm(t("groupActions.confirm.leave"))) return;
    try { setLoading(true); await GroupService.leave(groupId); notify(t("groupActions.messages.leaveOk")); }
    catch (e) { notify(t("groupActions.messages.leaveErr"), "error"); } finally { setLoading(false); }
  };

  const handleListRequests = async () => {
    try {
      setLoading(true);
      const list = await GroupService.listRequests(groupId);
      const summary = (list || []).map(r => `• ${r.id?._serialized || r.id} - ${r.requestMethod} - ${new Date(r.t*1000).toLocaleString()}`).join('\n');
      alert(summary || t("groupActions.messages.noRequests"));
    } catch (e) { notify(t("groupActions.messages.requestsErr"), "error"); } finally { setLoading(false); }
  };

  const handleApproveRequests = async () => {
    const ids = window.prompt(t("groupActions.prompts.requestersPlaceholder"));
    try {
      setLoading(true);
      const options = ids ? { requesterIds: ids.split(',').map(s => s.trim()).filter(Boolean) } : {};
      await GroupService.approveRequests(groupId, options);
      notify(t("groupActions.messages.requestsApproveOk"));
    } catch (e) { notify(t("groupActions.messages.requestsApproveErr"), "error"); } finally { setLoading(false); }
  };

  const handleRejectRequests = async () => {
    const ids = window.prompt(t("groupActions.prompts.requestersPlaceholder"));
    try {
      setLoading(true);
      const options = ids ? { requesterIds: ids.split(',').map(s => s.trim()).filter(Boolean) } : {};
      await GroupService.rejectRequests(groupId, options);
      notify(t("groupActions.messages.requestsRejectOk"));
    } catch (e) { notify(t("groupActions.messages.requestsRejectErr"), "error"); } finally { setLoading(false); }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t("groupActions.title")}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Badge color="primary" badgeContent={participants.length} max={999}>
            <Chip size="small" label={loading ? t("common.loading", { defaultValue: "Carregando" }) : t("common.ready", { defaultValue: "Pronto" })} color={loading ? "default" : "success"} variant="outlined" />
          </Badge>
          <Tooltip title={t("common.refresh", { defaultValue: "Atualizar" })}>
            <span>
              <IconButton size="small" onClick={loadParticipants} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="overline" color="text.secondary">{participants.length} {participants.length === 1 ? "membro" : "membros"}</Typography>
        <TextField size="small" placeholder={t("common.search", { defaultValue: "Buscar" })} value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }} />
      </Stack>
      <List dense sx={{ maxHeight: 220, overflowY: "auto", mb: 1.5 }}>
        {paginated.map(p => (
          <ListItem key={p.id}>
            <ListItemIcon>
              <Avatar src={p.avatar || undefined}>{(p.name || p.number || "?").substring(0,1)}</Avatar>
            </ListItemIcon>
            <ListItemText
              primary={<Stack direction="row" spacing={1} alignItems="center"><span>{p.name || p.number}</span>{p.isSuperAdmin && <Chip size="small" label="Dono" color="success" />}{!p.isSuperAdmin && p.isAdmin && <Chip size="small" label="Admin" color="primary" variant="outlined" />}</Stack>}
              secondary={p.about || p.number}
            />
          </ListItem>
        ))}
      </List>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption">Itens por página:</Typography>
          <TextField
            select
            size="small"
            value={rowsPerPage}
            onChange={e => setRowsPerPage(parseInt(e.target.value, 10))}
            sx={{ width: 88 }}
            SelectProps={{ native: true }}
          >
            {[10, 25, 50, 100].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </TextField>
          <Typography variant="caption">{start + 1}-{Math.min(end, filtered.length)} de {filtered.length}</Typography>
        </Stack>
        <Pagination
          size="small"
          color="primary"
          page={currentPage}
          count={totalPages}
          onChange={(_, value) => setPage(value)}
          siblingCount={0}
          boundaryCount={1}
        />
      </Stack>

      <Typography variant="overline" color="text.secondary">Membros</Typography>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.add")} placement="top">
            <span>
              <Button size="small" variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={handleAddParticipants} disabled={loading}>
                {t("groupActions.buttons.add")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.remove")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<PersonRemoveIcon />} onClick={handleRemoveParticipants} disabled={loading}>
                {t("groupActions.buttons.remove")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <Typography variant="overline" color="text.secondary">Administração</Typography>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.promote")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<ArrowUpwardIcon />} onClick={handlePromote} disabled={loading}>
                {t("groupActions.buttons.promote")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.demote")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<ArrowDownwardIcon />} onClick={handleDemote} disabled={loading}>
                {t("groupActions.buttons.demote")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <Typography variant="overline" color="text.secondary">Convite</Typography>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.getInvite")} placement="top">
            <span>
              <Button size="small" variant="contained" color="secondary" startIcon={<LinkIcon />} onClick={handleGetInvite} disabled={loading}>
                {t("groupActions.buttons.getInvite")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.revokeInvite")} placement="top">
            <span>
              <Button size="small" variant="outlined" color="secondary" startIcon={<LinkOffIcon />} onClick={handleRevokeInvite} disabled={loading}>
                {t("groupActions.buttons.revokeInvite")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <Typography variant="overline" color="text.secondary">Informações</Typography>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.subject")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<TitleIcon />} onClick={handleSetSubject} disabled={loading}>
                {t("groupActions.buttons.subject")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.description")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<DescriptionIcon />} onClick={handleSetDescription} disabled={loading}>
                {t("groupActions.buttons.description")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <Typography variant="overline" color="text.secondary">Foto</Typography>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.setPicture")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<ImageIcon />} onClick={handleSetPicture} disabled={loading}>
                {t("groupActions.buttons.setPicture")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.deletePicture")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<ImageNotSupportedIcon />} onClick={handleDeletePicture} disabled={loading}>
                {t("groupActions.buttons.deletePicture")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="overline" color="text.secondary">Preferências</Typography>
      <List dense>
        <Tooltip title={t("groupActions.switches.memberAddMode")} placement="top-start">
          <ListItem
            secondaryAction={
              <Switch edge="end" onChange={handleToggleMemberAddMode} disabled={loading} />
            }
          >
            <ListItemIcon>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("groupActions.switches.memberAddMode")} />
          </ListItem>
        </Tooltip>

        <Tooltip title={t("groupActions.switches.announcement")} placement="top-start">
          <ListItem
            secondaryAction={
              <Switch edge="end" onChange={handleToggleAnnouncement} disabled={loading} />
            }
          >
            <ListItemIcon>
              <CampaignIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("groupActions.switches.announcement")} />
          </ListItem>
        </Tooltip>

        <Tooltip title={t("groupActions.switches.restrict")} placement="top-start">
          <ListItem
            secondaryAction={
              <Switch edge="end" onChange={handleToggleRestrict} disabled={loading} />
            }
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("groupActions.switches.restrict")} />
          </ListItem>
        </Tooltip>
      </List>

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="overline" color="text.secondary">Solicitações</Typography>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.listRequests")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<ListAltIcon />} onClick={handleListRequests} disabled={loading}>
                {t("groupActions.buttons.listRequests")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.approveRequests")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<CheckCircleIcon />} onClick={handleApproveRequests} disabled={loading}>
                {t("groupActions.buttons.approveRequests")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip title={t("groupActions.buttons.rejectRequests")} placement="top">
            <span>
              <Button size="small" variant="outlined" startIcon={<CancelIcon />} onClick={handleRejectRequests} disabled={loading}>
                {t("groupActions.buttons.rejectRequests")}
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="overline" color="error.main">Zona de risco</Typography>
      <Stack spacing={1} direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Tooltip title={t("groupActions.buttons.leave")} placement="top">
          <span>
            <Button size="small" variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLeave} disabled={loading}>
              {t("groupActions.buttons.leave")}
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <SelectContactsModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onConfirm={handleConfirmAdd}
        title={t("groupActions.selectContacts") || "Selecionar contatos"}
      />

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default GroupActionsPanel;
