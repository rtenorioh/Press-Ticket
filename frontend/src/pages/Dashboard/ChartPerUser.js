import { TextField, useTheme } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Label,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import useTickets from "../../hooks/useTickets";
import api from "../../services/api";
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";

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

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };

    return (
        <React.Fragment>
            <Title>{t("dashboard.chartPerUser.title")}</Title>
            <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
            >
                <TextField
                    label={t("dashboard.chartPerUser.date.start")}
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label={t("dashboard.chartPerUser.date.end")}
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    InputLabelProps={{ shrink: true }}
                />
            </div>
            <ResponsiveContainer>
                <BarChart
                    data={userChartData}
                    barSize={40}
                    width={730}
                    height={300}
                    margin={{
                        top: 16,
                        right: 16,
                        bottom: 0,
                        left: 24,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="userName" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary}>
                        <Label
                            angle={270}
                            position="left"
                            style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
                        >
                            {t("dashboard.chartPerUser.ticket")}
                        </Label>
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} cursor={true} />
                    <Bar dataKey="count" fill={theme.palette.primary.main} />
                </BarChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
};

export default ChartPerUser;