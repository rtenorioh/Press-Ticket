import { useTheme } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from "react";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";

const ChartPerQueue = ({ searchParam, pageNumber, status, date, showAll, queueIds, withUnreadMessages }) => {
    const theme = useTheme();

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getCurrentDate());
    const { tickets } = useTickets({
        searchParam,
        pageNumber,
        status,
        date: selectedDate,
        showAll,
        queueIds,
        withUnreadMessages,
    });

    const [queueChartData, setQueueChartData] = useState([]);
    useEffect(() => {
        const queueData = tickets.reduce((acc, ticket) => {
            const queueName = ticket.queue?.name || "Sem Setor";
            const queueColor = ticket.queue?.color || "#7C7C7C";

            if (!acc[queueName]) {
                acc[queueName] = { value: 0, color: queueColor };
            }
            acc[queueName].value++;

            return acc;
        }, {});

        const formattedData = Object.entries(queueData).map(([name, { value, color }]) => ({
            name,
            value,
            color,
        }));

        setQueueChartData(formattedData);
    }, [tickets]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    return (
        <React.Fragment>
            <Title>{i18n.t("dashboard.chartPerQueue.perQueue.title")}</Title>
            <TextField
                label={i18n.t("dashboard.chartPerQueue.date.title")}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{
                    shrink: true,
                }}
                style={{ marginBottom: "16px" }}
            />
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={queueChartData}
                        cx="40%"
                        cy="50%"
                        outerRadius={80}
                        fill={theme.palette.primary.main}
                        dataKey="value"
                        label
                    >
                        {queueChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={true} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
};

export default ChartPerQueue;
