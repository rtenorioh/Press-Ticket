import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import FileCopy from '@mui/icons-material/FileCopy';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import VpnKeyRounded from '@mui/icons-material/VpnKeyRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/ConfirmationModal';
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import MainHeaderButtonsWrapper from '../../components/MainHeaderButtonsWrapper';
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from '../../components/Title';
import api from '../../services/api';

const MainPaper = styled(Paper)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    overflowY: 'scroll',
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    ...theme.scrollbarStyles
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(1, 2),
    fontSize: '0.875rem',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogTitle-root': {
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
        '& .MuiTypography-root': {
            fontWeight: 500,
        },
        padding: theme.spacing(2),
    },
    '& .MuiDialogContent-root': {
        padding: theme.spacing(3),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(2),
        backgroundColor: '#f5f5f5',
    },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    '& .MuiTableCell-root': {
        color: theme.palette.text.secondary,
        fontWeight: 600,
    }
}));

const TokenDisplay = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    maxWidth: 280,
    [theme.breakpoints.down('md')]: {
        maxWidth: 180,
    },
}));

const TokenText = styled(Typography)(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
}));

const ApiKey = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [total, setTotal] = useState(0);
    const [openNewDialog, setOpenNewDialog] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [tokenToDelete, setTokenToDelete] = useState(null);
    const [newToken, setNewToken] = useState({
        name: '',
        permissions: []
    });

    const fetchTokens = async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await api.get('/api-tokens', {
                params: {
                    pageNumber: page,
                    pageSize: 20
                }
            });

            if (page === 1) {
                setTokens(data.tokens);
            } else {
                setTokens(prev => [...prev, ...data.tokens]);
            }

            setTotal(data.count);
            setHasMore(data.hasMore);
            setPageNumber(page);
        } catch (err) {
            console.error(err);
            toast.error('Erro ao carregar tokens');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTokens();
    }, []);

    const handleScroll = useCallback((e) => {
        if (loading || !hasMore) return;

        const { scrollHeight, scrollTop, clientHeight } = e.target;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom) {
            fetchTokens(pageNumber + 1);
        }
    }, [loading, hasMore, pageNumber]);

    const handleClose = () => {
        setOpenNewDialog(false);
        setNewToken({
            name: '',
            permissions: []
        });
    };

    const handlePermissionChange = (permission) => {
        setNewToken(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const handleNameChange = (e) => {
        if (!e || !e.target) return;
        const value = e.target.value || '';
        setNewToken(prev => ({
            ...prev,
            name: value
        }));
    };

    const handleCreateToken = async () => {
        try {
            const data = {
                name: newToken.name,
                permissions: newToken.permissions
            };

            await api.post('/api-tokens', data);
            await fetchTokens();
            setOpenNewDialog(false);
            setNewToken({
                name: '',
                permissions: []
            });
            toast.success(t("apiKey.messages.success.created"));
        } catch (err) {
            console.error(err);
            if (err.response?.data?.error === 'ERR_TOKEN_NAME_ALREADY_EXISTS') {
                toast.error(t("apiKey.messages.error.nameExists"));
            } else {
                toast.error(err?.response?.data?.message || t("apiKey.messages.error.create"));
            }
        }
    };

    const handleDeleteToken = async () => {
        try {
            await api.delete(`/api-tokens/${tokenToDelete}`);
            await fetchTokens();
            toast.success(t("apiKey.messages.success.deleted"));
            setConfirmModalOpen(false);
            setTokenToDelete(null);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || t("apiKey.messages.error.delete"));
        }
    };

    const handleCopyToken = (token) => {
        navigator.clipboard.writeText(token);
        toast.success(t("apiKey.messages.success.copy"));
    };

    const renderPermissionName = (permission) => {
        const names = {
            // Contatos
            'create:contacts': t("apiKey.permissions.createContacts"),
            'read:contacts': t("apiKey.permissions.readContacts"),
            'update:contacts': t("apiKey.permissions.updateContacts"),
            'delete:contacts': t("apiKey.permissions.deleteContacts"),
            
            // Mensagens
            'create:messages': t("apiKey.permissions.createMessages"),
            'read:messages': t("apiKey.permissions.readMessages"),
            
            // Setores
            'create:queue': t("apiKey.permissions.createQueue"),
            'read:queue': t("apiKey.permissions.readQueue"),
            'update:queue': t("apiKey.permissions.updateQueue"),
            'delete:queue': t("apiKey.permissions.deleteQueue"),
            
            // Tags
            'create:tags': t("apiKey.permissions.createTags"),
            'read:tags': t("apiKey.permissions.readTags"),
            'update:tags': t("apiKey.permissions.updateTags"),
            'delete:tags': t("apiKey.permissions.deleteTags"),
            
            // Tickets
            'create:tickets': t("apiKey.permissions.createTickets"),
            'read:tickets': t("apiKey.permissions.readTickets"),
            'update:tickets': t("apiKey.permissions.updateTickets"),
            'delete:tickets': t("apiKey.permissions.deleteTickets"),
            
            // WhatsApp
            'create:whatsapp': t("apiKey.permissions.createWhatsapp"),
            'read:whatsapp': t("apiKey.permissions.readWhatsapp"),
            'update:whatsapp': t("apiKey.permissions.updateWhatsapp"),
            'delete:whatsapp': t("apiKey.permissions.deleteWhatsapp"),
            
            // Sessões de WhatsApp
            'create:whatsappsession': t("apiKey.permissions.createWhatsappSession"),
            'update:whatsappsession': t("apiKey.permissions.updateWhatsappSession"),
            'delete:whatsappsession': t("apiKey.permissions.deleteWhatsappSession"),
            
            // Logs de Atividade
            'read:activity-logs': t("apiKey.permissions.readActivityLogs"),
            
            // Backups
            'create:backups': t("apiKey.permissions.createBackups"),
            'read:backups': t("apiKey.permissions.readBackups"),
            'update:backups': t("apiKey.permissions.updateBackups"),
            'delete:backups': t("apiKey.permissions.deleteBackups"),
            
            // Logs de Erro
            'create:error-logs': t("apiKey.permissions.createErrorLogs"),
            'read:error-logs': t("apiKey.permissions.readErrorLogs"),
            'delete:error-logs': t("apiKey.permissions.deleteErrorLogs"),
            
            // Monitoramento de Rede
            'read:network-status': t("apiKey.permissions.readNetworkStatus"),
            
            // Monitoramento de Filas
            'read:queue-monitor': t("apiKey.permissions.readQueueMonitor"),
            
            // Atualização do Sistema
            'read:system-update': t("apiKey.permissions.readSystemUpdate"),
            'write:system-update': t("apiKey.permissions.writeSystemUpdate"),
            
            // Versão e Biblioteca WhatsApp
            'read:version': t("apiKey.permissions.readVersion"),
            'write:whatsapp-lib': t("apiKey.permissions.writeWhatsappLib"),
            
            // Sistema e Recursos
            'write:system': t("apiKey.permissions.writeSystem"),
            'read:system-resources': t("apiKey.permissions.readSystemResources")
        };
        return names[permission] || permission;
    };

    const hasSelectedPermissions = newToken.permissions.length > 0;

    return (
        <MainContainer>
            <MainHeader>
                <Title>{t("apiKey.title")} {total > 0 ? `(${total})` : ""}</Title>
                <MainHeaderButtonsWrapper>
                    <Tooltip title={t("apiKey.button.new")} arrow>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenNewDialog(true)}
                            sx={{
                                borderRadius: 2,
                                px: { xs: 1, sm: 2 },
                                '& .MuiButton-startIcon': {
                                    mr: { xs: 0, sm: 1 }
                                }
                            }}
                        >
                            <AddCircleOutline />
                        </Button>
                    </Tooltip>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <MainPaper
                variant="outlined"
                onScroll={handleScroll}
            >
                <TableContainer sx={{ borderRadius: 1, overflow: 'hidden' }}>
                    <Table>
                        <StyledTableHead>
                            <TableRow>
                                <StyledTableCell>{t("apiKey.table.name")}</StyledTableCell>
                                <StyledTableCell>{t("apiKey.table.token")}</StyledTableCell>
                                <StyledTableCell>{t("apiKey.table.permissions")}</StyledTableCell>
                                <StyledTableCell>{t("apiKey.table.created_at")}</StyledTableCell>
                                <StyledTableCell align="center">{t("apiKey.table.actions")}</StyledTableCell>
                            </TableRow>
                        </StyledTableHead>
                        <TableBody>
                            {loading && tokens.length === 0 ? (
                                <TableRowSkeleton columns={5} />
                            ) : tokens.length === 0 ? (
                                <TableRow>
                                    <StyledTableCell colSpan={5} align="center">
                                        <Typography variant="body2" color="textSecondary">
                                            {t("apiKey.messages.noTokens")}
                                        </Typography>
                                    </StyledTableCell>
                                </TableRow>
                            ) : tokens.map((token) => (
                                <TableRow key={token.id} hover>
                                    <StyledTableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {token.name}
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TokenDisplay>
                                            <TokenText>
                                                {token.token}
                                            </TokenText>
                                            <Tooltip title={t("apiKey.button.copy")} arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCopyToken(token.token)}
                                                    sx={{ bgcolor: 'background.default', '&:hover': { bgcolor: 'action.hover' } }}
                                                >
                                                    <FileCopy fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TokenDisplay>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Typography variant="body2" color="textSecondary">
                                            {Array.isArray(token.permissions) ? token.permissions.map(renderPermissionName).join(', ') : ''}
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Typography variant="body2" color="textSecondary">
                                            {new Date(token.createdAt).toLocaleString()}
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Tooltip title={t("apiKey.button.delete")} arrow>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setTokenToDelete(token.id);
                                                    setConfirmModalOpen(true);
                                                }}
                                                sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.lighter' } }}
                                            >
                                                <DeleteOutline fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </StyledTableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={5} />}
                        </TableBody>
                    </Table>
                </TableContainer>
            </MainPaper>

            <StyledDialog
                open={openNewDialog}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }
                }}
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center">
                        <VpnKeyRounded fontSize="small" sx={{ mr: 1.5 }}/>
                        {t("apiKey.modal.title")}
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ pt: 0 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t("apiKey.modal.name")}
                        type="text"
                        fullWidth
                        value={newToken.name}
                        onChange={handleNameChange}
                        variant="outlined"
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={500}>
                                {t("apiKey.modal.permissions")}
                            </Typography>
                            <Box>
                                {!hasSelectedPermissions && (
                                    <Typography 
                                        variant="caption" 
                                        color="error.main" 
                                        sx={{ fontWeight: 500, mr: 2 }}
                                    >
                                        ({t("apiKey.modal.permissionsRequired")})
                                    </Typography>
                                )}
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary"
                                    onClick={() => {
                                        const allPermissions = [
                                            'create:contacts', 'read:contacts', 'update:contacts', 'delete:contacts',
                                            'create:messages', 'read:messages',
                                            'create:queue', 'read:queue', 'update:queue', 'delete:queue',
                                            'create:tags', 'read:tags', 'update:tags', 'delete:tags',
                                            'create:tickets', 'read:tickets', 'update:tickets', 'delete:tickets',
                                            'create:whatsapp', 'read:whatsapp', 'update:whatsapp', 'delete:whatsapp',
                                            'create:whatsappsession', 'update:whatsappsession', 'delete:whatsappsession',
                                            'read:activity-logs'
                                        ];
                                        
                                        if (newToken.permissions.length === allPermissions.length) {
                                            setNewToken(prev => ({ ...prev, permissions: [] }));
                                        } else {
                                            setNewToken(prev => ({ ...prev, permissions: allPermissions }));
                                        }
                                    }}
                                    sx={{ borderRadius: 20, textTransform: 'none' }}
                                >
                                    {newToken.permissions.length === 0 || 
                                     newToken.permissions.length < 20 ? 
                                        t("apiKey.modal.buttons.selectAll") : 
                                        t("apiKey.modal.buttons.unselectAll")}
                                </Button>
                            </Box>
                        </Box>
                        
                        {/* Acordeão de Contatos */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.contacts")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['create:contacts', 'read:contacts', 'update:contacts', 'delete:contacts'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Acordeão de Mensagens */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.messages")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['create:messages', 'read:messages'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Acordeão de Setores */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.queues")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['create:queue', 'read:queue', 'update:queue', 'delete:queue'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Acordeão de Tags */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.tags")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['create:tags', 'read:tags', 'update:tags', 'delete:tags'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Acordeão de Tickets */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.tickets")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['create:tickets', 'read:tickets', 'update:tickets', 'delete:tickets'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Acordeão de WhatsApp */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.whatsapp")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['create:whatsapp', 'read:whatsapp', 'update:whatsapp', 'delete:whatsapp'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Acordeão de Sessões de WhatsApp */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.whatsappSession")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['create:whatsappsession', 'update:whatsappsession', 'delete:whatsappsession'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Acordeão de Logs de Atividade */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.activityLogs")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['read:activity-logs'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Acordeão de Backups */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.backups")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['create:backups', 'read:backups', 'update:backups', 'delete:backups'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Acordeão de Logs de Erro */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.errorLogs")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['create:error-logs', 'read:error-logs', 'delete:error-logs'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Acordeão de Monitoramento de Rede */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.networkStatus")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['read:network-status'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Acordeão de Monitoramento de Filas */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.queueMonitor")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['read:queue-monitor'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Acordeão de Atualização do Sistema */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.systemUpdate")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['read:system-update', 'write:system-update'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Acordeão de Versão e Biblioteca WhatsApp */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.versionWhatsapp")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['read:version', 'write:whatsapp-lib'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Acordeão de Sistema e Recursos */}
                        <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '4px !important', '&:before': { display: 'none' } }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: '4px',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={500}>
                                    {t("apiKey.categories.systemResources")}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 2 }}>
                                <Grid container spacing={1}>
                                    {['write:system', 'read:system-resources'].map((permission) => (
                                        <Grid item xs={12} sm={6} key={permission}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={newToken.permissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={<Typography variant="body2">{renderPermissionName(permission)}</Typography>}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                    <Button 
                        onClick={handleClose} 
                        variant="contained"
                        sx={{ 
                            borderRadius: 20,
                            backgroundColor: '#e0e0e0',
                            color: '#757575',
                            '&:hover': {
                                backgroundColor: '#d5d5d5',
                            },
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                        }}
                    >
                        {t("apiKey.modal.buttons.cancel")}
                    </Button>
                    <Button
                        onClick={handleCreateToken}
                        variant="contained"
                        disabled={!newToken.name || !hasSelectedPermissions}
                        sx={{ 
                            borderRadius: 20, 
                            ml: 2,
                            backgroundColor: theme.palette.primary.main,
                            '&:hover': {
                                backgroundColor: theme.palette.secondary.main,
                            },
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                        }}
                    >
                        {t("apiKey.modal.buttons.save")}
                    </Button>
                </DialogActions>
            </StyledDialog>

            <ConfirmationModal
                title="Excluir Token"
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteToken}
            >
                {t("apiKey.confirmationModal.message")}
            </ConfirmationModal>
        </MainContainer>
    );
};

export default ApiKey;
