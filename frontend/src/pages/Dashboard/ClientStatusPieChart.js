import { useTheme } from "@mui/material/styles";
import { styled, Paper, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import api from "../../services/api";
import CustomTooltip from "./CustomTooltip";
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

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1.5),
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'dark'
    ? theme.palette.background.default
    : theme.palette.background.paper,
  border: theme.palette.mode === 'dark'
    ? `2px solid ${theme.palette.divider}`
    : `1px solid ${theme.palette.grey[200]}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(0,0,0,0.3)'
    : '0 4px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 16px rgba(0,0,0,0.4)'
      : '0 6px 16px rgba(0,0,0,0.12)',
  },
}));

const ClientStatusPieChart = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [chartData, setChartData] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    withStatus: 0,
    withoutStatus: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { data } = await api.get("/client-status/statistics");
        
        const formattedData = [];
        
        data.statusData.forEach(status => {
          if (status.count > 0) {
            formattedData.push({
              name: status.name,
              value: status.count,
              color: status.color,
            });
          }
        });

        if (data.withoutStatus > 0) {
          formattedData.push({
            name: t("dashboard.clientStatus.withoutStatus"),
            value: data.withoutStatus,
            color: theme.palette.mode === 'dark' ? "#757575" : "#9E9E9E",
          });
        }

        setChartData(formattedData);
        
        const withStatus = data.statusData.reduce((sum, status) => sum + status.count, 0);
        setStatistics({
          total: data.total,
          withStatus: withStatus,
          withoutStatus: data.withoutStatus,
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar estatísticas de status:", error);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [t, theme.palette.mode]);

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <ChartPaper>
      <Title sx={{ 
        color: theme.palette.text.primary, 
        fontWeight: 700, 
        fontSize: '1.1rem', 
        mb: 2,
        textShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {t("dashboard.clientStatus.pieChart.title")}
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
        <>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill={theme.palette.primary.main}
                dataKey="value"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  if (percent === 0) return null;
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill={theme.palette.mode === 'dark' ? '#fff' : '#000'}
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      style={{ 
                        fontSize: '14px', 
                        fontWeight: 600,
                        textShadow: theme.palette.mode === 'dark' 
                          ? '0 0 3px rgba(0,0,0,0.8)' 
                          : '0 0 3px rgba(255,255,255,0.8)'
                      }}
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                isAnimationActive={true}
                animationDuration={900}
                stroke={theme.palette.background.paper}
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={theme.palette.background.paper}
                    strokeWidth={3}
                    style={{ 
                      filter: theme.palette.mode === 'dark'
                        ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
                        : 'drop-shadow(0 4px 12px rgba(80,80,160,0.2))',
                      cursor: 'pointer'
                    }} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={true} />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                layout="horizontal"
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: '12px'
                }}
                iconType="circle"
                formatter={(value, entry) => (
                  <span style={{ 
                    color: theme.palette.text.primary,
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

            <StatsBox>
            <StatItem>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {statistics.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("dashboard.clientStatus.totalContacts")}
              </Typography>
            </StatItem>

            <StatItem>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                {statistics.withStatus}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("dashboard.clientStatus.withStatusLabel")} ({calculatePercentage(statistics.withStatus, statistics.total)}%)
              </Typography>
            </StatItem>

            <StatItem>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {statistics.withoutStatus}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("dashboard.clientStatus.withoutStatusLabel")} ({calculatePercentage(statistics.withoutStatus, statistics.total)}%)
              </Typography>
            </StatItem>
          </StatsBox>
          </Box>
        </>
      )}
    </ChartPaper>
  );
};

export default ClientStatusPieChart;
