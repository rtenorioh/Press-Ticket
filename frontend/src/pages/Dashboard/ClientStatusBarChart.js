import { useTheme } from "@mui/material/styles";
import { styled, Paper, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
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
  minHeight: 450,
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? "0 12px 40px 0 rgba(0, 0, 0, 0.6), 0 4px 12px 0 rgba(0, 0, 0, 0.4)"
      : "0 12px 40px 0 rgba(80, 80, 160, 0.16), 0 4px 12px 0 rgba(80, 80, 160, 0.12)",
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 1, 1, 1),
    minHeight: 'auto',
  },
}));

const CustomTooltipBar = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          padding: 1.5,
          borderRadius: 1,
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {payload[0].payload.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {payload[0].payload.value} contatos
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {payload[0].payload.percentage}% do total
        </Typography>
      </Box>
    );
  }
  return null;
};

const ClientStatusBarChart = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { data } = await api.get("/client-status/statistics");
        
        const formattedData = [];
        
        data.statusData.forEach(status => {
          if (status.count > 0) {
            const percentage = data.total > 0 ? ((status.count / data.total) * 100).toFixed(1) : 0;
            formattedData.push({
              name: status.name,
              value: status.count,
              color: status.color,
              percentage: percentage,
            });
          }
        });

        if (data.withoutStatus > 0) {
          const percentage = data.total > 0 ? ((data.withoutStatus / data.total) * 100).toFixed(1) : 0;
          formattedData.push({
            name: t("dashboard.clientStatus.withoutStatus"),
            value: data.withoutStatus,
            color: theme.palette.mode === 'dark' ? "#757575" : "#9E9E9E",
            percentage: percentage,
          });
        }

        formattedData.sort((a, b) => b.value - a.value);

        setChartData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar estatísticas de status:", error);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [t, theme.palette.mode]);

  return (
    <ChartPaper>
      <Title sx={{ 
        color: theme.palette.text.primary, 
        fontWeight: 700, 
        fontSize: '1.1rem', 
        mb: 2,
        textShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {t("dashboard.clientStatus.barChart.title")}
      </Title>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {t("dashboard.clientStatus.loading")}
          </Typography>
        </Box>
      ) : chartData.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {t("dashboard.clientStatus.noData")}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: 2, pt: 11.25 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 50, bottom: 100 }}
            >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme.palette.divider} 
              opacity={theme.palette.mode === 'dark' ? 0.2 : 0.3} 
            />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis
              tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
              stroke={theme.palette.text.secondary}
              width={60}
              label={{ 
                value: t("dashboard.clientStatus.contactsCount"), 
                angle: -90, 
                position: 'insideLeft',
                offset: 10,
                style: { fill: theme.palette.text.secondary, fontSize: 11, textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltipBar />} cursor={{ fill: theme.palette.action.hover }} />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={900}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth={1}
                  style={{ 
                    filter: theme.palette.mode === 'dark'
                      ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
                      : 'drop-shadow(0 4px 12px rgba(80,80,160,0.15))'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </Box>
      )}
    </ChartPaper>
  );
};

export default ClientStatusBarChart;
