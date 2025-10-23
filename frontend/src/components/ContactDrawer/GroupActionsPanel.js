import React, { useEffect, useMemo, useState } from "react";
import { 
  Paper, 
  Typography, 
  Button, 
  Divider, 
  Stack, 
  Switch, 
  Snackbar, 
  Alert, 
  Tooltip, 
  Chip, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  TextField, 
  IconButton, 
  Badge, 
  Pagination,
  Tabs,
  Tab,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  const [activeTab, setActiveTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

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
      
      const hasAnyAdmin = (data?.participants || []).some(p => p.isAdmin || p.isSuperAdmin);
      
      if (!hasAnyAdmin) {
        setIsAdmin(true);
      } else {
        const myNumber = localStorage.getItem('myWhatsAppNumber');
        let me = myNumber ? (data?.participants || []).find(p => p.number === myNumber) : null;
        
        if (!me && myNumber) {
          me = (data?.participants || []).find(p => 
            p.number?.includes(myNumber) || 
            myNumber.includes(p.number) ||
            p.id?.includes(myNumber)
          );
        }
        
        if (!me) {
          const superAdmins = (data?.participants || []).filter(p => p.isSuperAdmin);
          if (superAdmins.length === 1) {
            setIsAdmin(true);
            return;
          }
        }
        
        const adminStatus = me?.isAdmin || me?.isSuperAdmin || false;
        setIsAdmin(adminStatus);
      }
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
      await loadParticipants();
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
      await loadParticipants();
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
      await loadParticipants();
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
    <Paper variant="outlined" sx={{ p: 0, mt: 2, overflow: 'visible', width: '100%', maxWidth: '100%' }}>
      <Box sx={{ 
        p: 1.5, 
        backgroundColor: 'primary.main', 
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }} noWrap>
            Ações do Grupo
          </Typography>
          {isAdmin && (
            <Chip 
              size="small" 
              label="Admin" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'inherit',
                fontWeight: 600,
                height: 20,
                fontSize: '0.7rem',
                '& .MuiChip-label': { px: 0.75 }
              }} 
            />
          )}
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Badge color="secondary" badgeContent={participants.length} max={99}>
            <Chip 
              size="small" 
              label={loading ? "..." : "OK"} 
              sx={{ 
                backgroundColor: loading ? 'rgba(255,255,255,0.1)' : 'rgba(76, 175, 80, 0.3)',
                color: 'inherit',
                height: 20,
                fontSize: '0.7rem',
                '& .MuiChip-label': { px: 0.75 }
              }} 
            />
          </Badge>
          <Tooltip title="Atualizar">
            <IconButton 
              size="small" 
              onClick={loadParticipants} 
              disabled={loading}
              sx={{ color: 'inherit', p: 0.5 }}
            >
              <RefreshIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      
      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            fontSize: '0.75rem',
            padding: '6px 8px',
            minWidth: 'auto'
          }
        }}
        variant="fullWidth"
      >
        <Tab label="Membros" />
        {isAdmin && <Tab label="Admin" />}
        <Tab label="Info" />
      </Tabs>
      
      <Box sx={{ p: 1.5, maxHeight: 450, overflowY: 'auto' }}>
        {activeTab === 0 && (
          <Box>
            <TextField 
              fullWidth
              size="small" 
              placeholder="Buscar membros..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              InputProps={{ 
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: 'action.active' }} /> 
              }}
              sx={{ mb: 1.5 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {participants.length} {participants.length === 1 ? "membro" : "membros"}
            </Typography>

            <List dense sx={{ maxHeight: 250, overflowY: "auto", mb: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
              {paginated.map(p => (
                <ListItem 
                  key={p.id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar src={p.avatar || undefined} sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                      {(p.name || p.number || "?").substring(0,1).toUpperCase()}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.813rem' }} noWrap>
                          {(p.name || p.number).length > 20 ? (p.name || p.number).substring(0, 20) + '...' : (p.name || p.number)}
                        </Typography>
                        {p.isSuperAdmin && (
                          <Chip size="small" label="Dono" color="success" sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }} />
                        )}
                        {!p.isSuperAdmin && p.isAdmin && (
                          <Chip size="small" label="Admin" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }} />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }} noWrap>
                        {(p.about || p.number).length > 25 ? (p.about || p.number).substring(0, 25) + '...' : (p.about || p.number)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Stack spacing={1} sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Pág:</Typography>
                <TextField
                  select
                  size="small"
                  value={rowsPerPage}
                  onChange={e => setRowsPerPage(parseInt(e.target.value, 10))}
                  sx={{ width: 55, '& .MuiInputBase-input': { py: 0.5, fontSize: '0.75rem' } }}
                  SelectProps={{ native: true }}
                >
                  {[10, 25, 50].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </TextField>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {start + 1}-{Math.min(end, filtered.length)} de {filtered.length}
                </Typography>
              </Stack>
              <Pagination
                size="small"
                color="primary"
                page={currentPage}
                count={totalPages}
                onChange={(_, value) => setPage(value)}
                siblingCount={0}
                boundaryCount={1}
                sx={{ '& .MuiPaginationItem-root': { minWidth: 26, height: 26, fontSize: '0.75rem' } }}
              />
            </Stack>

            <Divider sx={{ my: 1.5 }} />
            
            <Typography variant="caption" sx={{ mb: 1, fontWeight: 600, display: 'block', textTransform: 'uppercase', color: 'text.secondary' }}>Ações</Typography>
            <Stack spacing={0.75}>
              <Button 
                fullWidth
                size="small" 
                variant="contained" 
                startIcon={<LinkIcon fontSize="small" />} 
                onClick={handleGetInvite} 
                disabled={loading}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Copiar Link
              </Button>
              
              {isAdmin && (
                <Button 
                  fullWidth
                  size="small" 
                  variant="contained" 
                  color="primary"
                  startIcon={<PersonAddAlt1Icon fontSize="small" />} 
                  onClick={handleAddParticipants} 
                  disabled={loading}
                  sx={{ fontSize: '0.75rem', py: 0.5 }}
                >
                  Adicionar
                </Button>
              )}
            </Stack>
          </Box>
        )}
        
        {isAdmin && activeTab === 1 && (
          <Box>
            <Accordion defaultExpanded>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.75 } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Gerenciar Membros</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={0.75}>
                  <Button 
                    fullWidth
                    size="small" 
                    variant="outlined" 
                    startIcon={<PersonRemoveIcon />} 
                    onClick={handleRemoveParticipants} 
                    disabled={loading}
                  >
                    Remover Participantes
                  </Button>
                  <Button 
                    fullWidth
                    size="small" 
                    variant="outlined" 
                    startIcon={<ArrowUpwardIcon />} 
                    onClick={handlePromote} 
                    disabled={loading}
                  >
                    Promover a Admin
                  </Button>
                  <Button 
                    fullWidth
                    size="small" 
                    variant="outlined" 
                    startIcon={<ArrowDownwardIcon />} 
                    onClick={handleDemote} 
                    disabled={loading}
                  >
                    Rebaixar Admin
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.75 } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Link de Convite</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={0.75}>
                  <Button 
                    fullWidth
                    size="small" 
                    variant="outlined" 
                    color="secondary" 
                    startIcon={<LinkOffIcon fontSize="small" />} 
                    onClick={handleRevokeInvite} 
                    disabled={loading}
                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                  >
                    Revogar Link
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.75 } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Configurações</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <List dense sx={{ p: 0 }}>
                  <ListItem
                    sx={{ px: 0, py: 0.5 }}
                    secondaryAction={
                      <Switch edge="end" onChange={handleToggleMemberAddMode} disabled={loading} size="small" />
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AdminPanelSettingsIcon sx={{ fontSize: '1.1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Admins adicionam"
                      primaryTypographyProps={{ variant: 'body2', fontSize: '0.75rem' }}
                    />
                  </ListItem>

                  <ListItem
                    sx={{ px: 0, py: 0.5 }}
                    secondaryAction={
                      <Switch edge="end" onChange={handleToggleAnnouncement} disabled={loading} size="small" />
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CampaignIcon sx={{ fontSize: '1.1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Admins enviam"
                      primaryTypographyProps={{ variant: 'body2', fontSize: '0.75rem' }}
                    />
                  </ListItem>

                  <ListItem
                    sx={{ px: 0, py: 0.5 }}
                    secondaryAction={
                      <Switch edge="end" onChange={handleToggleRestrict} disabled={loading} size="small" />
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <EditIcon sx={{ fontSize: '1.1rem' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Admins editam"
                      primaryTypographyProps={{ variant: 'body2', fontSize: '0.75rem' }}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.75 } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Solicitações</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={0.75}>
                  <Button 
                    fullWidth
                    size="small" 
                    variant="outlined" 
                    startIcon={<ListAltIcon fontSize="small" />} 
                    onClick={handleListRequests} 
                    disabled={loading}
                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                  >
                    Listar
                  </Button>
                  <Button 
                    fullWidth
                    size="small" 
                    variant="outlined" 
                    color="success"
                    startIcon={<CheckCircleIcon fontSize="small" />} 
                    onClick={handleApproveRequests} 
                    disabled={loading}
                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                  >
                    Aprovar
                  </Button>
                  <Button 
                    fullWidth
                    size="small" 
                    variant="outlined" 
                    color="error"
                    startIcon={<CancelIcon fontSize="small" />} 
                    onClick={handleRejectRequests} 
                    disabled={loading}
                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                  >
                    Rejeitar
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.75 } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.813rem', color: 'error.main' }}>Zona de Risco</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Button 
                  fullWidth
                  size="small" 
                  variant="outlined" 
                  color="error" 
                  startIcon={<LogoutIcon fontSize="small" />} 
                  onClick={handleLeave} 
                  disabled={loading}
                  sx={{ fontSize: '0.75rem', py: 0.5 }}
                >
                  Sair do Grupo
                </Button>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
        
        {activeTab === (isAdmin ? 2 : 1) && (
          <Box>
            <Accordion defaultExpanded sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.75 } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Informações</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={0.75}>
                  {isAdmin && (
                    <>
                      <Button 
                        fullWidth
                        size="small" 
                        variant="outlined" 
                        startIcon={<TitleIcon fontSize="small" />} 
                        onClick={handleSetSubject} 
                        disabled={loading}
                        sx={{ fontSize: '0.75rem', py: 0.5 }}
                      >
                        Alterar Nome
                      </Button>
                      <Button 
                        fullWidth
                        size="small" 
                        variant="outlined" 
                        startIcon={<DescriptionIcon fontSize="small" />} 
                        onClick={handleSetDescription} 
                        disabled={loading}
                        sx={{ fontSize: '0.75rem', py: 0.5 }}
                      >
                        Alterar Descrição
                      </Button>
                    </>
                  )}
                  {!isAdmin && (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 1.5, display: 'block' }}>
                      Apenas admins podem editar
                    </Typography>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
            
            {isAdmin && (
              <Accordion sx={{ '&:before': { display: 'none' } }}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon fontSize="small" />}
                  sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.75 } }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Foto</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Stack spacing={0.75}>
                    <Button 
                      fullWidth
                      size="small" 
                      variant="outlined" 
                      startIcon={<ImageIcon fontSize="small" />} 
                      onClick={handleSetPicture} 
                      disabled={loading}
                      sx={{ fontSize: '0.75rem', py: 0.5 }}
                    >
                      Alterar Foto
                    </Button>
                    <Button 
                      fullWidth
                      size="small" 
                      variant="outlined" 
                      color="error"
                      startIcon={<ImageNotSupportedIcon fontSize="small" />} 
                      onClick={handleDeletePicture} 
                      disabled={loading}
                      sx={{ fontSize: '0.75rem', py: 0.5 }}
                    >
                      Remover Foto
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}
      </Box>

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
