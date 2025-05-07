import { Chip, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const ChipsContainer = styled('div')(({ theme }) => ({
	display: "flex",
	flexWrap: "wrap",
}));

const StyledChip = styled(Chip)(({ theme }) => ({
	margin: 2,
}));

const QueueSelect = ({ selectedQueueIds, onChange }) => {
	const [queues, setQueues] = useState([]);
	const { t } = useTranslation();
	const loaded = useRef(false);

	useEffect(() => {
		if (loaded.current) return;

		(async () => {
			try {
				const { data } = await api.get("/queue");
				setQueues(data);
				loaded.current = true;
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel>{t("queueSelect.inputLabel")}</InputLabel>
				<Select
					multiple
					label={t("queueSelect.inputLabel")}
					value={selectedQueueIds}
					onChange={handleChange}
					inputProps={{
						'aria-label': t("queueSelect.inputLabel"),
					}}
					MenuProps={{
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "left",
						},
						getContentAnchorEl: null,
					}}
					renderValue={selected => (
						<ChipsContainer>
							{selected?.length > 0 &&
								selected.map(id => {
									const queue = queues?.find(q => q.id === id);
									return queue ? (
										<StyledChip
											key={id}
											sx={{ backgroundColor: queue.color || "#f0f0f0" }}
											variant="outlined"
											label={queue.name}
										/>
									) : null;
								})}
						</ChipsContainer>
					)}
				>
					{queues?.map(queue => (
						<MenuItem key={queue.id} value={queue.id}>
							{queue.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default QueueSelect;
