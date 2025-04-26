import { Checkbox, ListItemText, FormControl, MenuItem, Select } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const TicketsQueueSelect = ({
	userQueues,
	selectedQueueIds = [],
	onChange,
}) => {
	const { t } = useTranslation();

	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div style={{ width: 120, marginTop: -4 }}>
			<FormControl fullWidth margin="dense">
				<Select
					multiple
					displayEmpty
					variant="outlined"
					value={selectedQueueIds}
					onChange={handleChange}
					MenuProps={{
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "left",
						},
					}}
					renderValue={() => t("ticketsQueueSelect.placeholder")}
				>
					{userQueues?.length > 0 &&
						userQueues.map(queue => (
							<MenuItem dense key={queue.id} value={queue.id}>
								<Checkbox
									size="small"
									color="primary"
									checked={selectedQueueIds.indexOf(queue.id) > -1}
									sx={{
										color: queue.color,
									}}
								/>
								<ListItemText primary={queue.name} />
							</MenuItem>
						))}
				</Select>
			</FormControl>
		</div>
	);
};

export default TicketsQueueSelect;
