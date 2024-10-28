import { TextField, useTheme } from "@material-ui/core";
import React, { useEffect, useState } from "react";
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
import { i18n } from "../../translate/i18n";
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";

const ChartPerUser = ({ searchParam, pageNumber, status, date, showAll, queueIds, withUnreadMessages }) => {
    const theme = useTheme();
    const { ticketsByUser } = useTickets({ searchParam, pageNumber, status, date, showAll, queueIds, withUnreadMessages });
    const [userChartData, setUserChartData] = useState([]);
    const [users, setUsers] = useState({});
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [selectedDate, setSelectedDate] = useState(getCurrentDate);

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
        if (
            ticketsByUser &&
            Object.keys(ticketsByUser).length > 0 &&
            Object.keys(users).length > 0
        ) {
            const userData = Object.entries(ticketsByUser)
                .map(([userId, dates]) => {
                    const userName = users[String(userId)] || "Sem Usuário";
                    const count = dates[selectedDate] || 0;
                    return {
                        userName,
                        count,
                    };
                });
            setUserChartData(userData);
        } else {
            setUserChartData([]);
        }
    }, [ticketsByUser, users, selectedDate]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    return (
        <React.Fragment>
            <Title>{i18n.t("dashboard.chartPerUser.title")}</Title>
            <TextField
                label={i18n.t("dashboard.chartPerUser.date.title")}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{
                    shrink: true,
                }}
                style={{ marginBottom: "16px" }}
            />
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
                            {i18n.t("dashboard.chartPerUser.ticket")}
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