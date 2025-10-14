import { useTheme } from "@mui/material";
import { styled, Paper, Box } from "@mui/material";
import ResponsiveDateFilter from "../../components/ResponsiveDateFilter";
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useSocket } from "../../hooks/useSocket";
import useUsers from "../../hooks/useUsers";
import api from "../../services/api";
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

const ChartMessages = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const { records: users } = useUsers();
    const { socket, on, off } = useSocket();
    const [messageData, setMessageData] = useState([]);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().substring(0, 10);
    });
    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        return today.toISOString().substring(0, 10);
    });

    const fetchMessages = useCallback(async () => {
        try {
            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
            const formattedEndDate = adjustedEndDate.toISOString().substring(0, 10);

            const { data } = await api.get("/messages/count?all=true", {
                params: { startDate, endDate: formattedEndDate },
            });

            if (!data || data.length === 0) {
                setMessageData([]);
                return;
            }

            const chartData = data
                .map((item) => {
                    const userObj = users.find((u) => u.id === Number(item.id));
                    return {
                        userName: userObj ? userObj.name : t("dashboard.ChartMessages.noUser"),
                        enviadas: Number(item.send),
                        recebidas: Number(item.receive),
                    };
                })
                .filter((item) => item.enviadas > 0 || item.recebidas > 0);

            setMessageData(chartData);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    }, [startDate, endDate, users, t]);

    useEffect(() => {
        if (users?.length > 0) {
            fetchMessages();
        }
    }, [users, fetchMessages]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = () => {
            fetchMessages();
        };

        on("appMessage", handleNewMessage);

        return () => {
            off("appMessage");
        };
    }, [socket, on, off, fetchMessages]);

    return (
        <ChartPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', margin: 0, padding: 0, gap: 67 }}>
                <Title sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.1rem', mb: 0 }}>{t("dashboard.ChartMessages.title")}</Title>
                <ResponsiveDateFilter
                    startDateLabel={t("dashboard.ChartMessages.date.start")}
                    endDateLabel={t("dashboard.ChartMessages.date.end")}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />
            </Box>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={messageData}
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
                    <XAxis
                        dataKey="userName"
                        stroke={theme.palette.text.secondary}
                        sx={{
                            fontSize: "0.9rem",
                            fontFamily: theme.typography.fontFamily,
                        }}
                        tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                        stroke={theme.palette.text.secondary}
                        sx={{
                            fontSize: "0.9rem",
                            fontFamily: theme.typography.fontFamily,
                        }}
                        tick={{ fill: theme.palette.text.secondary }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: theme.shape.borderRadius,
                        }}
                        itemStyle={{ fontSize: '1rem' }}
                        cursor={{ fill: theme.palette.action.hover, opacity: 0.07 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '0.95rem', marginTop: 8 }} />
                    <Bar
                        dataKey="enviadas"
                        name={t("dashboard.ChartMessages.messages.sent")}
                        fill={theme.palette.primary.main}
                        radius={[8, 8, 0, 0]}
                        maxBarSize={36}
                        isAnimationActive={true}
                    />
                    <Bar
                        dataKey="recebidas"
                        name={t("dashboard.ChartMessages.messages.received")}
                        fill={theme.palette.secondary.main}
                        radius={[8, 8, 0, 0]}
                        maxBarSize={36}
                        isAnimationActive={true}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartPaper>
    );

};

export default ChartMessages;
