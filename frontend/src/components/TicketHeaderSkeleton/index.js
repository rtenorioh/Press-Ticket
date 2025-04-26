import React from "react";

import { Avatar, Card, CardHeader, Skeleton, styled } from "@mui/material";

const TicketHeaderCard = styled(Card)(({ theme }) => ({
	display: "flex",
	backgroundColor: "#eee",
	flex: "none",
	borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
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
