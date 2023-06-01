import React from "react";

import { Avatar, CardHeader } from "@material-ui/core";

//import { i18n } from "../../translate/i18n";

const TicketInfo = ({ contact, ticket, onClick }) => {
	return (
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer", height: "55px" }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={<Avatar style={{height: 40, width: 40, borderRadius: 4,}}src={contact.profilePicUrl} alt="contact_image" />}
			title={`${contact.name}`}
			subheader={
				ticket.user &&
				`Chamado Nº ${ticket.id}`
			}
		/>
	);
};

export default TicketInfo;