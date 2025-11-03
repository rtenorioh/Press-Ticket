import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Chip,
  Typography,
  Box
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  ExitToApp as ExitIcon,
  Link as LinkIcon,
  Settings as SettingsIcon,
  History as HistoryIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import api from "../../services/api";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import CreateGroupModal from "../../components/CreateGroupModal";
import ManageParticipantsModal from "../../components/ManageParticipantsModal";
import GroupSettingsModal from "../../components/GroupSettingsModal";
import GroupEventNotifications from "../../components/GroupEventNotifications";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: 0,
  overflowY: "scroll",
  ...theme.scrollbarStyles,
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const GroupRow = styled(TableRow)(({ theme }) => ({
  cursor: "pointer",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  height: 24,
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(8, 2),
  color: theme.palette.text.secondary,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const HeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.background.default,
  borderBottom: `2px solid ${theme.palette.divider}`,
}));

const GroupManagement = () => {
  
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedWhatsappId, setSelectedWhatsappId] = useState(null);
  const [whatsapps, setWhatsapps] = useState([]);
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    loadWhatsapps();
  }, []);

  useEffect(() => {
    if (selectedWhatsappId) {
      loadGroups();
    }
  }, [selectedWhatsappId]);

  const loadWhatsapps = async () => {
    try {
      const { data } = await api.get("/whatsapp");
      const wwebjs = data.filter(w => w.type === "wwebjs" && w.status === "CONNECTED");
      setWhatsapps(wwebjs);
      if (wwebjs.length > 0) {
        setSelectedWhatsappId(wwebjs[0].id);
      }
    } catch (err) {
      toast.error("Erro ao carregar canais");
    }
  };

  const loadGroups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/whatsapp/${selectedWhatsappId}/groups`);
      setGroups(data);
    } catch (err) {
      toast.error("Erro ao carregar grupos");
    }
    setLoading(false);
  };

  const handleCreateGroup = () => {
    setCreateModalOpen(true);
  };

  const handleManageParticipants = (group) => {
    setSelectedGroup(group);
    setParticipantsModalOpen(true);
  };

  const handleGroupSettings = (group) => {
    setSelectedGroup(group);
    setSettingsModalOpen(true);
  };

  const handleGetInviteLink = async (group) => {
    try {
      const { data } = await api.get(
        `/whatsapp/${selectedWhatsappId}/groups/${group.id}/invite-link`
      );
      
      navigator.clipboard.writeText(data.inviteLink);
      toast.success("Link de convite copiado!");
    } catch (err) {
      toast.error("Erro ao obter link de convite");
    }
  };

  const handleLeaveGroup = async (group) => {
    if (!window.confirm(`Deseja realmente sair do grupo "${group.name}"?`)) {
      return;
    }

    try {
      await api.post(`/whatsapp/${selectedWhatsappId}/groups/${group.id}/leave`);
      toast.success("Saiu do grupo com sucesso");
      loadGroups();
    } catch (err) {
      toast.error("Erro ao sair do grupo");
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(searchParam.toLowerCase())
  );

  return (
    <MainContainer>
      <MainHeader>
        <Title>
          Gerenciamento de Grupos
          {selectedWhatsappId && groups.length > 0 && (
            <span style={{ marginLeft: '8px', fontSize: '0.9em', color: '#666' }}>
              ({groups.length} {groups.length === 1 ? 'grupo' : 'grupos'})
            </span>
          )}
        </Title>
        <MainHeaderButtonsWrapper>
          <TextField
            select
            size="small"
            variant="outlined"
            value={selectedWhatsappId || ""}
            onChange={(e) => setSelectedWhatsappId(e.target.value)}
            SelectProps={{
              native: true,
            }}
            style={{ marginRight: 16, minWidth: 200 }}
          >
            <option value="">Selecione um canal</option>
            {whatsapps.map((whatsapp) => (
              <option key={whatsapp.id} value={whatsapp.id}>
                {whatsapp.name}
              </option>
            ))}
          </TextField>
          
          {selectedWhatsappId && (
            <GroupEventNotifications whatsappId={selectedWhatsappId} />
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateGroup}
            disabled={!selectedWhatsappId}
          >
            Criar Grupo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <MainPaper variant="outlined">
        <SearchContainer>
          <TextField
            placeholder="Buscar grupos..."
            type="search"
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
            fullWidth
            variant="outlined"
          />
        </SearchContainer>

        {filteredGroups.length === 0 ? (
          <EmptyState>
            <PeopleIcon style={{ fontSize: 64, marginBottom: 16 }} />
            <Typography variant="h6">
              {searchParam ? "Nenhum grupo encontrado" : "Nenhum grupo disponível"}
            </Typography>
            <Typography variant="body2">
              {!selectedWhatsappId
                ? "Selecione um canal para visualizar os grupos"
                : "Crie um novo grupo para começar"}
            </Typography>
          </EmptyState>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <HeaderCell>Nome do Grupo</HeaderCell>
                <HeaderCell align="center">Participantes</HeaderCell>
                <HeaderCell align="center">Não Lidas</HeaderCell>
                <HeaderCell align="right">Ações</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGroups.map((group) => (
                <GroupRow key={group.id}>
                  <TableCell>{group.name}</TableCell>
                  <TableCell align="center">
                    <StyledChip
                      size="small"
                      label={group.participantsCount || 0}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {group.unreadCount > 0 && (
                      <StyledChip
                        size="small"
                        label={group.unreadCount}
                        color="secondary"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Gerenciar Participantes">
                      <ActionButton
                        size="small"
                        onClick={() => handleManageParticipants(group)}
                      >
                        <PeopleIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    
                    <Tooltip title="Configurações">
                      <ActionButton
                        size="small"
                        onClick={() => handleGroupSettings(group)}
                      >
                        <SettingsIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    
                    <Tooltip title="Copiar Link de Convite">
                      <ActionButton
                        size="small"
                        onClick={() => handleGetInviteLink(group)}
                      >
                        <LinkIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    
                    <Tooltip title="Sair do Grupo">
                      <ActionButton
                        size="small"
                        onClick={() => handleLeaveGroup(group)}
                      >
                        <ExitIcon fontSize="small" color="error" />
                      </ActionButton>
                    </Tooltip>
                  </TableCell>
                </GroupRow>
              ))}
            </TableBody>
          </Table>
        )}
      </MainPaper>

      <CreateGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        whatsappId={selectedWhatsappId}
        onSuccess={loadGroups}
      />

      <ManageParticipantsModal
        open={participantsModalOpen}
        onClose={() => setParticipantsModalOpen(false)}
        whatsappId={selectedWhatsappId}
        group={selectedGroup}
        onSuccess={loadGroups}
      />

      <GroupSettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        whatsappId={selectedWhatsappId}
        group={selectedGroup}
        onSuccess={loadGroups}
      />
    </MainContainer>
  );
};

export default GroupManagement;
