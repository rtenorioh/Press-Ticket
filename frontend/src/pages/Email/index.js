import { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReplyIcon from "@mui/icons-material/Reply";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import InboxIcon from "@mui/icons-material/Inbox";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EditIcon from "@mui/icons-material/Edit";

import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { useContext } from "react";
import EmailComposeModal from "../../components/EmailComposeModal";
import toastError from "../../errors/toastError";

// ─── Styled ──────────────────────────────────────────────────────────────────

const RootBox = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "calc(100vh - 64px)",
  overflow: "hidden",
  backgroundColor: theme.palette.background.default
}));

const Sidebar = styled(Paper)(({ theme }) => ({
  width: 220,
  minWidth: 180,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  borderRadius: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflow: "hidden"
}));

const MiddleCol = styled(Paper)(({ theme }) => ({
  width: 340,
  minWidth: 260,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  borderRadius: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflow: "hidden"
}));

const ViewerCol = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper
}));

const EmailListItem = styled(ListItemButton)(({ theme, unread }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 1.5),
  backgroundColor: unread ? theme.palette.action.hover : "transparent",
  "&:hover": { backgroundColor: theme.palette.action.selected },
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.light + "33"
  }
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const clean = name.trim();
  if (!clean) return "?";
  const parts = clean.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (clean[0] || "?").toUpperCase();
};

const FOLDERS = [
  { key: "inbox", label: "Caixa de Entrada", icon: <InboxIcon fontSize="small" /> },
  { key: "sent", label: "Enviados", icon: <SendIcon fontSize="small" /> },
  { key: "starred", label: "Favoritos", icon: <StarIcon fontSize="small" /> },
  { key: "trash", label: "Lixeira", icon: <DeleteIcon fontSize="small" /> }
];

// ─── Main Component ───────────────────────────────────────────────────────────

const EmailPage = () => {
  const { whatsApps } = useContext(WhatsAppsContext);
  const { socket } = useSocket();

  const emailAccounts = whatsApps.filter(
    (w) => w.type === "email" && w.status === "CONNECTED"
  );

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [emails, setEmails] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [search, setSearch] = useState("");
  const [folderCounts, setFolderCounts] = useState({ inbox: 0, sent: 0, starred: 0, trash: 0 });
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeDefaults, setComposeDefaults] = useState({});

  // Set default account on load
  useEffect(() => {
    if (!selectedAccount && emailAccounts.length > 0) {
      setSelectedAccount(emailAccounts[0]);
    }
  }, [emailAccounts, selectedAccount]);

  // Fetch emails
  const fetchEmails = useCallback(async (accountId, folder, pg = 1) => {
    if (!accountId) return;
    setLoading(true);
    try {
      const params =
        folder === "starred"
          ? { whatsappId: accountId, isStarred: true, page: pg, limit: 30 }
          : { whatsappId: accountId, folder, page: pg, limit: 30 };

      const { data } = await api.get("/emails", { params });

      const list = data.emails || [];
      setEmails(pg === 1 ? list : (prev) => [...prev, ...list]);
      setTotal(data.total || 0);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setEmails([]);
    setSelectedEmail(null);
    setPage(1);
    if (selectedAccount) {
      fetchEmails(selectedAccount.id, activeFolder, 1);
    }
  }, [selectedAccount, activeFolder, fetchEmails]);

  // Fetch folder counts
  const fetchCounts = useCallback(async (accountId) => {
    if (!accountId) return;
    try {
      const { data } = await api.get("/emails/counts", { params: { whatsappId: accountId } });
      setFolderCounts(data);
    } catch (err) {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (selectedAccount) fetchCounts(selectedAccount.id);
  }, [selectedAccount, emails, fetchCounts]);

  // Socket.IO
  useEffect(() => {
    if (!socket || !selectedAccount) return;

    const handleNew = (payload) => {
      if (payload.whatsappId !== selectedAccount.id) return;
      if (activeFolder === "inbox") {
        setEmails((prev) => [payload.email, ...prev]);
      }
      fetchCounts(selectedAccount.id);
    };

    const handleSent = (payload) => {
      if (payload.whatsappId !== selectedAccount.id) return;
      if (activeFolder === "sent") {
        setEmails((prev) => [payload.email, ...prev]);
      }
      fetchCounts(selectedAccount.id);
    };

    socket.on("email:new", handleNew);
    socket.on("email:sent", handleSent);

    return () => {
      socket.off("email:new", handleNew);
      socket.off("email:sent", handleSent);
    };
  }, [socket, selectedAccount, activeFolder, fetchCounts]);

  // Select email → mark read
  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      try {
        await api.put(`/emails/${email.id}`, { isRead: true });
        setEmails((prev) =>
          prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
        );
      } catch (err) {
        /* silent */
      }
    }
  };

  // Toggle starred
  const handleToggleStar = async (e, email) => {
    e.stopPropagation();
    try {
      const newVal = !email.isStarred;
      await api.put(`/emails/${email.id}`, { isStarred: newVal });
      setEmails((prev) =>
        prev.map((em) => (em.id === email.id ? { ...em, isStarred: newVal } : em))
      );
      if (selectedEmail?.id === email.id) {
        setSelectedEmail((prev) => ({ ...prev, isStarred: newVal }));
      }
    } catch (err) {
      toastError(err);
    }
  };

  // Move to trash
  const handleDelete = async (email) => {
    try {
      await api.delete(`/emails/${email.id}`);
      setEmails((prev) => prev.filter((e) => e.id !== email.id));
      if (selectedEmail?.id === email.id) setSelectedEmail(null);
    } catch (err) {
      toastError(err);
    }
  };

  // Compose handlers
  const handleReply = () => {
    if (!selectedEmail) return;
    setComposeDefaults({
      to: selectedEmail.fromAddress,
      subject: selectedEmail.subject ? `Re: ${selectedEmail.subject}` : ""
    });
    setComposeOpen(true);
  };

  const handleForward = () => {
    if (!selectedEmail) return;
    setComposeDefaults({
      to: "",
      subject: selectedEmail.subject ? `Fwd: ${selectedEmail.subject}` : "",
      body: `\n\n--- Encaminhado ---\n${selectedEmail.bodyText || ""}`
    });
    setComposeOpen(true);
  };

  const handleComposeSent = () => {
    if (activeFolder === "sent") {
      fetchEmails(selectedAccount.id, "sent", 1);
    }
  };

  // Filtered list
  const filteredEmails = emails.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (e.subject || "").toLowerCase().includes(q) ||
      (e.fromAddress || "").toLowerCase().includes(q) ||
      (e.toAddress || "").toLowerCase().includes(q)
    );
  });

  // Active folder label
  const activeFolderLabel =
    FOLDERS.find((f) => f.key === activeFolder)?.label || "Email";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <RootBox>
      {/* ── SIDEBAR ── */}
      <Sidebar elevation={0}>
        {/* Account selector */}
        <Box sx={{ p: 1.5, pb: 1 }}>
          {emailAccounts.length > 1 ? (
            <Select
              size="small"
              fullWidth
              value={selectedAccount?.id || ""}
              onChange={(e) => {
                const acc = emailAccounts.find((a) => a.id === e.target.value);
                setSelectedAccount(acc);
              }}
            >
              {emailAccounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.name}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Typography variant="caption" color="text.secondary" noWrap>
              {selectedAccount?.name || "Nenhuma conta"}
            </Typography>
          )}
        </Box>

        {/* Compose button */}
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<EditIcon />}
            onClick={() => { setComposeDefaults({}); setComposeOpen(true); }}
            disabled={!selectedAccount}
            sx={{ borderRadius: 6, textTransform: "none", fontWeight: 600 }}
          >
            Escrever
          </Button>
        </Box>

        <Divider />

        {/* Folder list */}
        <List dense disablePadding sx={{ flex: 1, overflowY: "auto" }}>
          {FOLDERS.map((f) => {
            const count = folderCounts[f.key] || 0;
            const badgeColor = f.key === "inbox" ? "error" : "default";
            return (
              <ListItemButton
                key={f.key}
                selected={activeFolder === f.key}
                onClick={() => setActiveFolder(f.key)}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  my: 0.25,
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": { color: "primary.contrastText" }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{f.icon}</ListItemIcon>
                <ListItemText
                  primary={f.label}
                  primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: activeFolder === f.key ? 700 : 400 }}
                />
                {count > 0 && (
                  <Badge badgeContent={count} color={badgeColor} max={99} />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Sidebar>

      {/* ── EMAIL LIST ── */}
      <MiddleCol elevation={0}>
        {/* Header */}
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            {activeFolderLabel}
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {total > 0 ? `${total} email${total !== 1 ? "s" : ""}` : ""}
            </Typography>
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar por assunto ou remetente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* List */}
        <List disablePadding sx={{ flex: 1, overflowY: "auto" }}>
          {loading && emails.length === 0 ? (
            [...Array(6)].map((_, i) => (
              <Box key={i} sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            ))
          ) : filteredEmails.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 1, color: "text.secondary" }}>
              <MailOutlinedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body2">Nenhum email aqui</Typography>
            </Box>
          ) : (
            filteredEmails.map((email) => (
              <EmailListItem
                key={email.id}
                unread={!email.isRead ? 1 : 0}
                selected={selectedEmail?.id === email.id}
                onClick={() => handleSelectEmail(email)}
              >
                <Box sx={{ width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: "0.7rem", bgcolor: "primary.main" }}>
                      {getInitials(
                        email.contact?.name ||
                        (email.direction === "in" ? email.fromAddress : email.toAddress) ||
                        "?"
                      )}
                    </Avatar>
                    <Typography
                      variant="body2"
                      fontWeight={email.isRead ? 400 : 700}
                      noWrap
                      sx={{ flex: 1 }}
                    >
                      {email.direction === "in"
                        ? (email.contact?.name || email.fromAddress)
                        : `Para: ${email.toAddress}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatDate(email.createdAt)}
                    </Typography>
                    <Tooltip title={email.isStarred ? "Remover favorito" : "Favoritar"}>
                      <IconButton size="small" onClick={(e) => handleToggleStar(e, email)} sx={{ p: 0.25 }}>
                        {email.isStarred
                          ? <StarIcon fontSize="small" sx={{ color: "warning.main" }} />
                          : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={email.isRead ? 400 : 600}
                    noWrap
                    sx={{ pl: 4.5, color: email.isRead ? "text.secondary" : "text.primary" }}
                  >
                    {email.subject ? (
                      <span style={{ fontWeight: email.isRead ? "normal" : "bold" }}>
                        {email.subject}
                      </span>
                    ) : (
                      <span style={{ fontStyle: "italic", color: "#888", fontWeight: email.isRead ? "normal" : "bold" }}>
                        {(email.bodyText || "").substring(0, 60).trim()}
                        {(email.bodyText || "").length > 60 ? "..." : ""}
                      </span>
                    )}
                  </Typography>
                </Box>
              </EmailListItem>
            ))
          )}
        </List>
      </MiddleCol>

      {/* ── VIEWER ── */}
      <ViewerCol>
        {!selectedEmail ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 2, color: "text.secondary" }}>
            <MailOutlinedIcon sx={{ fontSize: 64, opacity: 0.2 }} />
            <Typography variant="h6" color="text.secondary">
              Selecione um email para visualizar
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Email header */}
            <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {selectedEmail.subject || <em style={{ opacity: 0.5 }}>Sem assunto</em>}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>De:</strong> {selectedEmail.fromAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Para:</strong> {selectedEmail.toAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Data:</strong> {new Date(selectedEmail.createdAt).toLocaleString("pt-BR")}
                </Typography>
              </Box>
              {/* Actions */}
              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <Button size="small" startIcon={<ReplyIcon />} onClick={handleReply} variant="outlined">
                  Responder
                </Button>
                <Button size="small" startIcon={<ForwardToInboxIcon />} onClick={handleForward} variant="outlined">
                  Encaminhar
                </Button>
                <Tooltip title="Mover para lixeira">
                  <IconButton size="small" color="error" onClick={() => handleDelete(selectedEmail)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Body */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
              {selectedEmail.bodyHtml ? (
                <Box
                  sx={{ "& img": { maxWidth: "100%" }, "& a": { color: "primary.main" } }}
                  dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                />
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {selectedEmail.bodyText || "(Sem conteúdo)"}
                </Typography>
              )}
            </Box>

            {/* Attachments */}
            {selectedEmail.attachments?.length > 0 && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom>
                  ANEXOS ({selectedEmail.attachments.length})
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                  {selectedEmail.attachments.map((att) => (
                    <Button
                      key={att.id}
                      size="small"
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textTransform: "none", borderRadius: 4 }}
                    >
                      {att.filename}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </ViewerCol>

      {/* ── COMPOSE MODAL ── */}
      <EmailComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        defaultValues={composeDefaults}
        accounts={emailAccounts}
        selectedAccount={selectedAccount}
        onSent={handleComposeSent}
      />
    </RootBox>
  );
};

export default EmailPage;
