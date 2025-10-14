import { useTheme, styled } from "@mui/material/styles";
import ResponsiveDateFilter from "../../components/ResponsiveDateFilter";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
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

const ChartPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 1.5, 1.5, 1.5),
  background: theme.palette.mode === 'dark' 
    ? theme.palette.background.paper
    : `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.background.paper} 100%)`,
  borderRadius: 18,
  boxShadow: theme.palette.mode === 'dark'
    ? "0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 2px 8px 0 rgba(0, 0, 0, 0.3)"
    : "0 8px 32px 0 rgba(80, 80, 160, 0.12), 0 2px 8px 0 rgba(80, 80, 160, 0.08)",
  marginBottom: theme.spacing(1),
  overflow: 'unset',
  border: theme.palette.mode === 'dark' 
    ? `2px solid ${theme.palette.divider}` 
    : `1px solid ${theme.palette.grey[200]}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? "0 12px 40px 0 rgba(0, 0, 0, 0.6), 0 4px 12px 0 rgba(0, 0, 0, 0.4)"
      : "0 12px 40px 0 rgba(80, 80, 160, 0.16), 0 4px 12px 0 rgba(80, 80, 160, 0.12)",
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 1, 1, 1),
  },
}));

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
  <ChartPaper>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <Title sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.2rem' }}>{`${t("dashboard.charts.perDay.title")} ${tickets.length}`}</Title>
      <ResponsiveDateFilter
        startDateLabel={t("dashboard.charts.date.start")}
        endDateLabel={t("dashboard.charts.date.end")}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
    </Box>
    <ResponsiveContainer width="100%" height={210}>
        <AreaChart
          data={chartData}
          margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            stroke={theme.palette.text.secondary}
            fontSize={14}
          />
          <YAxis
            type="number"
            allowDecimals={false}
            stroke={theme.palette.text.secondary}
            tickLine={false}
            axisLine={false}
            fontSize={14}
          />
          <CartesianGrid vertical={false} strokeDasharray="4" opacity={0.18} />
          <Tooltip content={<CustomTooltip />} cursor={true} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            fillOpacity={0.7}
            fill={theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light}
            activeDot={{ r: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
  </ChartPaper>
);
};

export default Chart;
