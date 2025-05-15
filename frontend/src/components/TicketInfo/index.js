import { Avatar, CardHeader, Typography, Box, Tooltip, useMediaQuery, useTheme, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Person, AccountTreeOutlined } from "@mui/icons-material";
import React from "react";
import { useTranslation } from "react-i18next";

const StyledAvatar = styled(Avatar)(({ theme }) => ({
	width: "52px",
	height: "52px",
	borderRadius: "15px",
	border: `2px solid ${theme.palette.primary.light}`,
	boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
	transition: "all 0.3s ease",
	"&:hover": {
		transform: "scale(1.05)",
		boxShadow: "0 5px 12px rgba(0,0,0,0.2)",
	},
	[theme.breakpoints.down("sm")]: {
		width: "42px",
		height: "42px",
		borderRadius: "12px",
	},
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
	padding: theme.spacing(1, 2),
	[theme.breakpoints.down("sm")]: {
		padding: theme.spacing(0.5, 1),
	},
}));

const TicketTitle = styled(Typography)(({ theme }) => ({
	fontWeight: 600,
	display: "flex",
	alignItems: "center",
	color: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.dark,
	[theme.breakpoints.down("sm")]: {
		fontSize: "0.9rem",
	},
}));

const TicketId = styled(Chip)(({ theme }) => ({
	background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
	color: "#fff",
	fontWeight: 500,
	height: "22px",
	fontSize: "0.75rem",
	marginLeft: theme.spacing(1),
	[theme.breakpoints.down("sm")]: {
		height: "20px",
		fontSize: "0.7rem",
	},
}));

const InfoChip = styled(Chip)(({ theme }) => ({
	height: "24px",
	fontSize: "0.75rem",
	backgroundColor: theme.palette.grey[100],
	color: theme.palette.grey[800],
	margin: theme.spacing(0.5),
	[theme.breakpoints.down("sm")]: {
		height: "20px",
		fontSize: "0.7rem",
	},
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const defaultImage = '/default-profile.png';

	const assignedTo = ticket.user ? ticket.user.name : t("messagesList.header.noAssignedUser");
	const queueName = ticket.queue ? ticket.queue.name : t("messagesList.header.noQueue");

	return (
		<StyledCardHeader
			onClick={onClick}
			sx={{ cursor: "pointer" }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={
				<Tooltip title={contact.name || ""} arrow placement="top">
					<StyledAvatar src={contact?.profilePicUrl || defaultImage} alt="contact_image" />
				</Tooltip>
			}
			title={
				<TicketTitle variant="subtitle1" noWrap>
					{contact.name}
					<TicketId 
						size="small" 
						label={`#${ticket.id}`}
						variant="filled"
					/>
				</TicketTitle>
			}
			subheader={
				ticket.user && (
					<Box sx={{ 
						display: "flex", 
						flexDirection: isMobile ? "column" : "row", 
						alignItems: "center",
						mt: 0.5,
						flexWrap: "wrap"
					}}>
						<Tooltip title={t("messagesList.header.assignedTo")} arrow placement="top">
							<InfoChip 
								icon={<Person fontSize="small" />}
								label={assignedTo}
								size="small"
								variant="outlined"
							/>
						</Tooltip>
						<Tooltip title={t("messagesList.header.queue")} arrow placement="top">
							<InfoChip 
								icon={<AccountTreeOutlined fontSize="small" />}
								label={queueName}
								size="small"
								variant="outlined"
							/>
						</Tooltip>
					</Box>
				)
			}
		/>
	);
};

export default TicketInfo;