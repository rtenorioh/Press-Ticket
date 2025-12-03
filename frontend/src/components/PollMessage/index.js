import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const PollContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : '#ffffff',
  borderRadius: 12,
  padding: 16,
  maxWidth: 400,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1]
}));

const PollOption = styled(Box)(({ theme, selected, hasVotes }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  marginBottom: 8,
  borderRadius: 8,
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected 
    ? theme.palette.mode === 'dark'
      ? 'rgba(76, 175, 80, 0.15)'
      : 'rgba(76, 175, 80, 0.08)'
    : theme.palette.background.paper,
  position: 'relative',
  overflow: 'hidden',
  cursor: hasVotes ? 'default' : 'not-allowed',
  transition: 'all 0.2s ease'
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 3,
  backgroundColor: 'transparent',
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main
  }
}));

const VoteCount = styled(Typography)(({ theme }) => ({
  marginLeft: 'auto',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  fontSize: '0.875rem'
}));

const PollMessage = ({ message }) => {
  const theme = useTheme();
  const [votesSummary, setVotesSummary] = useState(null);
  const [showVotersModal, setShowVotersModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVotes();
    
    const socket = openSocket();
    if (socket) {
      const handlePollVoteUpdate = (data) => {
        if (data.pollMessageId === message.id) {
          loadVotes();
        }
      };

      socket.on("pollVoteUpdate", handlePollVoteUpdate);

      return () => {
        socket.off("pollVoteUpdate", handlePollVoteUpdate);
      };
    }
  }, [message.id]);

  const loadVotes = async () => {
    try {
      const { data } = await api.get(`/poll-votes/${message.id}/summary`);
      setVotesSummary(data);
    } catch (error) {
      console.error("Erro ao carregar votos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowVoters = (option) => {
    setSelectedOption(option);
    setShowVotersModal(true);
  };

  if (loading || !votesSummary) {
    return (
      <PollContainer>
        <Typography variant="body2" color="textSecondary">
          Carregando enquete...
        </Typography>
      </PollContainer>
    );
  }

  const totalVotes = votesSummary.totalVotes;
  const maxVotes = Math.max(...votesSummary.options.map(opt => opt.count), 1);

  return (
    <>
      <PollContainer>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5
            }}
          >
            <Typography variant="body2" color="white" fontWeight="bold">
              📊
            </Typography>
          </Box>
          <Typography variant="subtitle1" fontWeight="600">
            {votesSummary.pollName}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(33, 150, 243, 0.1)' 
              : 'rgba(33, 150, 243, 0.08)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(33, 150, 243, 0.3)' 
              : 'rgba(33, 150, 243, 0.2)'}`,
            borderRadius: '8px',
            padding: '10px 12px',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.info.main,
              fontSize: '0.75rem',
              lineHeight: 1.4
            }}
          >
            💡 <strong>Para votar:</strong> Abra o WhatsApp no seu celular e selecione as opções desejadas. Os votos serão atualizados automaticamente aqui.
          </Typography>
        </Box>

        {votesSummary.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.count / totalVotes) * 100 : 0;
          const isWinning = option.count === maxVotes && option.count > 0;

          return (
            <PollOption 
              key={option.localId} 
              selected={isWinning}
              hasVotes={option.count > 0}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${percentage}%`,
                  backgroundColor: isWinning
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(76, 175, 80, 0.2)'
                      : 'rgba(76, 175, 80, 0.15)'
                    : theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.03)',
                  transition: 'width 0.3s ease',
                  zIndex: 0
                }}
              />
              
              <Box display="flex" alignItems="center" flex={1} position="relative" zIndex={1}>
                {isWinning ? (
                  <CheckCircleIcon 
                    sx={{ 
                      color: theme.palette.success.main, 
                      fontSize: 20,
                      mr: 1.5
                    }} 
                  />
                ) : (
                  <RadioButtonUncheckedIcon 
                    sx={{ 
                      color: theme.palette.text.secondary, 
                      fontSize: 20,
                      mr: 1.5
                    }} 
                  />
                )}
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isWinning ? 600 : 400,
                    flex: 1
                  }}
                >
                  {option.name}
                </Typography>

                <VoteCount>
                  {option.count}
                </VoteCount>

                {option.count > 0 && option.voters.length > 0 && (
                  <Box ml={1}>
                    <Avatar
                      src={option.voters[0].profilePicUrl}
                      sx={{ 
                        width: 20, 
                        height: 20,
                        fontSize: '0.75rem',
                        bgcolor: theme.palette.primary.main
                      }}
                    >
                      {option.voters[0].name?.charAt(0) || '?'}
                    </Avatar>
                  </Box>
                )}
              </Box>
            </PollOption>
          );
        })}

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="textSecondary">
            {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
          </Typography>
          
          {totalVotes > 0 && (
            <IconButton 
              size="small" 
              onClick={() => handleShowVoters(null)}
              sx={{ color: theme.palette.primary.main }}
            >
              <VisibilityIcon fontSize="small" />
              <Typography variant="caption" ml={0.5}>
                Mostrar votos
              </Typography>
            </IconButton>
          )}
        </Box>
      </PollContainer>

      <Dialog 
        open={showVotersModal} 
        onClose={() => setShowVotersModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Dados da enquete</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {votesSummary.pollName}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {totalVotes} {totalVotes === 1 ? 'membro votou' : 'membros votaram'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {votesSummary.options.map((option) => (
            <Box key={option.localId} mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight="600">
                  {option.name}
                </Typography>
                <Chip 
                  label={`${option.count} ${option.count === 1 ? 'voto' : 'votos'}`}
                  size="small"
                  color={option.count > 0 ? "primary" : "default"}
                />
              </Box>
              
              {option.voters.length > 0 ? (
                <List dense>
                  {option.voters.map((voter, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar 
                          src={voter.profilePicUrl}
                          sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
                        >
                          {voter.name?.charAt(0) || '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={voter.name}
                        secondary={`Hoje às ${format(new Date(voter.timestamp), 'HH:mm')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="caption" color="textSecondary" display="block" ml={2}>
                  0 voto
                </Typography>
              )}
              
              {option.localId < votesSummary.options.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PollMessage;
