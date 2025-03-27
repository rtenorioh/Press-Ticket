import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import api from "../../services/api";

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    makeStyles,
    Paper,
    Typography
} from "@material-ui/core";
import { WhatsApp } from "@material-ui/icons";
import NewTicketModalPageContact from "../../components/NewTicketModalPageContact";

const useStyles = makeStyles((theme) => ({
    vcardContainer: {
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
        marginBottom: theme.spacing(1),
        border: "1px solid rgba(0, 0, 0, 0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
            transform: "translateY(-2px)"
        }
    },
    contentContainer: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(2)
    },
    avatarContainer: {
        marginRight: theme.spacing(2)
    },
    largeAvatar: {
        width: theme.spacing(6),
        height: theme.spacing(6),
        backgroundColor: "#25D366",
        color: "#FFFFFF",
        fontWeight: 600,
        fontSize: "18px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
    },
    contactInfo: {
        flexGrow: 1,
        textAlign: "left",
        display: "flex",
        flexDirection: "column"
    },
    contactName: {
        fontWeight: 600,
        fontSize: "16px",
        marginBottom: theme.spacing(0.5),
        color: "#111B21"
    },
    contactNumber: {
        fontSize: "14px",
        color: "#667781",
        display: "flex",
        alignItems: "center",
        gap: "4px"
    },
    actionButtons: {
        display: "flex",
        justifyContent: "flex-start",
        padding: theme.spacing(1.5, 2),
        backgroundColor: "#f9f9f9",
        borderTop: "1px solid rgba(0, 0, 0, 0.06)"
    },
    conversarButton: {
        borderRadius: "24px",
        textTransform: "none",
        fontWeight: 600,
        padding: theme.spacing(0.75, 2.5),
        color: "#FFFFFF",
        backgroundColor: "#25D366",
        "&:hover": {
            backgroundColor: "#1FAD55"
        },
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease"
    },
    labelText: {
        fontSize: "12px",
        color: "#25D366",
        marginTop: theme.spacing(0.5),
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "10px",
        backgroundColor: "rgba(37, 211, 102, 0.08)"
    }
}));

const VcardPreview = ({ contact, numbers }) => {
    const classes = useStyles();
    const history = useHistory();
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [, setContactTicket] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedContact, setContact] = useState({
        name: contact || "Contato",
        number: typeof numbers === 'string' ? numbers : "Número não disponível",
        profilePicUrl: "",
        id: null
    });

    useEffect(() => {
        setContact({
            name: contact || "Contato",
            number: typeof numbers === 'string' ? numbers : "Número não disponível",
            profilePicUrl: "",
            id: null
        });

        if (contact && numbers) {
            const fetchContactData = async () => {
                try {
                    setLoading(true);

                    let numberStr = "";
                    if (numbers) {
                        if (typeof numbers === 'string') {
                            numberStr = numbers.replace(/\D/g, "");
                        } else if (typeof numbers === 'object') {
                            numberStr = numbers.number || numbers.toString();
                            numberStr = numberStr.replace(/\D/g, "");
                        } else {
                            numberStr = String(numbers).replace(/\D/g, "");
                        }
                    }

                    if (!numberStr || numberStr === "0" || numberStr === "") {
                        // console.warn("Número inválido:", numberStr);
                        setLoading(false);
                        return;
                    }

                    if (numberStr && numberStr !== "0") {
                        const { data } = await api.post("/contact", {
                            name: contact || "Contato",
                            number: numberStr,
                            email: ""
                        });

                        if (data && data.id) {
                            setContact(data);
                        }
                    }
                } catch (err) {
                    console.warn("Error in VcardPreview:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchContactData();
        }
    }, [contact, numbers]);

    const handleCloseOrOpenTicket = (ticket) => {
        setNewTicketModalOpen(false);
        if (ticket !== undefined && ticket.id !== undefined) {
            history.push(`/tickets/${ticket.id}`);
        }
    };

    return (
        <>
            <Paper className={classes.vcardContainer}>
                <NewTicketModalPageContact
                    modalOpen={newTicketModalOpen}
                    initialContact={selectedContact}
                    onClose={(ticket) => {
                        handleCloseOrOpenTicket(ticket);
                    }}
                />

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" padding={2}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <>
                        <Box className={classes.contentContainer}>
                            <Box className={classes.avatarContainer}>
                                <Avatar
                                    src={selectedContact.profilePicUrl}
                                    className={classes.largeAvatar}
                                    alt={selectedContact.name || "Contato"}
                                >
                                    {selectedContact.name ? selectedContact.name[0].toUpperCase() : "C"}
                                </Avatar>
                            </Box>

                            <Box className={classes.contactInfo}>
                                <Typography
                                    className={classes.contactName}
                                >
                                    {selectedContact.name || "Nome do Contato"}
                                </Typography>

                                <Typography
                                    className={classes.contactNumber}
                                >
                                    {selectedContact.number || "Número não disponível"}
                                </Typography>

                                <Typography className={classes.labelText}>
                                    {selectedContact.number && selectedContact.number.includes('+55') ? 'Celular' : 'Número'}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider />

                        <Box className={classes.actionButtons}>
                            <Button
                                variant="contained"
                                className={classes.conversarButton}
                                startIcon={<WhatsApp style={{ fontSize: 18 }} />}
                                onClick={() => {
                                    setContactTicket(selectedContact.id);
                                    setNewTicketModalOpen(true);
                                }}
                                disabled={!selectedContact.number}
                            >
                                Conversar
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
        </>
    );

};

export default VcardPreview;