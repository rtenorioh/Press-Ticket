import { useTheme } from "@mui/material/styles";
import ResponsiveDateFilter from "../../components/ResponsiveDateFilter";
import { styled, Paper, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
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

const ChartPerQueue = ({ queueIds, withUnreadMessages }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    const { tickets } = useTickets({
        pageNumber: 1,
        status: undefined,
        startDate,
        endDate,
        all: true,
        showAll: true,
        queueIds,
        withUnreadMessages,
    });

    const [queueChartData, setQueueChartData] = useState([]);

    useEffect(() => {
        if (!tickets || tickets.length === 0) {
            setQueueChartData([]);
            return;
        }

        const queueData = tickets.reduce((acc, ticket) => {
            const queueName = ticket.queue?.name || "Sem Setor";
            const queueColor = ticket.queue?.color || "#7C7C7C";

            if (!acc[queueName]) {
                acc[queueName] = { value: 0, color: queueColor };
            }
            acc[queueName].value++;

            return acc;
        }, {});

        const formattedData = Object.entries(queueData)
            .map(([name, { value, color }]) => ({
                name,
                value,
                color,
            }))
            .sort((a, b) => b.value - a.value);

        setQueueChartData(formattedData);
    }, [tickets, queueIds]);

    const filteredChartData = queueChartData.filter(data => data.value > 0);

    return (
      <ChartPaper>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', margin: 0, padding: 0, gap: 1 }}>
          <Title sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.1rem', mb: 0 }}>{t("dashboard.chartPerQueue.perQueue.title")}</Title>
          <ResponsiveDateFilter
            startDateLabel={t("dashboard.chartPerQueue.date.start")}
            endDateLabel={t("dashboard.chartPerQueue.date.end")}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </Box>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={filteredChartData.length > 0 ? filteredChartData : [{ name: 'Sem dados', value: 1, color: '#d1d1d1' }]}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              fill={theme.palette.primary.main}
              dataKey="value"
              labelLine={false}
              label={({ name, value, percent }) =>
                filteredChartData.length > 0 && value > 0
                  ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  : null
              }
              isAnimationActive={true}
              animationDuration={900}
              stroke="#fff"
              strokeWidth={3}
            >
              {(filteredChartData.length > 0 ? filteredChartData : [{ name: 'Sem dados', value: 1, color: '#d1d1d1' }]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0 2px 8px rgba(80,80,160,0.10))' }} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={true} />
          </PieChart>
        </ResponsiveContainer>
      </ChartPaper>
    );
};

export default ChartPerQueue;
