import { useTheme } from "@mui/material/styles";
import { styled, Paper, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import useTickets from "../../hooks/useTickets";
import api from "../../services/api";
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";
import ResponsiveDateFilter from "../../components/ResponsiveDateFilter";

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

const ChartPerUser = ({ searchParam, pageNumber, status, showAll, queueIds, withUnreadMessages }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().substring(0, 10);
    });
    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        return today.toISOString().substring(0, 10);
    });
    const [userChartData, setUserChartData] = useState([]);
    const [users, setUsers] = useState({});
    const { ticketsByUser } = useTickets({
        searchParam,
        pageNumber,
        status: undefined,
        startDate,
        endDate,
        showAll,
        all: true,
        queueIds,
        withUnreadMessages
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get("/users");
                const usersMap = data.users.reduce((acc, user) => {
                    acc[String(user.id)] = user.name;
                    return acc;
                }, {});
                setUsers(usersMap);
            } catch (err) {
                console.error("Erro ao buscar usuários:", err);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!ticketsByUser || !users) {
            setUserChartData([]);
            return;
        }

        const userData = Object.entries(ticketsByUser).map(([userId, datesObj]) => {
            const userName = users[String(userId)] || "Sem Usuário";

            let count = 0;
            for (const [dateKey, dateCount] of Object.entries(datesObj)) {
                if (dateKey >= startDate && dateKey <= endDate) {
                    count += dateCount;
                }
            }

            return { userName, count };
        });

        setUserChartData(userData);
    }, [ticketsByUser, users, startDate, endDate]);

    return (
        <ChartPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', margin: 0, padding: 0, gap: 70 }}>
                <Title sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.1rem', mb: 0 }}>{t("dashboard.chartPerUser.title")}</Title>
                <ResponsiveDateFilter
                    startDateLabel={t("dashboard.chartPerUser.date.start")}
                    endDateLabel={t("dashboard.chartPerUser.date.end")}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />
            </Box>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={userChartData}
                    margin={{
                        top: 16,
                        right: 16,
                        bottom: 0,
                        left: 24,
                    }}
                    barGap={4}
                    barCategoryGap={18}
                >
                    <CartesianGrid strokeDasharray="2 4" stroke={theme.palette.divider} />
                    <XAxis dataKey="userName" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary }}>
                        {/* <Label
                            angle={270}
                            position="left"
                            sx={{ textAnchor: "middle", fill: theme.palette.text.primary }}
                        >
                            {t("dashboard.chartPerUser.ticket")}
                        </Label> */}
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover, opacity: 0.07 }} />
                    <Bar dataKey="count" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} maxBarSize={36} isAnimationActive={true} />
                </BarChart>
            </ResponsiveContainer>
        </ChartPaper>
    );
};

export default ChartPerUser;
