import { useTheme } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from "recharts";
import useTickets from "../../hooks/useTickets";
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";

const Chart = () => {
	const theme = useTheme();
	const { t } = useTranslation();
	const [chartData, setChartData] = useState([]);
	const [startDate, setStartDate] = useState(() => {
		const d = new Date();
		d.setDate(d.getDate() - 6);
		return d.toISOString().substring(0, 10);
	});
	const [endDate, setEndDate] = useState(() => {
		const today = new Date();
		return today.toISOString().substring(0, 10);
	});
	const { tickets } = useTickets({ startDate, endDate, all: true });

	useEffect(() => {
		const start = new Date(startDate);
		const end = new Date(endDate);

		const dateArray = [];
		for (let d = new Date(start); 
		d <= end; 
		d.setDate(d.getDate() + 1)
	) {
			dateArray.push(new Date(d).toISOString().substring(0, 10));
		}

		const initialChartData = dateArray.map(date => ({
			date,
			amount: 0
		}));

		const updatedChartData = initialChartData.map(item => {
			const count = tickets.filter(ticket => {
				const ticketDate = new Date(ticket.createdAt).toISOString().substring(0, 10);
				return ticketDate === item.date;
			}).length;

			return { ...item, amount: count };
		});

		setChartData(updatedChartData);
	}, [tickets, startDate, endDate]);

	return (
		<React.Fragment>
			<Title>{`${t("dashboard.charts.perDay.title")} ${tickets.length}`}</Title>
			<div
				style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
			>
				<TextField
					label={t("dashboard.charts.date.start")}
					type="date"
					value={startDate}
					onChange={e => setStartDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					style={{ marginRight: "16px" }}
				/>
				<TextField
					label={t("dashboard.charts.date.end")}
					type="date"
					value={endDate}
					onChange={e => setEndDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					style={{ marginBottom: "16px" }}
				/>
			</div>
			<ResponsiveContainer>
				<AreaChart
					data={chartData}
					barSize={40}
					width={730}
					height={300}
					margin={{
						top: 16,
						right: 16,
						bottom: 0,
						left: 0,
					}}
				>
					<XAxis
						dataKey="date"
						tickLine={false}
						axisLine={false}
						stroke={theme.palette.text.secondary}
					/>
					<YAxis
						type="number"
						allowDecimals={false}
						stroke={theme.palette.text.secondary}
						tickLine={false}
						axisLine={false}
					/>
					<CartesianGrid vertical={false} strokeDasharray="4" opacity={0.3} />
					<Tooltip content={<CustomTooltip />} cursor={true} />
					<Area
						type="monotone"
						dataKey="amount"
						stroke={theme.palette.primary.main}
						strokeWidth={2}
						fillOpacity={0.7}
						fill="#3f51b5"
						activeDot={{ r: 8 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</React.Fragment>
	);
};

export default Chart;
