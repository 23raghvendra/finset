import React from 'react';
import Header from '../components/Header';
import { formatCurrency, formatINR } from '../utils/storage';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  CreditCard,
  Wallet
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const WalletPage = ({ user, totals, transactions, recentTransactions }) => {
  const balance = totals?.balance || 0;
  const income = totals?.income || 0;
  const expenses = totals?.expenses || 0;

  // Transaction overview data from actual transactions
  const overviewData = transactions?.slice(0, 20).map((t, i) => {
    const date = new Date(t.date);
    return {
      day: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      amount: t.type === 'income' ? t.amount : -t.amount
    };
  }) || [];

  // Statistics pie data
  const expensesByCategory = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expensesByCategory || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#8470FF', '#BFB7FF', '#82828C', '#45454B', '#D6D2FF'];

  return (
    <div className="max-w-7xl mx-auto">
      <Header 
        title="Wallet"
        subtitle="Overview of your balance and accounts"
        user={user}
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Balance Summary Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Total Balance */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-100)] flex items-center justify-center">
                  <Wallet size={20} className="text-[var(--primary-600)]" />
                </div>
                <h3 className="font-semibold text-[var(--neutral-900)]">Total Balance</h3>
              </div>
              <p className="text-3xl font-bold text-[var(--neutral-900)]">
                {formatINR(balance)}
              </p>
              <p className="text-sm text-[var(--neutral-400)] mt-2">Current balance</p>
            </div>

            {/* Income */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--success-200)] flex items-center justify-center">
                  <ArrowDownLeft size={20} className="text-[var(--success-800)]" />
                </div>
                <h3 className="font-semibold text-[var(--neutral-900)]">Total Income</h3>
              </div>
              <p className="text-3xl font-bold text-[var(--success-800)]">
                {formatINR(income)}
              </p>
              <p className="text-sm text-[var(--neutral-400)] mt-2">Money received</p>
            </div>

            {/* Expenses */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--danger-200)] flex items-center justify-center">
                  <ArrowUpRight size={20} className="text-[var(--danger-500)]" />
                </div>
                <h3 className="font-semibold text-[var(--neutral-900)]">Total Expenses</h3>
              </div>
              <p className="text-3xl font-bold text-[var(--danger-500)]">
                {formatINR(expenses)}
              </p>
              <p className="text-sm text-[var(--neutral-400)] mt-2">Money spent</p>
            </div>
          </div>

          {/* Transactions Overview Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--neutral-900)]">Transactions overview</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--primary-600)]"></span>
                  <span className="text-xs text-[var(--neutral-500)]">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--neutral-300)]"></span>
                  <span className="text-xs text-[var(--neutral-500)]">Expenses</span>
                </div>
              </div>
            </div>
            <div className="h-48">
              {overviewData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overviewData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--neutral-400)', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--neutral-400)', fontSize: 11 }} tickFormatter={(v) => `₹${Math.abs(v).toLocaleString('en-IN')}`} />
                    <Tooltip 
                      contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px' }}
                      formatter={(value) => [formatINR(Math.abs(value)), value > 0 ? 'Income' : 'Expense']}
                    />
                    <Line type="monotone" dataKey="amount" stroke="var(--primary-600)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--neutral-400)]">
                  No transaction data to display
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--neutral-900)]">Recent transactions</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[var(--neutral-400)] uppercase">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Amount</th>
                  <th className="text-left py-2 font-medium">Description</th>
                  <th className="text-left py-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions?.slice(0, 5).map((t, i) => (
                  <tr key={t._id || i} className="border-t border-[var(--border-light)]">
                    <td className="py-3 text-sm text-[var(--neutral-600)]">
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className={`py-3 text-sm font-medium ${t.type === 'expense' ? 'text-[var(--danger-500)]' : 'text-[var(--success-800)]'}`}>
                      {t.type === 'expense' ? '-' : '+'} {formatINR(t.amount)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[var(--neutral-100)] flex items-center justify-center text-xs">
                          {t.description?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm text-[var(--neutral-900)]">{t.description}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-[var(--neutral-600)]">{t.category}</td>
                  </tr>
                ))}
                {(!recentTransactions || recentTransactions.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[var(--neutral-400)]">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--neutral-900)]">Expense Breakdown</h3>
            </div>

            {pieData.length > 0 ? (
              <>
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xs text-[var(--neutral-400)]">Total Expenses</span>
                    <span className="text-lg font-bold text-[var(--neutral-900)]">{formatINR(expenses)}</span>
                  </div>
                </div>

                {/* Categories breakdown */}
                <div className="space-y-3">
                  {pieData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                        <span className="text-sm text-[var(--neutral-600)]">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-[var(--neutral-900)]">
                          {expenses > 0 ? Math.round((item.value / expenses) * 100) : 0}%
                        </span>
                        <span className="text-xs text-[var(--neutral-400)] ml-2">
                          {formatINR(item.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-[var(--neutral-400)]">
                No expense data to display
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
