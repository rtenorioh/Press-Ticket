import { IconButton, Tooltip, useTheme } from "@mui/material";
import { Email, Facebook, Instagram, Sms, Telegram } from "@mui/icons-material";
import React from "react";

const ContactChannels = ({ contact, handleSaveTicket, setContactTicket, setNewTicketModalOpen }) => {
    const theme = useTheme();
    const channels = [
        {
            id: contact.telegramId,
            label: "Telegram",
            color: theme.palette.mode === 'dark' ? theme.palette.info.light : "#0088cc",
            Icon: Telegram,
            action: () => handleSaveTicket(contact.id),
        },
        {
            id: contact.messengerId,
            label: "Facebook",
            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : "#3b5998",
            Icon: Facebook,
            action: () => handleSaveTicket(contact.id),
        },
        {
            id: contact.instagramId,
            label: "Instagram",
            color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : "#cd486b",
            Icon: Instagram,
            action: () => {
                setContactTicket(contact);
                setNewTicketModalOpen(true);
            },
        },
        {
            id: contact.email,
            label: "Email",
            color: theme.palette.mode === 'dark' ? theme.palette.info.main : "#004f9f",
            Icon: Email,
            action: () => handleSaveTicket(contact.id),
        },
        {
            id: contact.webchatId,
            label: "WebChat",
            color: theme.palette.mode === 'dark' ? theme.palette.warning.light : "#EB6D58",
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
                            {React.createElement(channel.Icon, { sx: { color: channel.color } })}
                        </Tooltip>
                    </IconButton>
                    {channel.id}
                </React.Fragment>
            ))}
        </>
    );
};

export default ContactChannels;
