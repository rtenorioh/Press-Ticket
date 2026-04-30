import { useCallback, useContext, useEffect, useState } from "react";
import { Box, Chip, CircularProgress } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const FilterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  overflowX: "auto",
  flexWrap: "nowrap",
  minHeight: 36,
  "&::-webkit-scrollbar": {
    height: 0,
    display: "none",
  },
}));

const LabelChip = styled(Chip)(({ theme, selected, labelcolor }) => ({
  fontWeight: selected ? 600 : 400,
  fontSize: "0.75rem",
  height: 24,
  borderRadius: 12,
  cursor: "pointer",
  flexShrink: 0,
  transition: "all 0.15s ease",
  borderColor: selected
    ? labelcolor || theme.palette.primary.main
    : theme.palette.divider,
  backgroundColor: selected
    ? `${labelcolor || theme.palette.primary.main}18`
    : "transparent",
  color: selected
    ? labelcolor || theme.palette.primary.main
    : theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: `${labelcolor || theme.palette.primary.main}25`,
    borderColor: labelcolor || theme.palette.primary.main,
  },
  "& .MuiChip-label": {
    padding: "0 8px",
  },
}));

// Filtros internos do sistema (independem de labels do WhatsApp)
const SYSTEM_FILTERS = [
  { key: "favorited", color: "#e91e63" },
  { key: "unread", color: "#ff9800" },
  { key: "groups", color: "#4caf50" },
];

const TicketLabelsFilter = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { whatsApps } = useContext(WhatsAppsContext);
  const [labels, setLabels] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Detectar conexão Business e buscar labels do WA se disponível
  useEffect(() => {
    const biz = whatsApps.find(
      (w) => w.isBusiness === true && w.status === "CONNECTED"
    );

    if (biz) {
      api
        .get("/whatsapp-labels", { params: { whatsappId: biz.id } })
        .then(({ data }) => setLabels(data || []))
        .catch(() => setLabels([]));
    } else {
      setLabels([]);
    }
  }, [whatsApps]);

  // Ouvir evento de sync para atualizar labels em tempo real
  useEffect(() => {
    const socket = openSocket();
    if (!socket) return;

    const handleLabelsSync = (data) => {
      if (data.action === "sync") {
        setLabels(data.labels || []);
      }
    };

    socket.on("whatsappLabels", handleLabelsSync);

    return () => {
      socket.off("whatsappLabels", handleLabelsSync);
    };
  }, []);

  const handleSelect = useCallback(
    (filterKey) => {
      if (filterKey === selectedFilter) {
        setSelectedFilter(null);
        if (onFilterChange) onFilterChange(null);
        return;
      }

      setSelectedFilter(filterKey);

      if (!filterKey) {
        if (onFilterChange) onFilterChange(null);
        return;
      }

      // Filtros do sistema
      if (filterKey === "favorited") {
        if (onFilterChange) onFilterChange({ type: "favorited" });
        return;
      }
      if (filterKey === "unread") {
        if (onFilterChange) onFilterChange({ type: "unread" });
        return;
      }
      if (filterKey === "groups") {
        if (onFilterChange) onFilterChange({ type: "groups" });
        return;
      }

      // Filtro por label do WhatsApp (usa ticketIds sincronizados)
      const label = labels.find((l) => `label_${l.id}` === filterKey);
      if (label) {
        if (onFilterChange)
          onFilterChange({ type: "label", ticketIds: label.ticketIds || [] });
      }
    },
    [selectedFilter, labels, onFilterChange]
  );

  // Nomes de labels do sistema que não devem ser duplicados com labels do WA
  const systemFilterNames = [
    t("ticketLabelsFilter.favorited").toLowerCase(),
    t("ticketLabelsFilter.unread").toLowerCase(),
    t("ticketLabelsFilter.groups").toLowerCase(),
  ];
  const filteredLabels = labels.filter(
    (l) => !systemFilterNames.includes(l.name.toLowerCase())
  );

  return (
    <FilterContainer>
      {/* Chip "Tudo" */}
      <LabelChip
        label={t("ticketLabelsFilter.all")}
        variant="outlined"
        size="small"
        selected={!selectedFilter ? 1 : 0}
        labelcolor={theme.palette.primary.main}
        onClick={() => handleSelect(null)}
      />

      {/* Filtros internos do sistema */}
      {SYSTEM_FILTERS.map((sf) => (
        <LabelChip
          key={sf.key}
          label={t(`ticketLabelsFilter.${sf.key}`)}
          variant="outlined"
          size="small"
          selected={selectedFilter === sf.key ? 1 : 0}
          labelcolor={sf.color}
          onClick={() => handleSelect(sf.key)}
        />
      ))}

      {/* Labels do WhatsApp Business (sincronizadas do BD) */}
      {filteredLabels.map((label) => (
        <LabelChip
          key={label.id}
          label={label.name}
          variant="outlined"
          size="small"
          selected={selectedFilter === `label_${label.id}` ? 1 : 0}
          labelcolor={label.hexColor || undefined}
          onClick={() => handleSelect(`label_${label.id}`)}
          sx={
            label.hexColor
              ? {
                  "&::before": {
                    content: '""',
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: label.hexColor,
                    marginRight: 0.5,
                    flexShrink: 0,
                  },
                }
              : {}
          }
        />
      ))}
    </FilterContainer>
  );
};

export default TicketLabelsFilter;
