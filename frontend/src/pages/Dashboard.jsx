import React from 'react';
import Header from '../components/Header';
import { formatCurrency, formatINR } from '../utils/storage';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Settings,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = ({ user, totals, recentTransactions, monthlyStats, budgets, savingsGoals, onAddTransaction }) => {
  const balance = totals?.balance || 0;
  const income = totals?.income || 0;
  const expenses = totals?.expenses || 0;
  const savings = income - expenses;

  // Prepare monthly data from actual transactions
  const monthlyData = Object.entries(monthlyStats || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short' }),
      Income: data.income,
      Expense: data.expenses,
    }));

  // Budget data for pie chart from actual budgets
  const BUDGET_COLORS = ['#8470FF', '#A498FF', '#BFB7FF', '#D6D2FF', '#56565E', '#82828C'];
  const budgetData = budgets?.slice(0, 6).map((b, index) => ({
    name: b.category,
    value: b.spent || 0,
    color: BUDGET_COLORS[index % BUDGET_COLORS.length]
  })) || [];

  const totalBudgetSpent = budgetData.reduce((acc, b) => acc + b.value, 0);

  const StatCard = ({ label, value, isPositive }) => (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {formatINR(value)}
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-2">
      {/* Header - Hidden on mobile since App.jsx has mobile header */}
      <div className="hidden sm:block">
        <Header 
          title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`}
          subtitle="Manage your finances effectively"
          user={user}
        >
          <button className="btn btn-primary" onClick={onAddTransaction}>
            <Plus size={16} />
            Add Transaction
          </button>
        </Header>
      </div>
      
      {/* Mobile Quick Add Button */}
      <div className="sm:hidden mb-4">
        <button 
          className="btn btn-primary w-full flex items-center justify-center gap-2" 
          onClick={onAddTransaction}
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {/* Stats Row - 2x2 on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard label="Balance" value={balance} />
        <StatCard label="Income" value={income} isPositive={true} />
        <StatCard label="Expenses" value={expenses} />
        <StatCard label="Savings" value={savings > 0 ? savings : 0} />
      </div>

      {/* Charts Row - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Money Flow Chart */}
        <div className="lg:col-span-2 card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Money Flow</h3>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: 'var(--primary-600)' }}></span>
                <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-secondary)' }}>Income</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: 'var(--neutral-300)' }}></span>
                <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-secondary)' }}>Expense</span>
              </div>
            </div>
          </div>
          <div className="h-48 sm:h-64">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={4}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--card-bg)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                    formatter={(value) => [formatINR(value), '']}
                  />
                  <Bar dataKey="Income" fill="var(--primary-600)" radius={[3, 3, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="Expense" fill="var(--neutral-300)" radius={[3, 3, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No transaction data to display
              </div>
            )}
          </div>
        </div>

        {/* Budget Pie Chart */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Budget Spent</h3>
          </div>
          <div className="h-36 sm:h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData.length > 0 ? budgetData : [{ name: 'No data', value: 1, color: 'var(--neutral-300)' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  dataKey="value"
                  stroke="none"
                >
                  {(budgetData.length > 0 ? budgetData : [{ color: 'var(--neutral-300)' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>Total Spent</span>
              <span className="text-sm sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatINR(totalBudgetSpent)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {budgetData.length > 0 ? budgetData.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0" style={{ background: item.color }}></span>
                <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
              </div>
            )) : (
              <p className="col-span-2 text-xs text-center" style={{ color: 'var(--text-muted)' }}>No budgets created yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Amount</th>
                  <th className="text-left py-2 font-medium">Description</th>
                  <th className="text-left py-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions?.slice(0, 5).map((t, i) => (
                  <tr key={t._id || i} className="border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <td className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 text-sm font-medium" style={{ color: t.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)' }}>
                      {t.type === 'income' ? '+' : '-'} {formatINR(t.amount)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center text-xs" style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)' }}>
                          {t.description?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t.description}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{t.category}</td>
                  </tr>
                ))}
                {(!recentTransactions || recentTransactions.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Transaction List */}
          <div className="sm:hidden space-y-2.5">
            {recentTransactions?.slice(0, 5).map((t, i) => (
              <div 
                key={t._id || i} 
                className="flex items-center justify-between p-2.5 rounded-lg"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0" 
                    style={{ 
                      background: t.type === 'income' ? 'rgba(41, 123, 50, 0.1)' : 'rgba(232, 56, 56, 0.1)',
                      color: t.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)'
                    }}
                  >
                    {t.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {t.description}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {t.category} • {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <span 
                  className="text-sm font-semibold flex-shrink-0 ml-2" 
                  style={{ color: t.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)' }}
                >
                  {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                </span>
              </div>
            ))}
            {(!recentTransactions || recentTransactions.length === 0) && (
              <div className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No transactions yet
              </div>
            )}
          </div>
        </div>

        {/* Saving Goals */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Savings Goals</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {savingsGoals?.slice(0, 3).map((goal, i) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              return (
                <div key={goal._id || i}>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm truncate pr-2" style={{ color: 'var(--text-primary)' }}>{goal.name}</span>
                    <span className="text-xs sm:text-sm font-medium flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{formatINR(goal.targetAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden" style={{ background: 'var(--hover-bg)' }}>
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(progress, 100)}%`,
                          background: progress >= 100 ? 'var(--success-800)' : 'var(--primary-600)'
                        }}
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs w-8 text-right" style={{ color: 'var(--text-muted)' }}>{Math.round(progress)}%</span>
                  </div>
                </div>
              );
            })}
            {(!savingsGoals || savingsGoals.length === 0) && (
              <div className="text-center py-4 text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                No savings goals yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
