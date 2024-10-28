import { useTheme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import React, { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Label,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";

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
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const { newContactsByDay } = useTickets({
        searchParam,
        pageNumber,
        status,
        date,
        showAll,
        queueIds,
        withUnreadMessages,
    });

    const [contactsChartData, setContactsChartData] = useState([]);

    const generateDateRange = (start, end) => {
        const dateArray = [];
        let currentDate = new Date(start);

        while (currentDate <= end) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            dateArray.push(formattedDate);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dateArray;
    };


    const getLastWeekDateRange = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        return { start, end };
    };

    useEffect(() => {
        if (!startDate && !endDate) {
            const { start, end } = getLastWeekDateRange();
            setStartDate(start.toISOString().split("T")[0]);
            setEndDate(end.toISOString().split("T")[0]);
        }
    }, [newContactsByDay, startDate, endDate]);

    useEffect(() => {
        if (newContactsByDay && Object.keys(newContactsByDay).length > 0 && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            const dateRange = generateDateRange(start, end);

            const formattedData = dateRange.map((date) => {
                const formattedDate = date.split("-").reverse().join("/");
                const contactCount = newContactsByDay[formattedDate] || 0;

                return {
                    date: formattedDate,
                    count: contactCount,
                };
            });

            setContactsChartData(formattedData);
        } else {
            setContactsChartData([]);
        }
    }, [newContactsByDay, startDate, endDate]);

    return (
        <React.Fragment>
            <Title>{i18n.t("dashboard.newContacts.title")}</Title>
            <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}
            >
                <TextField
                    label={i18n.t("dashboard.newContacts.date.start")}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    label={i18n.t("dashboard.newContacts.date.end")}
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>
            <ResponsiveContainer>
                <AreaChart
                    data={contactsChartData}
                    margin={{ top: 16, right: 16, bottom: 0, left: 24 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary}>
                        <Label
                            angle={270}
                            position="left"
                            style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
                        >
                            {i18n.t("dashboard.newContacts.contact")}
                        </Label>
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        fillOpacity={0.7}
                        fill={theme.palette.primary.light}
                        activeDot={{ r: 8 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
};
export default NewContactsChart;
