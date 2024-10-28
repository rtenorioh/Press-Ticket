import { useTheme } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { format, parseISO, startOfHour } from "date-fns";
import React, { useEffect, useState } from "react";
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
import { i18n } from "../../translate/i18n";
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";

const Chart = () => {
	const theme = useTheme();
	const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
	const { tickets } = useTickets({ date: selectedDate });
	const [chartData, setChartData] = useState([]);

	useEffect(() => {
		const initialChartData = Array.from({ length: 24 * 2 }, (_, index) => {
			const hours = Math.floor(index / 2);
			const minutes = index % 2 === 0 ? "00" : "30";
			return { time: `${String(hours).padStart(2, '0')}:${minutes}`, amount: 0 };
		});

		const updatedChartData = initialChartData.map((dataPoint) => {
			const count = tickets.filter((ticket) => {
				const ticketTime = format(startOfHour(parseISO(ticket.createdAt)), "HH:mm");
				return ticketTime === dataPoint.time;
			}).length;

			return { ...dataPoint, amount: count };
		});

		setChartData(updatedChartData);
	}, [tickets, selectedDate]);

	const handleDateChange = (event) => {
		setSelectedDate(event.target.value);
	};

	return (
		<React.Fragment>
			<Title>{`${i18n.t("dashboard.charts.perDay.title")}${tickets.length}`}</Title>
			<TextField
				label={i18n.t("dashboard.charts.date.title")}
				type="date"
				value={selectedDate}
				onChange={handleDateChange}
				InputLabelProps={{
					shrink: true,
				}}
				style={{ marginBottom: "16px" }}
			/>
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
						dataKey="time"
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
