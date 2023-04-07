import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
	// BarChart,
	CartesianGrid,
	// Bar,
	XAxis,
	Tooltip,
  AreaChart,
  Area,
  // Line,
  LineChart,
	YAxis,
	// Label,
	ResponsiveContainer,
} from "recharts";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import { startOfHour, parseISO, format } from "date-fns";

import { i18n } from "../../translate/i18n";
import Title from "./Title";
import useTickets from "../../hooks/useTickets";
import { Divider } from "@material-ui/core";
// import { blue } from "@material-ui/core/colors";



const Chart = () => {
	const theme = useTheme();
	const date = useRef(new Date().toISOString());
	const { tickets } = useTickets({ date: date.current });
	function getIntroOfPage(label) {
  		if (label === 'Page A') {
    return 'Page A is about mens clothing';
  } if (label === 'Page B') {
    return 'Page B is about womens dress';
  } if (label === 'Page C') {
    return 'Page C is about womens bag';
  } if (label === 'Page D') {
    return 'Page D is about household goods';
  } if (label === 'Page E') {
    return 'Page E is about food';
  } if (label === 'Page F') {
    return 'Page F is about baby food';
  }
}

function CustomTooltip({ payload, label, active }) {
  if (active) {
    return (
      <div>
        <div style={{ backgroundColor: "#333333ff", borderRadius:"4px", outline: "none" }}>
          <div>
            {payload.map((pld) => (
              <div style={{ display: "inline-block", padding: 10 }}>
                <div style={{ color: "white", fontWeight:"600", fontSize:"13px" }}>{`${label}`}</div>
                <div style={{ color: "white",fontWeight:"400", fontSize:"13px" }}>Tickets: {pld.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: "0",
            height: "0",
            borderLeft: "5px solid transparent",
            marginLeft: "35px",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #333333ff",
          }}
        ></div>
      </div>
    );
  }

  return null;
}
	const [chartData, setChartData] = useState([
		{ time: "01:00", amount: 0 },
		{ time: "02:00", amount: 0 },
		{ time: "03:00", amount: 0 },
		{ time: "04:00", amount: 0 },
		{ time: "05:00", amount: 0 },
		{ time: "06:00", amount: 0 },
		{ time: "07:00", amount: 0 },
		{ time: "08:00", amount: 0 },
		{ time: "09:00", amount: 0 },
		{ time: "10:00", amount: 0 },
		{ time: "11:00", amount: 0 },
		{ time: "12:00", amount: 0 },
		{ time: "13:00", amount: 0 },
		{ time: "14:00", amount: 0 },
		{ time: "15:00", amount: 0 },
		{ time: "16:00", amount: 0 },
		{ time: "17:00", amount: 0 },
		{ time: "18:00", amount: 0 },
		{ time: "19:00", amount: 0 },
		{ time: "20:00", amount: 0 },
		{ time: "21:00", amount: 0 },
		{ time: "22:00", amount: 0 },
		{ time: "23:00", amount: 0 },
		{ time: "00:00", amount: 0 },
	]);

	useEffect(() => {
		setChartData(prevState => {
			let aux = [...prevState];

			aux.forEach(a => {
				tickets.forEach(ticket => {
					format(startOfHour(parseISO(ticket.createdAt)), "HH:mm") === a.time &&
						a.amount++;
				});
			});

			return aux;
		});
	}, [tickets]);

	return (
    <React.Fragment>
      <div style={{ display: "flex" }}>
        <CheckBoxIcon
          style={{ color: "#5578eb", marginRight: "5px", fontSize:"18px" }}
        />
        <Title>{`${i18n.t("dashboard.charts.perDay.title")}${
          tickets.length
        }`}</Title>
      </div>

      <Divider />
      <br></br>
      <br></br>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          barSize={40}
          width={730}
          height={250}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 0,
          }}
        >
          <XAxis
            tick={tickProps => {
              const { x, y, payload } = tickProps;
              return (
                <circle
                  cx={x}
                  cy={y-8}
                  r={1}
                  fill={theme.palette.text.secondary}
                />
              );
            }}
            tickLine={false}
            axisLine={false}
            dataKey="time"
            stroke={theme.palette.text.secondary}
          />
          <YAxis
            type="number"
            allowDecimals={false}
            stroke={theme.palette.text.secondary}
            tickLine={false}
            axisLine={false}
          >
            {/* <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            >
              Tickets
            </Label> */}
          </YAxis>
          <CartesianGrid vertical={false} strokeDasharray="4" opacity={0.3} />
          <Tooltip
            content={<CustomTooltip />}
            position={{ y: 125 }}
            animationEasing="ease"
            cursor={false}
            shared={false}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
             strokeDasharray="3 4 5 2"
             strokeWidth={.1}
            fillOpacity={1}
            fill="#a0b3f4"
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
};

export default Chart;

