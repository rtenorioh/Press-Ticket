import React from "react";

import { Avatar, CardHeader } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(() => ({
	avatar: {
		width: "50px",
		height: "50px",
		borderRadius: "25%"
	}
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const classes = useStyles();
	return (
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer" }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={<Avatar src={contact.profilePicUrl} className={classes.avatar} alt="contact_image" />}
			title={`${contact.name} #${ticket.id}`}
			subheader={
				ticket.user &&
				`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name} 
				${ticket.queue ? ' | Setor: ' + ticket.queue.name : ' | Setor: Nenhum'}`
			}
		/>
	);
};

export default TicketInfo;