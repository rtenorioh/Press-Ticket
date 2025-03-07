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

const ChartPerQueue = ({ queueIds, withUnreadMessages }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    
    const formatDate = (date) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const formatQueueIds = (ids) => {
        if (!ids) return undefined;
        if (Array.isArray(ids)) {
            return ids.join(',');
        }
        return String(ids);
    };

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return formatDate(d);
    });

    const [endDate, setEndDate] = useState(() => {
        return formatDate(new Date());
    });

    const { tickets, error } = useTickets({
        pageNumber: 1,
        startDate: startDate ? formatDate(startDate) : undefined,
        endDate: endDate ? formatDate(endDate) : undefined,
        all: true,
        showAll: true,
        queueIds: formatQueueIds(queueIds),
        withUnreadMessages,
    });

    const [queueChartData, setQueueChartData] = useState([]);

    useEffect(() => {
        if (error) {
            console.error('ChartPerQueue - Erro:', error);
            setQueueChartData([]);
            return;
        }

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
    }, [tickets, queueIds, error]);

    return (
        <React.Fragment>
            <Title>{t("dashboard.chartPerQueue.perQueue.title")}</Title>
            <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
            >
                <TextField
                    label={t("dashboard.chartPerQueue.date.start")}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label={t("dashboard.chartPerQueue.date.end")}
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </div>
            {queueChartData.length > 0 ? (
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={queueChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="40%"
                            cy="50%"
                            outerRadius={80}
                            fill={theme.palette.primary.main}
                            label
                        >
                            {queueChartData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    {error ? 'Erro ao carregar dados' : 'Nenhum dado disponível para o período selecionado'}
                </div>
            )}
        </React.Fragment>
    );
};

export default ChartPerQueue;