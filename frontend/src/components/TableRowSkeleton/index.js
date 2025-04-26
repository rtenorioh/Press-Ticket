import React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";

const CustomTableCell = styled('div')({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
});

const TableRowSkeleton = ({ avatar, columns }) => {
	return (
		<>
			<TableRow>
				{avatar && (
					<>
						<TableCell style={{ paddingRight: 0 }}>
							<Skeleton
								animation="wave"
								variant="circular"
								width={40}
								height={40}
							/>
						</TableCell>
						<TableCell>
							<Skeleton animation="wave" height={30} width={80} />
						</TableCell>
					</>
				)}
				{Array.from({ length: columns }, (_, index) => (
					<TableCell align="center" key={index}>
						<CustomTableCell>
							<Skeleton
								align="center"
								animation="wave"
								height={30}
								width={80}
							/>
						</CustomTableCell>
					</TableCell>
				))}
			</TableRow>
		</>
	);
};

export default TableRowSkeleton;
