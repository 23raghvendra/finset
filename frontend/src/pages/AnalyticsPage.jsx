import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { formatCurrency, formatINR } from '../utils/storage';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Calendar,
  Download,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  X,
  Trash2,
  GripVertical,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart,
  Target,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line
} from 'recharts';

const WIDGET_TYPES = [
  { 
    id: 'balanceOverview', 
    name: 'Balance Overview', 
    icon: LineChart, 
    description: 'Track your balance over time',
    category: 'charts'
  },
  { 
    id: 'expensePie', 
    name: 'Expense Breakdown', 
    icon: PieChartIcon, 
    description: 'See where your money goes',
    category: 'charts'
  },
  { 
    id: 'budgetComparison', 
    name: 'Budget vs Expense', 
    icon: BarChart3, 
    description: 'Compare spending to budgets',
    category: 'charts'
  },
  { 
    id: 'incomeExpenseBar', 
    name: 'Income vs Expense', 
    icon: BarChart3, 
    description: 'Monthly income and expense bars',
    category: 'charts'
  },
  { 
    id: 'savingsRate', 
    name: 'Savings Rate', 
    icon: Target, 
    description: 'Track your savings percentage',
    category: 'stats'
  },
  { 
    id: 'topCategories', 
    name: 'Top Spending Categories', 
    icon: Wallet, 
    description: 'Your biggest expense categories',
    category: 'stats'
  },
  { 
    id: 'recentTrend', 
    name: 'Recent Trend', 
    icon: TrendingUp, 
    description: 'Last 7 days spending trend',
    category: 'charts'
  },
  { 
    id: 'monthlyAverage', 
    name: 'Monthly Averages', 
    icon: BarChart3, 
    description: 'Average income and expenses',
    category: 'stats'
  },
];

const COLORS = ['#8470FF', '#A498FF', '#82828C', '#45454B', '#BFB7FF', '#D6D2FF', '#6B5BFF', '#9D93FF'];

const AnalyticsPage = ({ user, totals, transactions, budgets, monthlyStats }) => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [showStatsDetail, setShowStatsDetail] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ show: false, widgetId: null });
  const [widgets, setWidgets] = useState([
    { id: 'w1', type: 'balanceOverview', enabled: true, size: 'large' },
    { id: 'w2', type: 'expensePie', enabled: true, size: 'small' },
    { id: 'w3', type: 'budgetComparison', enabled: true, size: 'full' },
  ]);

  // Date range options
  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This week' },
    { value: 'thisMonth', label: 'This month' },
    { value: 'lastMonth', label: 'Last month' },
    { value: 'last3Months', label: 'Last 3 months' },
    { value: 'last6Months', label: 'Last 6 months' },
    { value: 'thisYear', label: 'This year' },
    { value: 'allTime', label: 'All time' },
  ];

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisWeek':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date >= startDate && date <= endOfLastMonth;
        });
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'allTime':
        return transactions;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, dateRange]);

  // Calculate totals from filtered transactions
  const filteredTotals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [filteredTransactions]);

  const { balance, income, expenses } = filteredTotals;

  // Prepare data for various widgets
  const monthlyData = useMemo(() => {
    return Object.entries(monthlyStats || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => {
        const date = new Date(month + '-01');
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          day: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          balance: data.income - data.expenses,
          income: data.income,
          expenses: data.expenses,
          lastMonth: (data.income - data.expenses) * 0.8
        };
      });
  }, [monthlyStats]);

  const budgetComparison = useMemo(() => {
    return budgets?.slice(0, 7).map(b => ({
      category: b.category.substring(0, 8),
      expense: b.spent || 0,
      budget: b.amount
    })) || [];
  }, [budgets]);

  const expensesByCategory = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
  }, [filteredTransactions]);

  const pieData = useMemo(() => {
    return Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [expensesByCategory]);

  // Last 7 days trend
  const recentTrendData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayExpenses = (transactions || [])
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' && tDate >= date && tDate < nextDate;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayExpenses
      });
    }
    return last7Days;
  }, [transactions]);

  // Savings rate
  const savingsRate = income > 0 ? ((income - expenses) / income * 100) : 0;

  // Monthly averages
  const monthlyAverages = useMemo(() => {
    const months = Object.keys(monthlyStats || {}).length || 1;
    const totalIncome = Object.values(monthlyStats || {}).reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = Object.values(monthlyStats || {}).reduce((sum, m) => sum + m.expenses, 0);
    return {
      avgIncome: totalIncome / months,
      avgExpenses: totalExpenses / months
    };
  }, [monthlyStats]);

  // Export CSV function
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No data to export for selected period');
      return;
    }

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('en-IN'),
      t.type,
      t.category,
      t.description,
      t.amount
    ]);

    const summary = [
      [],
      ['Summary'],
      ['Total Income', income],
      ['Total Expenses', expenses],
      ['Net Balance', balance],
      [],
      ['Category Breakdown'],
      ...Object.entries(expensesByCategory).map(([cat, amt]) => [cat, amt])
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      ...summary.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateLabel = dateRangeOptions.find(o => o.value === dateRange)?.label || 'analytics';
    a.download = `analytics-${dateLabel.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Analytics exported successfully!');
  };

  // Widget management functions
  const toggleWidget = (id) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const addWidget = (type, size = 'small') => {
    const widgetType = WIDGET_TYPES.find(w => w.id === type);
    const newWidget = {
      id: `w${Date.now()}`,
      type,
      enabled: true,
      size
    };
    setWidgets([...widgets, newWidget]);
    setShowAddWidgetModal(false);
    toast.success(`${widgetType?.name} widget added!`);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    setDeleteDialog({ show: false, widgetId: null });
    toast.success('Widget removed');
  };

  const moveWidget = (id, direction) => {
    const index = widgets.findIndex(w => w.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === widgets.length - 1)) return;
    
    const newWidgets = [...widgets];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];
    setWidgets(newWidgets);
  };

  // Render individual widget
  const renderWidget = (widget) => {
    const widgetType = WIDGET_TYPES.find(w => w.id === widget.type);
    if (!widget.enabled) return null;

    const WidgetWrapper = ({ children, title, size = 'small', showDetails = false }) => (
      <div 
        className={`card p-5 ${size === 'large' ? 'col-span-2' : size === 'full' ? 'col-span-3' : ''}`}
        style={{ minHeight: size === 'small' ? '320px' : '300px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <div className="flex items-center gap-2">
            {showDetails && (
              <button 
                className="text-xs transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => setShowStatsDetail(true)}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-600)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Details →
              </button>
            )}
            <button
              onClick={() => setDeleteDialog({ show: true, widgetId: widget.id })}
              className="p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--danger-200)';
                e.currentTarget.style.color = 'var(--danger-500)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
        {children}
      </div>
    );

    switch (widget.type) {
      case 'balanceOverview':
        return (
          <WidgetWrapper key={widget.id} title="Balance Overview" size="large">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--primary-600)]"></span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Balance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-dashed" style={{ borderColor: 'var(--neutral-300)' }}></span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Previous</span>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-600)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--primary-600)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }} formatter={(value) => [formatINR(value), '']} />
                  <Area type="monotone" dataKey="balance" stroke="var(--primary-600)" strokeWidth={2} fill="url(#colorBalance)" />
                  <Area type="monotone" dataKey="lastMonth" stroke="var(--neutral-300)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </WidgetWrapper>
        );

      case 'expensePie':
        return (
          <WidgetWrapper key={widget.id} title="Expense Breakdown" size="small" showDetails>
            <div className="relative w-40 h-40 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: 'No data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.length > 0 ? (
                      pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))
                    ) : (
                      <Cell fill="var(--neutral-200)" />
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</span>
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatINR(expenses)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.slice(0, 4).map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }}></span>
                  <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </WidgetWrapper>
        );

      case 'budgetComparison':
        return (
          <WidgetWrapper key={widget.id} title="Budget vs Expense" size="full">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--primary-600)]"></span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Expense</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--neutral-200)]"></span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Budget</span>
              </div>
            </div>
            <div className="h-52">
              {budgetComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetComparison} barGap={4}>
                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }} formatter={(value) => [formatINR(value), '']} />
                    <Bar dataKey="expense" fill="var(--primary-600)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="budget" fill="var(--neutral-200)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create budgets to see comparison</p>
                </div>
              )}
            </div>
          </WidgetWrapper>
        );

      case 'incomeExpenseBar':
        return (
          <WidgetWrapper key={widget.id} title="Income vs Expense" size="large">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'var(--success-800)' }}></span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: 'var(--danger-500)' }}></span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Expense</span>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={4}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }} formatter={(value) => [formatINR(value), '']} />
                  <Bar dataKey="income" fill="var(--success-800)" radius={[4, 4, 0, 0]} maxBarSize={25} />
                  <Bar dataKey="expenses" fill="var(--danger-500)" radius={[4, 4, 0, 0]} maxBarSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </WidgetWrapper>
        );

      case 'savingsRate':
        return (
          <WidgetWrapper key={widget.id} title="Savings Rate" size="small">
            <div className="flex flex-col items-center justify-center h-48">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="var(--neutral-200)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={savingsRate >= 20 ? 'var(--success-800)' : savingsRate >= 10 ? 'var(--warning-500)' : 'var(--danger-500)'}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.max(0, savingsRate) * 3.52} 352`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {savingsRate.toFixed(1)}%
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>saved</span>
                </div>
              </div>
              <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
                {savingsRate >= 20 ? 'Great job! Keep it up!' : savingsRate >= 10 ? 'Good progress!' : 'Try to save more'}
              </p>
            </div>
          </WidgetWrapper>
        );

      case 'topCategories':
        const topCats = Object.entries(expensesByCategory)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);
        return (
          <WidgetWrapper key={widget.id} title="Top Spending" size="small">
            <div className="space-y-3">
              {topCats.map(([cat, amount], i) => {
                const pct = expenses > 0 ? (amount / expenses) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{cat}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatINR(amount)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: COLORS[i] }}
                      />
                    </div>
                  </div>
                );
              })}
              {topCats.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No expenses yet</p>
              )}
            </div>
          </WidgetWrapper>
        );

      case 'recentTrend':
        return (
          <WidgetWrapper key={widget.id} title="Last 7 Days" size="small">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={recentTrendData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }} formatter={(value) => [formatINR(value), 'Spent']} />
                  <Line type="monotone" dataKey="amount" stroke="var(--primary-600)" strokeWidth={2} dot={{ fill: 'var(--primary-600)', r: 4 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </WidgetWrapper>
        );

      case 'monthlyAverage':
        return (
          <WidgetWrapper key={widget.id} title="Monthly Averages" size="small">
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl" style={{ background: 'var(--success-200)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight size={16} style={{ color: 'var(--success-800)' }} />
                  <span className="text-sm" style={{ color: 'var(--success-800)' }}>Avg. Income</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--success-800)' }}>
                  {formatINR(monthlyAverages.avgIncome)}
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--danger-200)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownRight size={16} style={{ color: 'var(--danger-500)' }} />
                  <span className="text-sm" style={{ color: 'var(--danger-500)' }}>Avg. Expense</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--danger-500)' }}>
                  {formatINR(monthlyAverages.avgExpenses)}
                </p>
              </div>
            </div>
          </WidgetWrapper>
        );

      default:
        return null;
    }
  };

  const StatCard = ({ label, value, transactions: txCount, categories }) => (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
      </div>
      <p className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {formatINR(value)}
      </p>
      <div className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-2">
          <span>↔</span>
          <span>{txCount} transactions</span>
        </div>
        <div className="flex items-center gap-2">
          <span>▦</span>
          <span>{categories} categories</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <Header 
        title="Analytics"
        subtitle="Detailed overview of your financial situation"
        user={user}
      >
        {/* Date Range Picker */}
        <div className="relative">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <Calendar size={16} />
            {dateRangeOptions.find(o => o.value === dateRange)?.label}
            <ChevronDown size={14} />
          </button>
          
          {showDatePicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
              <div 
                className="absolute right-0 top-12 w-48 rounded-xl shadow-lg z-50 border overflow-hidden py-2"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
              >
                {dateRangeOptions.map(option => (
                  <button
                    key={option.value}
                    className="w-full px-4 py-2 text-left text-sm transition-colors"
                    style={{ 
                      color: dateRange === option.value ? 'var(--primary-600)' : 'var(--text-primary)',
                      background: dateRange === option.value ? 'var(--primary-100)' : 'transparent'
                    }}
                    onMouseOver={(e) => {
                      if (dateRange !== option.value) e.currentTarget.style.background = 'var(--hover-bg)';
                    }}
                    onMouseOut={(e) => {
                      if (dateRange !== option.value) e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => {
                      setDateRange(option.value);
                      setShowDatePicker(false);
                      toast.success(`Showing data for: ${option.label}`);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={16} />
          Export
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowWidgetModal(true)}
        >
          <Settings size={16} />
          Manage
        </button>
        <button className="btn btn-primary" onClick={() => setShowAddWidgetModal(true)}>
          <Plus size={16} />
          Add Widget
        </button>
      </Header>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard 
          label="Total Balance" 
          value={balance} 
          transactions={filteredTransactions.length}
          categories={Object.keys(expensesByCategory).length}
        />
        <StatCard 
          label="Income" 
          value={income} 
          transactions={filteredTransactions.filter(t => t.type === 'income').length}
          categories={Object.keys(filteredTransactions.filter(t => t.type === 'income').reduce((a, t) => ({...a, [t.category]: 1}), {})).length}
        />
        <StatCard 
          label="Expenses" 
          value={expenses} 
          transactions={filteredTransactions.filter(t => t.type === 'expense').length}
          categories={Object.keys(expensesByCategory).length}
        />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-3 gap-4">
        {widgets.filter(w => w.enabled).map(widget => (
          <div key={widget.id} className="group">
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {widgets.filter(w => w.enabled).length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--primary-100)' }}>
            <Plus size={32} style={{ color: 'var(--primary-600)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No widgets enabled</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Add widgets to visualize your financial data</p>
          <button className="btn btn-primary" onClick={() => setShowAddWidgetModal(true)}>
            <Plus size={16} />
            Add Your First Widget
          </button>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidgetModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowAddWidgetModal(false)}
        >
          <div 
            className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            style={{ background: 'var(--card-bg)' }}
          >
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Add Widget</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Choose a widget to add to your dashboard</p>
                </div>
                <button
                  onClick={() => setShowAddWidgetModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Charts</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {WIDGET_TYPES.filter(w => w.category === 'charts').map(widgetType => {
                  const Icon = widgetType.icon;
                  const alreadyAdded = widgets.some(w => w.type === widgetType.id);
                  return (
                    <button
                      key={widgetType.id}
                      onClick={() => !alreadyAdded && addWidget(widgetType.id, widgetType.id === 'budgetComparison' ? 'full' : widgetType.id === 'balanceOverview' || widgetType.id === 'incomeExpenseBar' ? 'large' : 'small')}
                      className={`p-4 rounded-xl border text-left transition-all ${alreadyAdded ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ 
                        borderColor: 'var(--border)',
                        background: 'var(--card-bg)'
                      }}
                      onMouseOver={(e) => {
                        if (!alreadyAdded) {
                          e.currentTarget.style.borderColor = 'var(--primary-600)';
                          e.currentTarget.style.background = 'var(--primary-100)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'var(--card-bg)';
                      }}
                      disabled={alreadyAdded}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'var(--primary-100)' }}
                        >
                          <Icon size={20} style={{ color: 'var(--primary-600)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{widgetType.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{widgetType.description}</p>
                          {alreadyAdded && (
                            <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full" style={{ background: 'var(--neutral-200)', color: 'var(--text-muted)' }}>
                              Already added
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                {WIDGET_TYPES.filter(w => w.category === 'stats').map(widgetType => {
                  const Icon = widgetType.icon;
                  const alreadyAdded = widgets.some(w => w.type === widgetType.id);
                  return (
                    <button
                      key={widgetType.id}
                      onClick={() => !alreadyAdded && addWidget(widgetType.id, 'small')}
                      className={`p-4 rounded-xl border text-left transition-all ${alreadyAdded ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ 
                        borderColor: 'var(--border)',
                        background: 'var(--card-bg)'
                      }}
                      onMouseOver={(e) => {
                        if (!alreadyAdded) {
                          e.currentTarget.style.borderColor = 'var(--primary-600)';
                          e.currentTarget.style.background = 'var(--primary-100)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'var(--card-bg)';
                      }}
                      disabled={alreadyAdded}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'var(--primary-100)' }}
                        >
                          <Icon size={20} style={{ color: 'var(--primary-600)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{widgetType.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{widgetType.description}</p>
                          {alreadyAdded && (
                            <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full" style={{ background: 'var(--neutral-200)', color: 'var(--text-muted)' }}>
                              Already added
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget Management Modal */}
      {showWidgetModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowWidgetModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)' }}
          >
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Manage Widgets</h2>
                <button
                  onClick={() => setShowWidgetModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Toggle, reorder, or remove widgets</p>
            </div>
            <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
              {widgets.map((widget, index) => {
                const widgetType = WIDGET_TYPES.find(w => w.id === widget.type);
                const Icon = widgetType?.icon || Settings;
                return (
                  <div 
                    key={widget.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveWidget(widget.id, 'up')}
                        disabled={index === 0}
                        className="p-0.5 rounded transition-colors disabled:opacity-30"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <ChevronDown size={14} className="rotate-180" />
                      </button>
                      <button
                        onClick={() => moveWidget(widget.id, 'down')}
                        disabled={index === widgets.length - 1}
                        className="p-0.5 rounded transition-colors disabled:opacity-30"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--primary-100)' }}
                    >
                      <Icon size={16} style={{ color: 'var(--primary-600)' }} />
                    </div>
                    <span className="flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {widgetType?.name || 'Widget'}
                    </span>
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      className="relative w-10 h-5 rounded-full transition-all duration-300"
                      style={{
                        background: widget.enabled ? 'var(--primary-600)' : 'var(--neutral-200)'
                      }}
                    >
                      <div 
                        className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
                        style={{
                          left: widget.enabled ? '22px' : '2px',
                          background: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}
                      />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ show: true, widgetId: widget.id })}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--danger-200)';
                        e.currentTarget.style.color = 'var(--danger-500)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
              {widgets.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No widgets added yet
                </p>
              )}
            </div>
            <div className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
              <button
                onClick={() => {
                  setShowWidgetModal(false);
                  setShowAddWidgetModal(true);
                }}
                className="flex-1 btn btn-secondary"
              >
                <Plus size={16} />
                Add Widget
              </button>
              <button
                onClick={() => {
                  setShowWidgetModal(false);
                  toast.success('Widget settings saved!');
                }}
                className="flex-1 btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Detail Modal */}
      {showStatsDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowStatsDetail(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)' }}
          >
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Expense Breakdown</h2>
                <button
                  onClick={() => setShowStatsDetail(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Detailed category breakdown for {dateRangeOptions.find(o => o.value === dateRange)?.label.toLowerCase()}
              </p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount], index) => {
                  const percentage = expenses > 0 ? (amount / expenses) * 100 : 0;
                  return (
                    <div key={category} className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full"
                            style={{ background: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatINR(amount)}</span>
                          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            background: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(expensesByCategory).length === 0 && (
                <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No expenses recorded for this period
                </p>
              )}
            </div>
            <div className="p-4 border-t" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Total Expenses</span>
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatINR(expenses)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Widget Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, widgetId: null })}
        onConfirm={() => removeWidget(deleteDialog.widgetId)}
        title="Remove Widget"
        message="Are you sure you want to remove this widget from your dashboard?"
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default AnalyticsPage;
