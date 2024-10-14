import { IconButton, Tooltip } from "@material-ui/core";
import { Email, Facebook, Instagram, Sms, Telegram } from "@material-ui/icons";
import React from "react";

const ContactChannels = ({ contact, handleSaveTicket, setContactTicket, setNewTicketModalOpen }) => {
    const channels = [];

    if (contact.telegramId) {
        channels.push(
            <>
                <IconButton size="small" onClick={() => handleSaveTicket(contact.id)}>
                    <Tooltip title="Telegram" arrow placement="left">
                        <Telegram style={{ color: "#0088cc" }} />
                    </Tooltip>
                </IconButton>
                {contact.telegramId}
            </>
        );
    }

    if (contact.messengerId) {
        channels.push(
            <>
                <IconButton size="small" onClick={() => handleSaveTicket(contact.id)}>
                    <Tooltip title="Facebook" arrow placement="left">
                        <Facebook style={{ color: "#3b5998" }} />
                    </Tooltip>
                </IconButton>
                {contact.messengerId}
            </>
        );
    }

    if (contact.instagramId) {
        channels.push(
            <>
                <IconButton size="small" onClick={() => setContactTicket(contact) && setNewTicketModalOpen(true)}>
                    <Tooltip title="Instagram" arrow placement="left">
                        <Instagram style={{ color: "#cd486b" }} />
                    </Tooltip>
                </IconButton>
                {contact.instagramId}
            </>
        );
    }

    if (contact.email) {
        channels.push(
            <>
                <IconButton size="small" onClick={() => handleSaveTicket(contact.id)}>
                    <Tooltip title="Email" arrow placement="left">
                        <Email style={{ color: "#004f9f" }} />
                    </Tooltip>
                </IconButton>
                {contact.email}
            </>
        );
    }

    if (contact.webchatId) {
        channels.push(
            <>
                <IconButton size="small" onClick={() => handleSaveTicket(contact.id)}>
                    <Tooltip title="WebChat" arrow placement="left">
                        <Sms style={{ color: "#EB6D58" }} />
                    </Tooltip>
                </IconButton>
                {contact.webchatId}
            </>
        );
    }

    return channels.length > 0 ? channels.map((channel, index) => <React.Fragment key={index}>{channel}</React.Fragment>) : "-";
};

export default ContactChannels;
