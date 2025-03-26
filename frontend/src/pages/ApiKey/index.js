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
    Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DeleteOutline, FileCopy } from '@material-ui/icons';
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

const useStyles = makeStyles(theme => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(2),
        margin: theme.spacing(1),
        overflowY: 'scroll',
        ...theme.scrollbarStyles
    },
    customTableCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    }
}));

const ApiKey = () => {
    const classes = useStyles();
    const { t } = useTranslation();
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
            permissions: [...prev.permissions, permission]
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
            'create:messages': t("apiKey.permissions.createMessages"),
            'create:medias': t("apiKey.permissions.createMedias"),
            'read:whatsapps': t("apiKey.permissions.readWhatsapps"),
            'update:whatsapps': t("apiKey.permissions.updateWhatsapps"),
            'create:contacts': t("apiKey.permissions.createContacts")
        };
        return names[permission] || permission;
    };

    const hasSelectedPermissions = newToken.permissions.length > 0;

    return (
        <MainContainer>
            <MainHeader>
                <Title>{t("apiKey.title")} {total > 0 ? `(${total})` : ""}</Title>
                <MainHeaderButtonsWrapper>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenNewDialog(true)}
                    >
                        {t("apiKey.button.new")}
                    </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                onScroll={handleScroll}
            >
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t("apiKey.table.name")}</TableCell>
                                <TableCell>{t("apiKey.table.token")}</TableCell>
                                <TableCell>{t("apiKey.table.permissions")}</TableCell>
                                <TableCell>{t("apiKey.table.created_at")}</TableCell>
                                <TableCell align="center">{t("apiKey.table.actions")}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tokens.map((token) => (
                                <TableRow key={token.id}>
                                    <TableCell>{token.name}</TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography
                                                style={{
                                                    maxWidth: 200,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {token.token}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopyToken(token.token)}
                                            >
                                                <FileCopy fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {Array.isArray(token.permissions) ? token.permissions.map(renderPermissionName).join(', ') : ''}
                                    </TableCell>
                                    <TableCell>{new Date(token.createdAt).toLocaleString()}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setTokenToDelete(token.id);
                                                setConfirmModalOpen(true);
                                            }}
                                        >
                                            <DeleteOutline />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton columns={5} />}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog
                open={openNewDialog}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t("apiKey.modal.title")}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t("apiKey.modal.name")}
                        type="text"
                        fullWidth
                        value={newToken.name || ''}
                        onChange={handleNameChange}
                    />
                    <Typography
                        variant="subtitle1"
                        style={{
                            marginTop: '16px',
                            color: hasSelectedPermissions ? 'inherit' : '#f44336'
                        }}
                    >
                        {t("apiKey.modal.permissions")}
                        {!hasSelectedPermissions && (
                            <Typography variant="caption" style={{ marginLeft: 8, color: '#f44336' }}>
                                ({t("apiKey.modal.permissionsRequired")})
                            </Typography>
                        )}
                    </Typography>
                    <Grid container spacing={2}>
                        {['create:contacts', 'create:messages'].map((permission) => (
                            <Grid item xs={12} key={permission}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={newToken.permissions.includes(permission)}
                                            onChange={() => handlePermissionChange(permission)}
                                            color="primary"
                                        />
                                    }
                                    label={renderPermissionName(permission)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        {t("apiKey.modal.buttons.cancel")}
                    </Button>
                    <Button
                        onClick={handleCreateToken}
                        color="primary"
                        disabled={!newToken.name || !hasSelectedPermissions}
                    >
                        {t("apiKey.modal.buttons.save")}
                    </Button>
                </DialogActions>
            </Dialog>

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