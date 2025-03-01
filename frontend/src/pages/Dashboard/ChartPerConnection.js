import { useTheme } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import useTickets from "../../hooks/useTickets";
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";

const ChartPerConnection = ({ searchParam, pageNumber, status, showAll, queueIds, withUnreadMessages }) => {
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
    const { tickets } = useTickets({
        searchParam,
        pageNumber,
        status,
        startDate,
        endDate,
        showAll,
        all: true,
        queueIds,
        withUnreadMessages,
    });
    const [connectionChartData, setConnectionChartData] = useState([]);

    useEffect(() => {
        const connectionData = tickets.reduce((acc, ticket) => {
            const connectionName = ticket.whatsapp?.name || "Sem Conexão";
            const connectionColor = ticket.whatsapp?.color || "#5C59A0";

            if (!acc[connectionName]) {
                acc[connectionName] = { value: 0, color: connectionColor };
            }
            acc[connectionName].value++;

            return acc;
        }, {});

        const formattedData = Object.entries(connectionData).map(([name, { value, color }]) => ({
            name,
            value,
            color,
        }));

        setConnectionChartData(formattedData);
    }, [tickets]);

    const filteredChartData = connectionChartData.filter(data => data.value > 0);

    return (
        <React.Fragment>
            <Title>{t("dashboard.chartPerConnection.perConnection.title")}</Title>
            <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
            >
                <TextField
                    label={t("dashboard.chartPerConnection.date.start")}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label={t("dashboard.chartPerConnection.date.end")}
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </div>
            <ResponsiveContainer width="95%" height={265}>
                <PieChart>
                    <Pie
                        data={filteredChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="40%"
                        cy="50%"
                        outerRadius={80}
                        fill={theme.palette.primary.main}
                        label
                    >
                        {filteredChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={true} />
                    {filteredChartData.length > 0 && (
                        <Legend verticalAlign="middle" align="right" layout="vertical" />
                    )}
                </PieChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
};

export default ChartPerConnection;
