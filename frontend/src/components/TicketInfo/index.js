import { Avatar, CardHeader } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";

const StyledAvatar = styled(Avatar)(({ theme }) => ({
	width: "50px",
	height: "50px",
	borderRadius: "25%"
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const { t } = useTranslation();
	const defaultImage = '/default-profile.png';

	return (
		<CardHeader
			onClick={onClick}
			sx={{ cursor: "pointer" }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={<StyledAvatar src={contact?.profilePicUrl || defaultImage} alt="contact_image" />}
			title={`${contact.name} #${ticket.id}`}
			subheader={
				ticket.user &&
				`${t("messagesList.header.assignedTo")}: ${ticket.user.name} | ${t("messagesList.header.queue")}: ${
					ticket.queue ? ticket.queue.name : t("messagesList.header.noQueue")
				}`
			}
		/>
	);
};

export default TicketInfo;