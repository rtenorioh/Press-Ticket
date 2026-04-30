import { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Drawer
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const DrawerContent = styled(Box)(({ theme }) => ({
  width: 320,
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const SearchHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  minHeight: 56,
}));

const ResultItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const SearchMessagesPanel = ({ open, onClose, ticketId }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setTotalCount(0);
      setHasMore(false);
      setPage(1);
    }
  }, [open]);

  const handleSearch = useCallback(async (searchQuery, pageNumber = 1) => {
    if (!searchQuery || searchQuery.trim().length < 2 || !ticketId) {
      setResults([]);
      setTotalCount(0);
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${ticketId}/search`, {
        params: { query: searchQuery, pageNumber }
      });
      if (pageNumber === 1) {
        setResults(data.messages || []);
      } else {
        setResults(prev => [...prev, ...(data.messages || [])]);
      }
      setTotalCount(data.totalCount || 0);
      setHasMore(data.hasMore || false);
      setPage(pageNumber);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(value, 1);
    }, 600);
  };

  const handleResultClick = (msg) => {
    window.dispatchEvent(
      new CustomEvent("scrollToMessage", { detail: { messageId: msg.id } })
    );
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      handleSearch(query, page + 1);
    }
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setTotalCount(0);
    setHasMore(false);
    setPage(1);
    onClose();
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = parseISO(dateStr);
      return format(date, "dd/MM/yy, HH:mm");
    } catch {
      return "";
    }
  };

  const highlightText = (text, search) => {
    if (!search || !text) return text;
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <strong key={i} style={{ backgroundColor: "rgba(255, 235, 59, 0.4)" }}>
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { position: "absolute" } }}
      BackdropProps={{ sx: { position: "absolute" } }}
      ModalProps={{
        container: document.getElementById("drawer-container"),
        style: { position: "absolute" },
      }}
    >
      <DrawerContent>
        <SearchHeader>
          <IconButton size="small" onClick={handleClose} sx={{ color: "#fff", mr: 1 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {t("searchMessages.title")}
          </Typography>
        </SearchHeader>

        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("searchMessages.placeholder")}
            value={query}
            onChange={handleInputChange}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {totalCount > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1 }}>
            {totalCount} {totalCount === 1 ? t("searchMessages.result") : t("searchMessages.results")}
          </Typography>
        )}

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {results.length === 0 && query.length >= 2 && !loading ? (
            <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
              {t("searchMessages.noResults")}
            </Typography>
          ) : (
            <List disablePadding>
              {results.map((msg) => (
                <ResultItem
                  key={msg.id}
                  alignItems="flex-start"
                  disableGutters
                  sx={{ px: 2 }}
                  onClick={() => handleResultClick(msg)}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" noWrap>
                        {highlightText(msg.body || "", query)}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {msg.fromMe ? t("searchMessages.you") : (msg.contactName || "")} • {formatTimestamp(msg.createdAt)}
                      </Typography>
                    }
                  />
                </ResultItem>
              ))}
              {hasMore && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                  <IconButton size="small" onClick={handleLoadMore} disabled={loading}>
                    {loading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Typography variant="caption" color="primary">
                        {t("searchMessages.loadMore")}
                      </Typography>
                    )}
                  </IconButton>
                </Box>
              )}
            </List>
          )}
        </Box>
      </DrawerContent>
    </Drawer>
  );
};

export default SearchMessagesPanel;
