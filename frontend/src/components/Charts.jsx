import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Charts = ({ transactions, categoryBreakdown, spendingTrends }) => {
  const { isDark } = useTheme();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Chart colors based on theme
  const colors = {
    line: isDark ? '#F5F5F7' : '#111113',
    lineMuted: isDark ? '#6B6B73' : '#8A8A92',
    grid: isDark ? '#2A2A2E' : '#E2E2E5',
    tooltip: isDark ? '#222225' : '#FFFFFF',
    tooltipBorder: isDark ? '#2A2A2E' : '#E2E2E5',
    tooltipText: isDark ? '#F5F5F7' : '#111113',
  };

  // Monochrome shades for pie chart
  const PIE_COLORS = isDark 
    ? ['#F5F5F7', '#A1A1AA', '#6B6B73', '#4A4A52', '#3A3A42', '#2A2A2E']
    : ['#111113', '#3B3B43', '#5B5B63', '#7B7B83', '#9B9BA3', '#BBBBC3'];

  // Prepare pie data
  const pieData = Object.entries(categoryBreakdown || {})
    .map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Prepare trend data
  const trendData = (spendingTrends || []).map(trend => ({
    month: trend.month,
    Income: trend.income,
    Expenses: trend.expenses,
    Savings: trend.balance
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-xl text-sm"
          style={{ 
            background: colors.tooltip, 
            border: `1px solid ${colors.tooltipBorder}`,
            color: colors.tooltipText 
          }}
        >
          {label && <p className="text-xs mb-2 font-medium opacity-60">{label}</p>}
          {payload.map((entry, index) => (
            <p key={index} className="flex items-center justify-between gap-4">
              <span className="opacity-60">{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-primary">Charts</h1>
          <p className="text-secondary text-sm">Visualize your spending patterns</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Spending by Category */}
          <div className="bg-surface rounded-2xl p-6 border border-default">
            <h3 className="font-semibold text-primary mb-6">Spending by Category</h3>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: colors.lineMuted }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted">
                No data available
              </div>
            )}
          </div>

          {/* Monthly Trends */}
          <div className="bg-surface rounded-2xl p-6 border border-default">
            <h3 className="font-semibold text-primary mb-6">Monthly Trends</h3>
            {trendData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke={colors.lineMuted}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={colors.lineMuted}
                      fontSize={12}
                      tickFormatter={(val) => `$${val / 1000}k`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="Income"
                      stroke={colors.line}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Expenses"
                      stroke={colors.lineMuted}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted">
                No data available
              </div>
            )}
          </div>

          {/* Savings Trend */}
          <div className="col-span-2 bg-surface rounded-2xl p-6 border border-default">
            <div className="flex items-center gap-6 mb-6">
              <h3 className="font-semibold text-primary">Savings Trend</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5" style={{ background: colors.line }}></span>
                  <span className="text-secondary">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 border-t border-dashed" style={{ borderColor: colors.lineMuted }}></span>
                  <span className="text-secondary">Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-1" style={{ background: colors.line, opacity: 0.3 }}></span>
                  <span className="text-secondary">Savings</span>
                </div>
              </div>
            </div>
            {trendData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke={colors.lineMuted}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={colors.lineMuted}
                      fontSize={12}
                      tickFormatter={(val) => `$${val / 1000}k`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="Income"
                      stroke={colors.line}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Expenses"
                      stroke={colors.lineMuted}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Savings"
                      stroke={colors.line}
                      strokeWidth={3}
                      strokeOpacity={0.3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
