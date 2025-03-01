import { TextField, useTheme } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
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
                console.error("No data returned from API.");
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
    }, [users, startDate, endDate, t]);


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

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };

    return (
        <React.Fragment>
            <Title>{t("dashboard.ChartMessages.title")}</Title>
            <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
            >
                <TextField
                    label={t("dashboard.ChartMessages.date.start")}
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label={t("dashboard.ChartMessages.date.end")}
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    InputLabelProps={{ shrink: true }}
                />
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={messageData}
                    margin={{
                        top: 16,
                        right: 16,
                        bottom: 0,
                        left: 24,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="userName"
                        stroke={theme.palette.text.secondary}
                        style={{
                            fontSize: "0.8rem",
                            fontFamily: theme.typography.fontFamily,
                        }}
                    />
                    <YAxis
                        stroke={theme.palette.text.secondary}
                        style={{
                            fontSize: "0.8rem",
                            fontFamily: theme.typography.fontFamily,
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: theme.shape.borderRadius,
                        }}
                    />
                    <Legend />
                    <Bar
                        dataKey="enviadas"
                        name={t("dashboard.ChartMessages.messages.sent")}
                        fill={theme.palette.primary.main}
                    />
                    <Bar
                        dataKey="recebidas"
                        name={t("dashboard.ChartMessages.messages.received")}
                        fill={theme.palette.secondary.main}
                    />
                </BarChart>
            </ResponsiveContainer>
        </React.Fragment>
    );

};

export default ChartMessages;
