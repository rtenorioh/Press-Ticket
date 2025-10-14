import { useTheme } from "@mui/material/styles";
import { styled, Paper, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import ResponsiveDateFilter from "../../components/ResponsiveDateFilter";
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

const NewContactsChart = ({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    queueIds,
    withUnreadMessages,
}) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const { newContactsByDay } = useTickets({
        searchParam,
        pageNumber,
        status,
        date,
        showAll,
        all: true,
        queueIds,
        withUnreadMessages,
    });

    const [contactsChartData, setContactsChartData] = useState([]);

    const getLastWeekDateRange = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        return { start, end };
    };

    useEffect(() => {
        if (!startDate && !endDate) {
            const { start, end } = getLastWeekDateRange();

            const formatToLocalDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            setStartDate(formatToLocalDate(start));
            setEndDate(formatToLocalDate(end));
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (!startDate || !endDate) return;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const dateArray = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dateArray.push(new Date(d).toISOString().substring(0, 10));
        }

        const initialChartData = dateArray.map(date => ({
            date,
            count: 0
        }));

        const updatedChartData = initialChartData.map(item => {
            const displayDate = item.date.split('-').reverse().join('/');
            const count = newContactsByDay[displayDate] || 0;
            return { ...item, count };
        });

        setContactsChartData(updatedChartData);

    }, [newContactsByDay, startDate, endDate]);

    return (
        <ChartPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', margin: 0, padding: 0, gap: 2 }}>
                <Title sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.1rem', mb: 0 }}>{t("dashboard.newContacts.title")}</Title>
                <ResponsiveDateFilter
                    startDateLabel={t("dashboard.newContacts.date.start")}
                    endDateLabel={t("dashboard.newContacts.date.end")}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />
            </Box>
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                    data={contactsChartData}
                    margin={{
                        top: 16,
                        right: 16,
                        bottom: 0,
                        left: 24,
                    }}
                >
                    <CartesianGrid strokeDasharray="2 4" stroke={theme.palette.divider} />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary }}>
                        {/* <Label
                            angle={270}
                            position="left"
                            sx={{ textAnchor: "middle", fill: theme.palette.text.secondary }}
                        >
                            {t("dashboard.newContacts.contact")}
                        </Label> */}
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover, opacity: 0.07 }} />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke={theme.palette.primary.main}
                        fill={theme.palette.primary.light}
                        fillOpacity={0.4}
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartPaper>
    );
};
export default NewContactsChart;
