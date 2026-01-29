import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, X, Plus, Settings, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { formatINR } from '../utils/storage';
import Header from './Header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import toast from 'react-hot-toast';

const WIDGET_TYPES = {
  balanceOverview: {
    id: 'balanceOverview',
    name: 'Balance Overview',
    icon: '📊',
    defaultSize: 'large'
  },
  expensePie: {
    id: 'expensePie',
    name: 'Expense Breakdown',
    icon: '🥧',
    defaultSize: 'medium'
  },
  incomeExpense: {
    id: 'incomeExpense',
    name: 'Income vs Expense',
    icon: '📈',
    defaultSize: 'medium'
  },
  recentTransactions: {
    id: 'recentTransactions',
    name: 'Recent Transactions',
    icon: '📝',
    defaultSize: 'large'
  },
  savingsGoals: {
    id: 'savingsGoals',
    name: 'Savings Goals',
    icon: '🎯',
    defaultSize: 'medium'
  },
  budgetStatus: {
    id: 'budgetStatus',
    name: 'Budget Status',
    icon: '💰',
    defaultSize: 'medium'
  },
  quickStats: {
    id: 'quickStats',
    name: 'Quick Stats',
    icon: '⚡',
    defaultSize: 'small'
  },
  monthlyTrend: {
    id: 'monthlyTrend',
    name: 'Monthly Trend',
    icon: '📉',
    defaultSize: 'large'
  }
};

const COLORS = ['#8470FF', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

const DraggableDashboard = ({
  user,
  transactions = [],
  totals = {},
  budgets = [],
  savingsGoals = [],
  monthlyStats = {},
  recentTransactions = [],
  onAddTransaction
}) => {
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboardWidgets');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: 'w1', type: 'quickStats', size: 'full', visible: true },
      { id: 'w2', type: 'balanceOverview', size: 'large', visible: true },
      { id: 'w3', type: 'expensePie', size: 'medium', visible: true },
      { id: 'w4', type: 'recentTransactions', size: 'large', visible: true },
      { id: 'w5', type: 'savingsGoals', size: 'medium', visible: true },
    ];
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const saveWidgets = (newWidgets) => {
    setWidgets(newWidgets);
    localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
  };

  const handleReorder = (newOrder) => {
    saveWidgets(newOrder);
  };

  const toggleWidgetVisibility = (widgetId) => {
    const updated = widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    saveWidgets(updated);
  };

  const toggleWidgetSize = (widgetId) => {
    const updated = widgets.map(w => {
      if (w.id === widgetId) {
        const sizes = ['small', 'medium', 'large', 'full'];
        const currentIndex = sizes.indexOf(w.size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        return { ...w, size: nextSize };
      }
      return w;
    });
    saveWidgets(updated);
  };

  const addWidget = (type) => {
    const widgetType = WIDGET_TYPES[type];
    const newWidget = {
      id: `w${Date.now()}`,
      type,
      size: widgetType.defaultSize,
      visible: true
    };
    saveWidgets([...widgets, newWidget]);
    toast.success(`${widgetType.name} added!`);
  };

  const removeWidget = (widgetId) => {
    saveWidgets(widgets.filter(w => w.id !== widgetId));
    toast.success('Widget removed');
  };

  const resetLayout = () => {
    const defaultWidgets = [
      { id: 'w1', type: 'quickStats', size: 'full', visible: true },
      { id: 'w2', type: 'balanceOverview', size: 'large', visible: true },
      { id: 'w3', type: 'expensePie', size: 'medium', visible: true },
      { id: 'w4', type: 'recentTransactions', size: 'large', visible: true },
      { id: 'w5', type: 'savingsGoals', size: 'medium', visible: true },
    ];
    saveWidgets(defaultWidgets);
    toast.success('Layout reset to default');
  };

  // Prepare data for charts
  const monthlyData = Object.entries(monthlyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short' }),
      income: data.income,
      expense: data.expenses,
      balance: data.income - data.expenses
    }));

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory)
    .slice(0, 6)
    .map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));

  const getSizeClass = (size) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 md:col-span-2';
      case 'large': return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'full': return 'col-span-full';
      default: return 'col-span-1';
    }
  };

  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case 'quickStats':
        return (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Balance', value: totals.balance || 0, color: 'var(--primary-600)' },
              { label: 'Income', value: totals.income || 0, color: 'var(--success-800)' },
              { label: 'Expenses', value: totals.expenses || 0, color: 'var(--danger-500)' },
              { label: 'Savings', value: (totals.income || 0) - (totals.expenses || 0), color: 'var(--primary-400)' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                <p className="text-xl font-bold" style={{ color: stat.color }}>{formatINR(stat.value)}</p>
              </div>
            ))}
          </div>
        );

      case 'balanceOverview':
        return (
          <div className="h-48">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-600)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary-600)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(v) => `₹${(v/1000)}k`} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}
                    formatter={(value) => [formatINR(value), '']}
                  />
                  <Area type="monotone" dataKey="balance" stroke="var(--primary-600)" fill="url(#colorBalance)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                No data available
              </div>
            )}
          </div>
        );

      case 'expensePie':
        return (
          <div className="h-48 flex items-center gap-4">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: 'No data', value: 1, color: 'var(--neutral-300)' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                    stroke="none"
                  >
                    {(pieData.length > 0 ? pieData : [{ color: 'var(--neutral-300)' }]).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {pieData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-primary)' }}>{formatINR(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'incomeExpense':
        return (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(v) => `₹${(v/1000)}k`} />
                <Tooltip 
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  formatter={(value) => [formatINR(value), '']}
                />
                <Bar dataKey="income" fill="var(--success-800)" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="expense" fill="var(--danger-500)" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'recentTransactions':
        return (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {recentTransactions.slice(0, 5).map((t, i) => (
              <div key={t._id || i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium" style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)' }}>
                    {t.description?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <span className="text-sm font-medium" style={{ color: t.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)' }}>
                  {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                </span>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>No recent transactions</p>
            )}
          </div>
        );

      case 'savingsGoals':
        return (
          <div className="space-y-4">
            {savingsGoals.slice(0, 3).map((goal, i) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              return (
                <div key={goal._id || i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{goal.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--hover-bg)' }}>
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%`, background: progress >= 100 ? 'var(--success-800)' : 'var(--primary-600)' }}
                    />
                  </div>
                </div>
              );
            })}
            {savingsGoals.length === 0 && (
              <p className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>No savings goals yet</p>
            )}
          </div>
        );

      case 'budgetStatus':
        return (
          <div className="space-y-3">
            {budgets.slice(0, 4).map((budget, i) => {
              const spent = budget.spent || 0;
              const progress = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
              const isOverBudget = progress > 100;
              return (
                <div key={budget._id || i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{budget.category}</span>
                      <span className="text-xs" style={{ color: isOverBudget ? 'var(--danger-500)' : 'var(--text-muted)' }}>
                        {formatINR(spent)} / {formatINR(budget.limit)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--hover-bg)' }}>
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%`, background: isOverBudget ? 'var(--danger-500)' : 'var(--primary-600)' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && (
              <p className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>No budgets set</p>
            )}
          </div>
        );

      case 'monthlyTrend':
        return (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(v) => `₹${(v/1000)}k`} />
                <Tooltip 
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  formatter={(value) => [formatINR(value), '']}
                />
                <Line type="monotone" dataKey="income" stroke="var(--success-800)" strokeWidth={2} dot={{ fill: 'var(--success-800)', r: 4 }} />
                <Line type="monotone" dataKey="expense" stroke="var(--danger-500)" strokeWidth={2} dot={{ fill: 'var(--danger-500)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return <p style={{ color: 'var(--text-muted)' }}>Unknown widget type</p>;
    }
  };

  const visibleWidgets = widgets.filter(w => w.visible);

  return (
    <div className="max-w-7xl mx-auto">
      <Header 
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`}
        subtitle="Customizable dashboard - drag widgets to rearrange"
        user={user}
      >
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Settings size={16} />
          Customize
        </button>
        <button className="btn btn-primary" onClick={onAddTransaction}>
          <Plus size={16} />
          Add Transaction
        </button>
      </Header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card p-4 mt-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dashboard Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 rounded-lg hover:bg-[var(--hover-bg)]">
                <X size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Add Widgets</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.values(WIDGET_TYPES).map((type) => (
                    <button
                      key={type.id}
                      onClick={() => addWidget(type.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                      style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-100)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                    >
                      <span>{type.icon}</span>
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Quick Actions</h4>
                <button
                  onClick={resetLayout}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--danger-200)', color: 'var(--danger-500)' }}
                >
                  Reset to Default
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Widget Visibility</h4>
              <div className="flex flex-wrap gap-2">
                {widgets.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                    style={{ 
                      background: widget.visible ? 'var(--primary-100)' : 'var(--hover-bg)', 
                      color: widget.visible ? 'var(--primary-600)' : 'var(--text-muted)' 
                    }}
                  >
                    {widget.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    {WIDGET_TYPES[widget.type]?.name || widget.type}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Widget Grid */}
      <Reorder.Group 
        axis="y" 
        values={visibleWidgets} 
        onReorder={handleReorder}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6"
      >
        {visibleWidgets.map((widget) => (
          <Reorder.Item
            key={widget.id}
            value={widget}
            className={`${getSizeClass(widget.size)}`}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            <motion.div
              className="card p-4 h-full cursor-grab active:cursor-grabbing group"
              whileHover={{ scale: isDragging ? 1 : 1.01 }}
              whileDrag={{ scale: 1.02, zIndex: 50 }}
              layout
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical 
                    size={16} 
                    className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab" 
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <span className="text-lg">{WIDGET_TYPES[widget.type]?.icon}</span>
                  <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {WIDGET_TYPES[widget.type]?.name || widget.type}
                  </h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWidgetSize(widget.id); }}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Toggle size"
                  >
                    {widget.size === 'full' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                    className="p-1 rounded transition-colors hover:bg-[var(--danger-200)] hover:text-[var(--danger-500)]"
                    style={{ color: 'var(--text-muted)' }}
                    title="Remove widget"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Widget Content */}
              {renderWidgetContent(widget)}
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <div className="card p-12 text-center mt-6">
          <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>No widgets visible</p>
          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Widgets
          </button>
        </div>
      )}
    </div>
  );
};

export default DraggableDashboard;
