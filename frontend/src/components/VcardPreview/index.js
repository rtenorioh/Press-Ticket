import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from "react-router-dom";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { AuthContext } from "../../context/Auth/AuthContext";

import { Button, Divider, } from "@material-ui/core";
import NewTicketModalPageContact from "../../components/NewTicketModalPageContact";


const VcardPreview = ({ contact, numbers }) => {
    const history = useHistory();
    const { user } = useContext(AuthContext);

    const [selectedContact, setContact] = useState({
        name: "",
        number: 0,
        profilePicUrl: ""
    });
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactTicket, setContactTicket] = useState({});

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    let contactObj = {
                        name: contact,
                        number: numbers.replace(/\D/g, ""),
                        email: ""
                    }
                    const { data } = await api.post("/contact", contactObj);
                    setContact(data)

                } catch (err) {
                    console.log(err)
                    toastError(err);
                }
            };
            fetchContacts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [contact, numbers]);

    // const handleNewChat = async () => {
    //     try {
    //         const { data: ticket } = await api.post("/tickets", {
    //             contactId: selectedContact.id,
    //             userId: user.id,
    //             status: "open",
    //         });
    //         history.push(`/tickets/${ticket.id}`);
    //     } catch (err) {
    //         toastError(err);
    //     }
    // }

    const handleCloseOrOpenTicket = (ticket) => {
        setNewTicketModalOpen(false);
        if (ticket !== undefined && ticket.id !== undefined) {
            history.push(`/tickets/${ticket.id}`);
        }
    };

    return (
        <>
            <div style={{
                minWidth: "250px",
            }}>
                <Grid container spacing={1}>
                    <NewTicketModalPageContact
                        modalOpen={newTicketModalOpen}
                        initialContact={selectedContact}
                        onClose={(ticket) => {
                            handleCloseOrOpenTicket(ticket);
                        }}
                    />
                    <Grid item xs={2}>
                        <Avatar src={selectedContact.profilePicUrl} />
                    </Grid>
                    <Grid item xs={9}>
                        <Typography style={{ marginTop: "12px", marginLeft: "10px" }} variant="subtitle1" color="primary" gutterBottom>
                            {selectedContact.name} <br></br>{selectedContact.number}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider />
                        {/* {contacts.map((contact) => (
                            <IconButton
                                key={contact.id}
                                size="small"
                                onClick={() => {
                                    setContactTicket(contact);
                                    setNewTicketModalOpen(true);
                                }}
                            >
                                <WhatsApp color="secondary" />
                            </IconButton>
                        ))} */}
                        <Button
                            fullWidth
                            color="primary"
                            key={selectedContact.id}
                            // onClick={handleNewChat}
                            onClick={() => {
                                setContactTicket(selectedContact.id);
                                setNewTicketModalOpen(true);
                            }}
                            disabled={!selectedContact.number}
                        >Conversar</Button>
                    </Grid>
                </Grid>
            </div>
        </>
    );

};

export default VcardPreview;