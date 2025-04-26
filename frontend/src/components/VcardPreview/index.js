import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Typography,
    styled
} from "@mui/material";
import { WhatsApp } from "@mui/icons-material";
import NewTicketModalPageContact from "../../components/NewTicketModalPageContact";

const VcardContainer = styled(Paper)(({ theme }) => ({
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
}));

const ContentContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2)
}));

const AvatarContainer = styled(Box)(({ theme }) => ({
    marginRight: theme.spacing(2)
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(6),
    height: theme.spacing(6),
    backgroundColor: "#25D366",
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: "18px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
}));

const ContactInfo = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    textAlign: "left",
    display: "flex",
    flexDirection: "column"
}));

const ContactName = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: "16px",
    marginBottom: theme.spacing(0.5),
    color: "#111B21"
}));

const ContactNumber = styled(Typography)(({ theme }) => ({
    fontSize: "14px",
    color: "#667781",
    display: "flex",
    alignItems: "center",
    gap: "4px"
}));

const ActionButtons = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "flex-start",
    padding: theme.spacing(1.5, 2),
    backgroundColor: "#f9f9f9",
    borderTop: "1px solid rgba(0, 0, 0, 0.06)"
}));

const ConversarButton = styled(Button)(({ theme }) => ({
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
}));

const LabelText = styled(Typography)(({ theme }) => ({
    fontSize: "12px",
    color: "#25D366",
    marginTop: theme.spacing(0.5),
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "10px",
    backgroundColor: "rgba(37, 211, 102, 0.08)"
}));

const VcardPreview = ({ contact, numbers }) => {
    const navigate = useNavigate();
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
            navigate(`/tickets/${ticket.id}`);
        }
    };

    return (
        <>
            <VcardContainer>
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
                        <ContentContainer>
                            <AvatarContainer>
                                <LargeAvatar
                                    src={selectedContact.profilePicUrl}
                                    alt={selectedContact.name || "Contato"}
                                >
                                    {selectedContact.name ? selectedContact.name[0].toUpperCase() : "C"}
                                </LargeAvatar>
                            </AvatarContainer>

                            <ContactInfo>
                                <ContactName>
                                    {selectedContact.name || "Nome do Contato"}
                                </ContactName>

                                <ContactNumber>
                                    {selectedContact.number || "Número não disponível"}
                                </ContactNumber>

                                <LabelText>
                                    {selectedContact.number && selectedContact.number.includes('+55') ? 'Celular' : 'Número'}
                                </LabelText>
                            </ContactInfo>
                        </ContentContainer>

                        <Divider />

                        <ActionButtons>
                            <ConversarButton
                                variant="contained"
                                startIcon={<WhatsApp style={{ fontSize: 18 }} />}
                                onClick={() => {
                                    setContactTicket(selectedContact.id);
                                    setNewTicketModalOpen(true);
                                }}
                                disabled={!selectedContact.number}
                            >
                                Conversar
                            </ConversarButton>
                        </ActionButtons>
                    </>
                )}
            </VcardContainer>
        </>
    );
};

export default VcardPreview;
