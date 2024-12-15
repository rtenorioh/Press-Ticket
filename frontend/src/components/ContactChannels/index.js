import { IconButton, Tooltip } from "@material-ui/core";
import { Email, Facebook, Instagram, Sms, Telegram } from "@material-ui/icons";
import React from "react";

const ContactChannels = ({ contact, handleSaveTicket, setContactTicket, setNewTicketModalOpen }) => {
    const channels = [
        {
            id: contact.telegramId,
            label: "Telegram",
            color: "#0088cc",
            Icon: Telegram,
            action: () => handleSaveTicket(contact.id),
        },
        {
            id: contact.messengerId,
            label: "Facebook",
            color: "#3b5998",
            Icon: Facebook,
            action: () => handleSaveTicket(contact.id),
        },
        {
            id: contact.instagramId,
            label: "Instagram",
            color: "#cd486b",
            Icon: Instagram,
            action: () => {
                setContactTicket(contact);
                setNewTicketModalOpen(true);
            },
        },
        {
            id: contact.email,
            label: "Email",
            color: "#004f9f",
            Icon: Email,
            action: () => handleSaveTicket(contact.id),
        },
        {
            id: contact.webchatId,
            label: "WebChat",
            color: "#EB6D58",
            Icon: Sms,
            action: () => handleSaveTicket(contact.id),
        },
    ];

    return (
        <>
            {channels.filter(channel => channel.id).map((channel, index) => (
                <React.Fragment key={index}>
                    <IconButton
                        size="small"
                        onClick={channel.action}
                        aria-label={`Open ${channel.label}`}
                    >
                        <Tooltip title={channel.label} arrow placement="left">
                            <channel.Icon style={{ color: channel.color }} />
                        </Tooltip>
                    </IconButton>
                    {channel.id}
                </React.Fragment>
            ))}
        </>
    );
};

export default ContactChannels;
