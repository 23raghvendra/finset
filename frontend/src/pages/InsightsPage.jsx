import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { formatINR } from '../utils/storage';
import toast from 'react-hot-toast';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine
} from 'recharts';

const InsightsPage = ({ user, transactions = [], budgets = [], monthlyStats = {} }) => {
  const [heatmapMonth, setHeatmapMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // ==================== HEATMAP CALENDAR ====================
  const heatmapData = useMemo(() => {
    const year = heatmapMonth.getFullYear();
    const month = heatmapMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Calculate daily spending
    const dailySpending = {};
    let maxSpending = 0;

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = new Date(t.date);
        if (date.getFullYear() === year && date.getMonth() === month) {
          const day = date.getDate();
          dailySpending[day] = (dailySpending[day] || 0) + t.amount;
          if (dailySpending[day] > maxSpending) {
            maxSpending = dailySpending[day];
          }
        }
      });

    // Build calendar grid
    const weeks = [];
    let currentWeek = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const spending = dailySpending[day] || 0;
      const intensity = maxSpending > 0 ? spending / maxSpending : 0;
      
      currentWeek.push({
        day,
        spending,
        intensity,
        transactions: transactions.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === year && 
                 date.getMonth() === month && 
                 date.getDate() === day;
        })
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return { weeks, maxSpending, totalSpending: Object.values(dailySpending).reduce((a, b) => a + b, 0) };
  }, [transactions, heatmapMonth]);

  const getHeatmapColor = (intensity) => {
    if (intensity === 0) return 'var(--bg-secondary)';
    if (intensity < 0.25) return 'rgba(132, 112, 255, 0.2)';
    if (intensity < 0.5) return 'rgba(132, 112, 255, 0.4)';
    if (intensity < 0.75) return 'rgba(132, 112, 255, 0.6)';
    return 'rgba(132, 112, 255, 0.9)';
  };

  // ==================== MONEY FLOW (Sankey-like) ====================
  const moneyFlow = useMemo(() => {
    const incomeByCategory = {};
    const expenseByCategory = {};
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        totalIncome += t.amount;
      } else {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        totalExpense += t.amount;
      }
    });

    const incomeFlows = Object.entries(incomeByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
      }));

    const expenseFlows = Object.entries(expenseByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      }));

    return { incomeFlows, expenseFlows, totalIncome, totalExpense, savings: totalIncome - totalExpense };
  }, [transactions]);

  // ==================== FORECAST ====================
  const forecastData = useMemo(() => {
    const monthlyExpenses = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + t.amount;
      });

    const sortedMonths = Object.entries(monthlyExpenses)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    if (sortedMonths.length < 2) {
      return { historical: [], forecast: [], avgExpense: 0, trend: 0 };
    }

    // Calculate trend using simple linear regression
    const n = sortedMonths.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = sortedMonths.reduce((sum, [, val]) => sum + val, 0);
    const xySum = sortedMonths.reduce((sum, [, val], i) => sum + i * val, 0);
    const x2Sum = sortedMonths.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    const avgExpense = ySum / n;

    // Historical data
    const historical = sortedMonths.map(([month, amount], i) => {
      const date = new Date(month + '-01');
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        actual: amount,
        predicted: intercept + slope * i
      };
    });

    // Forecast next 3 months
    const lastDate = new Date(sortedMonths[sortedMonths.length - 1][0] + '-01');
    const forecast = [];
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      forecast.push({
        month: futureDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        predicted: Math.max(0, intercept + slope * (n + i - 1)),
        isForecast: true
      });
    }

    return { 
      historical, 
      forecast, 
      avgExpense,
      trend: slope,
      trendPercentage: avgExpense > 0 ? (slope / avgExpense) * 100 : 0
    };
  }, [transactions]);

  const combinedForecastData = [...forecastData.historical, ...forecastData.forecast];

  // ==================== AI INSIGHTS ====================
  const insights = useMemo(() => {
    const result = [];
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // Calculate this month vs last month spending by category
    const thisMonthExpenses = {};
    const lastMonthExpenses = {};

    transactions.filter(t => t.type === 'expense').forEach(t => {
      const date = new Date(t.date);
      const month = date.getMonth();
      const year = date.getFullYear();

      if (month === thisMonth && year === thisYear) {
        thisMonthExpenses[t.category] = (thisMonthExpenses[t.category] || 0) + t.amount;
      } else if (month === lastMonth && year === lastMonthYear) {
        lastMonthExpenses[t.category] = (lastMonthExpenses[t.category] || 0) + t.amount;
      }
    });

    // Find categories with significant increase
    Object.entries(thisMonthExpenses).forEach(([category, amount]) => {
      const lastAmount = lastMonthExpenses[category] || 0;
      if (lastAmount > 0) {
        const change = ((amount - lastAmount) / lastAmount) * 100;
        if (change > 30) {
          result.push({
            type: 'warning',
            icon: TrendingUp,
            title: `${category} spending up ${change.toFixed(0)}%`,
            description: `You spent ${formatINR(amount)} this month vs ${formatINR(lastAmount)} last month`,
            category
          });
        } else if (change < -20) {
          result.push({
            type: 'success',
            icon: TrendingDown,
            title: `Great job on ${category}!`,
            description: `Spending down ${Math.abs(change).toFixed(0)}% from last month`,
            category
          });
        }
      }
    });

    // Budget alerts
    budgets.forEach(budget => {
      const percentage = budget.spent ? (budget.spent / budget.amount) * 100 : 0;
      if (percentage >= 90 && percentage < 100) {
        result.push({
          type: 'warning',
          icon: AlertTriangle,
          title: `${budget.category} budget almost exhausted`,
          description: `${percentage.toFixed(0)}% used - ${formatINR(budget.amount - budget.spent)} remaining`,
          category: budget.category
        });
      } else if (percentage >= 100) {
        result.push({
          type: 'danger',
          icon: AlertTriangle,
          title: `${budget.category} budget exceeded!`,
          description: `Over by ${formatINR(budget.spent - budget.amount)}`,
          category: budget.category
        });
      }
    });

    // Savings insight
    if (moneyFlow.totalIncome > 0) {
      const savingsRate = (moneyFlow.savings / moneyFlow.totalIncome) * 100;
      if (savingsRate < 10) {
        result.push({
          type: 'warning',
          icon: Lightbulb,
          title: 'Low savings rate',
          description: `You're saving only ${savingsRate.toFixed(1)}% of your income. Aim for at least 20%`
        });
      } else if (savingsRate >= 30) {
        result.push({
          type: 'success',
          icon: Lightbulb,
          title: 'Excellent savings rate!',
          description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`
        });
      }
    }

    // Forecast insight
    if (forecastData.trendPercentage > 5) {
      result.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Spending trend increasing',
        description: `Your expenses are growing by ~${forecastData.trendPercentage.toFixed(1)}% monthly`
      });
    }

    return result.slice(0, 6);
  }, [transactions, budgets, moneyFlow, forecastData]);

  // ==================== ANOMALY DETECTION ====================
  const anomalies = useMemo(() => {
    const result = [];
    const categoryAvg = {};
    const categoryTransactions = {};

    // Calculate average per category
    transactions.filter(t => t.type === 'expense').forEach(t => {
      if (!categoryTransactions[t.category]) {
        categoryTransactions[t.category] = [];
      }
      categoryTransactions[t.category].push(t);
    });

    Object.entries(categoryTransactions).forEach(([category, txns]) => {
      if (txns.length < 3) return;
      
      const amounts = txns.map(t => t.amount);
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length);

      // Find anomalies (> 2 standard deviations)
      txns.forEach(t => {
        if (t.amount > avg + 2 * stdDev && t.amount > avg * 2) {
          result.push({
            ...t,
            avgAmount: avg,
            deviation: ((t.amount - avg) / avg) * 100
          });
        }
      });
    });

    return result.sort((a, b) => b.deviation - a.deviation).slice(0, 5);
  }, [transactions]);

  const navigateMonth = (direction) => {
    const newDate = new Date(heatmapMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setHeatmapMonth(newDate);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Header
        title="Insights"
        subtitle="AI-powered analysis of your financial patterns"
        user={user}
      />

      {/* AI Insights */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <Lightbulb className="inline-block mr-2" size={20} />
          Smart Insights
        </h2>
        {insights.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              const bgColor = insight.type === 'danger' ? 'var(--danger-200)' : 
                             insight.type === 'warning' ? 'var(--warning-200)' : 'var(--success-200)';
              const iconColor = insight.type === 'danger' ? 'var(--danger-500)' : 
                               insight.type === 'warning' ? 'var(--warning-500)' : 'var(--success-800)';
              return (
                <div key={index} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: bgColor }}
                    >
                      <Icon size={20} style={{ color: iconColor }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{insight.title}</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Lightbulb size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>Add more transactions to get personalized insights</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Spending Heatmap */}
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Calendar className="inline-block mr-2" size={18} />
              Spending Heatmap
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium min-w-[120px] text-center" style={{ color: 'var(--text-primary)' }}>
                {heatmapMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="mb-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium py-1" style={{ color: 'var(--text-muted)' }}>
                  {day}
                </div>
              ))}
            </div>
            {heatmapData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all cursor-pointer ${day ? 'hover:scale-110' : ''}`}
                    style={{
                      background: day ? getHeatmapColor(day.intensity) : 'transparent',
                      color: day ? (day.intensity > 0.5 ? 'white' : 'var(--text-primary)') : 'transparent'
                    }}
                    onClick={() => day && setSelectedDay(day)}
                    title={day ? `${formatINR(day.spending)}` : ''}
                  >
                    {day?.day}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Less</span>
              {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded"
                  style={{ background: getHeatmapColor(intensity) }}
                />
              ))}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>More</span>
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Total: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatINR(heatmapData.totalSpending)}</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details / Anomalies */}
        <div className="card p-5">
          {selectedDay ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {heatmapMonth.toLocaleDateString('en-US', { month: 'short' })} {selectedDay.day}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                {formatINR(selectedDay.spending)}
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedDay.transactions.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.category}</p>
                    </div>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: t.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)' }}
                    >
                      {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                    </span>
                  </div>
                ))}
                {selectedDay.transactions.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No transactions</p>
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                <AlertTriangle className="inline-block mr-2" size={18} />
                Unusual Transactions
              </h3>
              {anomalies.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.map((t, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--warning-200)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</span>
                        <span className="text-sm font-bold" style={{ color: 'var(--danger-500)' }}>{formatINR(t.amount)}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t.deviation.toFixed(0)}% higher than avg ({formatINR(t.avgAmount)})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No unusual transactions detected</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Money Flow */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
          Money Flow
        </h3>
        <div className="flex items-center gap-8">
          {/* Income Sources */}
          <div className="flex-1">
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--success-800)' }}>Income Sources</p>
            <div className="space-y-2">
              {moneyFlow.incomeFlows.map((flow, i) => (
                <div key={flow.category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{flow.category}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatINR(flow.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${flow.percentage}%`, background: 'var(--success-800)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {moneyFlow.incomeFlows.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No income recorded</p>
              )}
            </div>
          </div>

          {/* Center - Total Flow */}
          <div className="flex flex-col items-center px-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-2" style={{ background: 'var(--primary-100)' }}>
              <span className="text-lg font-bold" style={{ color: 'var(--primary-600)' }}>
                {formatINR(moneyFlow.savings)}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Net Savings</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>In</p>
                <p className="font-semibold" style={{ color: 'var(--success-800)' }}>{formatINR(moneyFlow.totalIncome)}</p>
              </div>
              <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Out</p>
                <p className="font-semibold" style={{ color: 'var(--danger-500)' }}>{formatINR(moneyFlow.totalExpense)}</p>
              </div>
            </div>
          </div>

          {/* Expense Categories */}
          <div className="flex-1">
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--danger-500)' }}>Expense Categories</p>
            <div className="space-y-2">
              {moneyFlow.expenseFlows.map((flow, i) => (
                <div key={flow.category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{flow.category}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatINR(flow.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${flow.percentage}%`, background: 'var(--danger-500)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {moneyFlow.expenseFlows.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No expenses recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="inline-block mr-2" size={18} />
              Expense Forecast
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Based on your spending patterns
            </p>
          </div>
          {forecastData.trend !== 0 && (
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                background: forecastData.trend > 0 ? 'var(--danger-200)' : 'var(--success-200)',
                color: forecastData.trend > 0 ? 'var(--danger-500)' : 'var(--success-800)'
              }}
            >
              {forecastData.trend > 0 ? '↑' : '↓'} {Math.abs(forecastData.trendPercentage).toFixed(1)}% monthly
            </div>
          )}
        </div>
        <div className="h-64">
          {combinedForecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedForecastData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-600)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary-600)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--warning-500)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--warning-500)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  formatter={(value, name) => [formatINR(value), name === 'actual' ? 'Actual' : 'Forecast']}
                />
                <ReferenceLine y={forecastData.avgExpense} stroke="var(--text-muted)" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="actual" stroke="var(--primary-600)" strokeWidth={2} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="predicted" stroke="var(--warning-500)" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorPredicted)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p style={{ color: 'var(--text-muted)' }}>Need more transaction history for forecasting</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--primary-600)' }}></span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--warning-500)' }}></span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 border-t-2 border-dashed" style={{ borderColor: 'var(--text-muted)' }}></span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Average</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
