import { useTheme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
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
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";

const ContactsWithTicketsChart = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [chartData, setChartData] = useState([]);

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

    const { contactsWithTicketsByDay } = useTickets({ startDate, endDate, all: true });

    useEffect(() => {
        if (contactsWithTicketsByDay && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            const filteredData = contactsWithTicketsByDay.filter(data => {
                const currentDate = new Date(data.date.split("/").reverse().join("-"));
                return currentDate >= start && currentDate <= end;
            });

            setChartData(filteredData);
        } else {
            setChartData([]);
        }
    }, [contactsWithTicketsByDay, startDate, endDate]);

    return (
        <React.Fragment>
            <Title>{t("dashboard.contactsWithTickets.title")}</Title>
            <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
            >
                <TextField
                    label={t("dashboard.contactsWithTickets.date.start")}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label={t("dashboard.contactsWithTickets.date.end")}
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    barSize={40}
                    width={730}
                    height={250}
                    margin={{
                        top: 16,
                        right: 16,
                        bottom: 0,
                        left: 24,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary}>
                        <Label
                            angle={270}
                            position="left"
                            style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
                        >
                            {t("dashboard.contactsWithTickets.unique")}
                        </Label>
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={theme.palette.primary.main} />
                </BarChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
};

export default ContactsWithTicketsChart;
