import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Paper,
    Typography,
    styled,
    alpha
} from "@mui/material";
import { WhatsApp, Close } from "@mui/icons-material";
import NewTicketModalPageContact from "../../components/NewTicketModalPageContact";

const VcardContainer = styled(Paper)(({ theme }) => ({
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
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
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
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
    color: theme.palette.text.primary
}));

const ContactNumber = styled(Typography)(({ theme }) => ({
    fontSize: "14px",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: "4px"
}));

const ActionButtons = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.default,
    borderTop: `1px solid ${theme.palette.divider}`
}));

const ConversarButton = styled(Button)(({ theme }) => ({
    borderRadius: 20,
    textTransform: "uppercase",
    fontWeight: "bold",
    padding: theme.spacing(0.75, 2.5),
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
        backgroundColor: theme.palette.primary.dark
    },
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease"
}));

const LabelText = styled(Typography)(({ theme }) => ({
    fontSize: "12px",
    color: theme.palette.primary.main,
    marginTop: theme.spacing(0.5),
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "10px",
    backgroundColor: theme.palette.mode === 'dark' ? 
        alpha(theme.palette.primary.main, 0.15) : 
        alpha(theme.palette.primary.main, 0.08)
}));

const VcardPreview = ({ contact, numbers }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [numberSelectionModalOpen, setNumberSelectionModalOpen] = useState(false);
    const [contactTicket, setContactTicket] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedContact, setContact] = useState({
        name: contact || "Contato",
        number: typeof numbers === 'string' ? numbers : 
               Array.isArray(numbers) ? numbers[0] : 
               typeof numbers === 'object' && numbers.number ? numbers.number : 
               "Número não disponível",
        profilePicUrl: "",
        id: null,
        allNumbers: Array.isArray(numbers) ? numbers : 
                   typeof numbers === 'object' && numbers.number ? [numbers.number] : 
                   typeof numbers === 'string' ? [numbers] : []
    });

    useEffect(() => {
        let processedNumbers = [];
        let primaryNumber = "";
        let hasWhatsappNumber = false;
        
        try {
            if (typeof numbers === 'string') {
                primaryNumber = numbers;
                const waidMatch = numbers.match(/waid=(\d+)/);
                if (waidMatch && waidMatch[1]) {
                    primaryNumber = waidMatch[1];
                    processedNumbers = [{ number: waidMatch[1], isMobile: true, isWhatsapp: true }];
                    hasWhatsappNumber = true;
                } else {
                    processedNumbers = [{ number: numbers, isMobile: numbers.includes('+55') }];
                }
            } else if (Array.isArray(numbers)) {
                processedNumbers = numbers.map(num => {
                    if (typeof num === 'string') {
                        const waidMatch = num.match(/waid=(\d+)/);
                        if (waidMatch && waidMatch[1]) {
                            hasWhatsappNumber = true;
                            return { number: waidMatch[1], isMobile: true, isWhatsapp: true };
                        }
                        
                        return { 
                            number: num, 
                            isMobile: num.includes('+55') || num.includes('celular') || num.includes('mobile')
                        };
                    } else if (typeof num === 'object' && num !== null) {
                        if (num.isWhatsapp) hasWhatsappNumber = true;
                        return {
                            number: num.number || String(num),
                            isMobile: num.isMobile || false,
                            isWhatsapp: num.isWhatsapp || false
                        };
                    }
                    return { number: String(num), isMobile: false };
                });
                
                const waidNumber = processedNumbers.find(n => {
                    if (typeof n.number === 'string') {
                        return n.number.includes('waid=');
                    }
                    return false;
                });
                
                if (waidNumber) {
                    primaryNumber = waidNumber.number;
                } else {
                    const whatsappNumber = processedNumbers.find(n => n.isWhatsapp);
                    if (whatsappNumber) {
                        primaryNumber = whatsappNumber.number;
                    } else {
                        const mobileNumber = processedNumbers.find(n => n.isMobile);
                        primaryNumber = mobileNumber ? mobileNumber.number : 
                                      processedNumbers.length > 0 ? processedNumbers[0].number : "";
                    }
                }
            } else if (typeof numbers === 'object' && numbers !== null) {
                if (numbers.number) {
                    primaryNumber = numbers.number;
                    if (numbers.isWhatsapp) hasWhatsappNumber = true;
                    processedNumbers = [{ 
                        number: numbers.number, 
                        isMobile: numbers.isMobile || numbers.number.includes('+55'),
                        isWhatsapp: numbers.isWhatsapp || false
                    }];
                } else if (numbers.TEL) {
                    const telNumbers = Array.isArray(numbers.TEL) ? numbers.TEL : [numbers.TEL];
                    processedNumbers = telNumbers.map(tel => {
                        const waidMatch = tel.match(/waid=(\d+)/);
                        if (waidMatch && waidMatch[1]) {
                            hasWhatsappNumber = true;
                            return { number: waidMatch[1], isMobile: true, isWhatsapp: true };
                        }
                        
                        const match = tel.match(/:[\d+\s-]+$/);
                        const number = match ? match[0].substring(1).trim() : tel;
                        
                        const isMobile = tel.toLowerCase().includes('cell') || 
                                       tel.toLowerCase().includes('celular') || 
                                       tel.toLowerCase().includes('mobile');
                        
                        return { number, isMobile };
                    });
                    
                    const waidNumber = processedNumbers.find(n => {
                        if (typeof n.number === 'string') {
                            return n.number.includes('waid=');
                        }
                        return false;
                    });
                    
                    if (waidNumber) {
                        primaryNumber = waidNumber.number;
                    } else {
                        const whatsappNumber = processedNumbers.find(n => n.isWhatsapp);
                        if (whatsappNumber) {
                            primaryNumber = whatsappNumber.number;
                        } else {
                            const mobileNumber = processedNumbers.find(n => n.isMobile);
                            primaryNumber = mobileNumber ? mobileNumber.number : 
                                          processedNumbers.length > 0 ? processedNumbers[0].number : "";
                        }
                    }
                }
            }
            
            if (primaryNumber) {
                const waidMatch = primaryNumber.match(/waid=(\d+)/);
                if (waidMatch && waidMatch[1]) {
                    primaryNumber = waidMatch[1];
                }
            }
            
            setContact({
                name: contact || "Contato",
                number: primaryNumber || t("vcardPreview.numberNotAvailable"),
                profilePicUrl: "",
                id: null,
                allNumbers: processedNumbers,
                whatsappChecked: hasWhatsappNumber
            });
        } catch (error) {
            console.error("Erro ao processar números:", error);
            setContact({
                name: contact || "Contato",
                number: typeof numbers === 'string' ? numbers : "Número não disponível",
                profilePicUrl: "",
                id: null,
                allNumbers: [],
                whatsappChecked: false
            });
        }
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleConversarClick = async () => {
        try {
            setLoading(true);
            if (selectedContact.allNumbers && selectedContact.allNumbers.length > 1) {
                setNumberSelectionModalOpen(true);
                setLoading(false);
            } else {
                const number = selectedContact.number.replace(/\D/g, "");
                const { data: existingContacts } = await api.get("/contacts", {
                    params: { searchParam: number }
                });
                
                let contactId = null;
                
                if (existingContacts && existingContacts.contacts && existingContacts.contacts.length > 0) {
                    const existingContact = existingContacts.contacts.find(c => 
                        c.number && c.number.replace(/\D/g, "") === number
                    );
                    
                    if (existingContact) {
                        contactId = existingContact.id;
                        setContact(prev => ({ ...prev, id: existingContact.id }));
                        setContactTicket({ ...selectedContact, id: existingContact.id });
                    }
                }
                
                if (!contactId) {
                    const { data: newContact } = await api.post("/contacts", {
                        name: selectedContact.name,
                        number: selectedContact.number
                    });
                    contactId = newContact.id;
                    setContact(prev => ({ ...prev, id: newContact.id }));
                    setContactTicket({ ...selectedContact, id: newContact.id });
                }
                
                setLoading(false);
                setNewTicketModalOpen(true);
            }
        } catch (err) {
            setLoading(false);
            console.error("Erro ao processar contato:", err);
            toastError(err);
        }
    };
    
    const handleStartConversation = async (number) => {
        try {
            setNumberSelectionModalOpen(false);
            setLoading(true);
            
            const waidMatch = typeof number === 'string' ? number.match(/waid=(\d+)/) : null;
            const cleanNumber = waidMatch ? waidMatch[1] : 
                              typeof number === 'object' && number.number ? number.number.replace(/\D/g, "") :
                              typeof number === 'string' ? number.replace(/\D/g, "") : "";
            
            const { data: existingContacts } = await api.get("/contacts", {
                params: { searchParam: cleanNumber }
            });
            
            let contactId = null;
            
            if (existingContacts && existingContacts.contacts && existingContacts.contacts.length > 0) {
                const existingContact = existingContacts.contacts.find(c => 
                    c.number && c.number.replace(/\D/g, "") === cleanNumber
                );
                
                if (existingContact) {
                    contactId = existingContact.id;
                    const contactWithSelectedNumber = {
                        ...selectedContact,
                        number: cleanNumber,
                        id: existingContact.id
                    };
                    setContactTicket(contactWithSelectedNumber);
                }
            }
            
            if (!contactId) {
                const { data: newContact } = await api.post("/contacts", {
                    name: selectedContact.name,
                    number: cleanNumber
                });
                contactId = newContact.id;
                const contactWithSelectedNumber = {
                    ...selectedContact,
                    number: cleanNumber,
                    id: newContact.id
                };
                setContactTicket(contactWithSelectedNumber);
            }
            
            setLoading(false);
            setNewTicketModalOpen(true);
        } catch (err) {
            setLoading(false);
            console.error("Erro ao processar contato:", err);
            toastError(err);
        }
    };

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
                    initialContact={contactTicket}
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
                                    {selectedContact.name || t("vcardPreview.contactName")}
                                </ContactName>

                                {selectedContact.allNumbers && selectedContact.allNumbers.length > 0 ? (
                                    selectedContact.allNumbers.map((num, index) => {
                                        const numberText = typeof num === 'string' ? num : num.number;
                                        const isMobile = typeof num === 'object' ? num.isMobile : numberText.includes('+55');
                                        const isWhatsapp = typeof num === 'object' ? num.isWhatsapp : selectedContact.isWhatsapp;
                                        
                                        const isPrimaryNumber = selectedContact.number === numberText;
                                        
                                        return (
                                            <Box key={index} sx={{ mb: index < selectedContact.allNumbers.length - 1 ? 1 : 0 }}>
                                                <ContactNumber>
                                                    {numberText || t("vcardPreview.numberNotAvailable")}
                                                </ContactNumber>
                                                <LabelText>
                                                    {isMobile ? 
                                                        t("vcardPreview.mobile", "Celular") : 
                                                        t("vcardPreview.number", "Número")}
                                                    {isPrimaryNumber && isWhatsapp ? " (WhatsApp)" : ""}
                                                </LabelText>
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Box>
                                        <ContactNumber>
                                            {selectedContact.number || t("vcardPreview.numberNotAvailable")}
                                        </ContactNumber>
                                        <LabelText>
                                            {selectedContact.number && selectedContact.number.includes('+55') ? 
                                                t("vcardPreview.mobile", "Celular") : 
                                                t("vcardPreview.number", "Número")}
                                            {selectedContact.isWhatsapp ? " (WhatsApp)" : ""}
                                        </LabelText>
                                    </Box>
                                )}
                            </ContactInfo>
                        </ContentContainer>

                        <Divider />

                        <ActionButtons>
                            <ConversarButton
                                variant="contained"
                                startIcon={<WhatsApp style={{ fontSize: 18 }} />}
                                onClick={handleConversarClick}
                                disabled={!selectedContact.number}
                            >
                                {t("vcardPreview.chat")}
                            </ConversarButton>
                        </ActionButtons>
                    </>
                )}
            </VcardContainer>
            <Dialog
                open={numberSelectionModalOpen}
                onClose={() => setNumberSelectionModalOpen(false)}
                aria-labelledby="number-selection-dialog-title"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="number-selection-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {t("vcardPreview.selectNumberTitle", "Selecione um número para conversar")}
                    <IconButton
                        aria-label="close"
                        onClick={() => setNumberSelectionModalOpen(false)}
                        size="small"
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <List sx={{ pt: 0 }}>
                        {selectedContact.allNumbers && selectedContact.allNumbers.map((num, index) => {
                            const numberObj = typeof num === 'string' ? { number: num } : num;
                            const numberText = numberObj.number || num;
                            const waidMatch = typeof numberText === 'string' ? numberText.match(/waid=(\d+)/) : null;
                            const isWhatsapp = waidMatch || (numberObj.isWhatsapp);
                            const formattedNumber = waidMatch ? 
                                `+${waidMatch[1].replace(/^(\d{2})(\d{2})(\d+)/, '$1 $2 $3')}` : 
                                numberText;
                            
                            return (
                                <ListItem disablePadding key={index}>
                                    <ListItemButton onClick={() => handleStartConversation(num)}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: isWhatsapp ? 'success.main' : 'primary.main' }}>
                                                <WhatsApp />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={formattedNumber} 
                                            secondary={isWhatsapp ? t("vcardPreview.whatsappNumber", "Número com WhatsApp") : t("vcardPreview.phoneNumber", "Número de telefone")}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNumberSelectionModalOpen(false)}>
                        {t("vcardPreview.cancel", "Cancelar")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default VcardPreview;
