import React from "react";

import { Avatar, Card, CardHeader, Skeleton, styled } from "@mui/material";

const TicketHeaderCard = styled(Card)(({ theme }) => ({
	display: "flex",
	backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.grey[100],
	flex: "none",
	borderBottom: `1px solid ${theme.palette.divider}`,
}));

const TicketHeaderSkeleton = () => {
	return (
		<TicketHeaderCard square>
			<CardHeader
				titleTypographyProps={{ noWrap: true }}
				subheaderTypographyProps={{ noWrap: true }}
				avatar={
					<Skeleton animation="wave" variant="circular">
						<Avatar alt="contact_image" />
					</Skeleton>
				}
				title={<Skeleton animation="wave" width={80} />}
				subheader={<Skeleton animation="wave" width={140} />}
			/>
		</TicketHeaderCard>
	);
};

export default TicketHeaderSkeleton;
