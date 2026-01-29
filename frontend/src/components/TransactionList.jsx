import React, { useState } from 'react';
import { formatCurrency } from '../utils/storage';
import {
  Calendar,
  Tag,
  Edit,
  Trash2,
  Filter,
  Search,
  DollarSign
} from 'lucide-react';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return formatDate(dateString);
  };

  const categories = [...new Set(transactions.map(t => t.category))];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = formatDate(transaction.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍔',
      'Transport': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills': '📄',
      'Healthcare': '🏥',
      'Education': '📚',
      'Salary': '💰',
      'Freelance': '💼',
      'Investment': '📈',
      'Other': '📦'
    };
    return icons[category] || '💳';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-indigo-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="all" className="bg-indigo-950">All Types</option>
            <option value="income" className="bg-indigo-950">Income</option>
            <option value="expense" className="bg-indigo-950">Expenses</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="all" className="bg-indigo-950">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-indigo-950">{cat}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-purple-200">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </span>
          <button className="text-purple-300 hover:text-white font-medium flex items-center space-x-1">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {Object.keys(groupedTransactions).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-px flex-1 bg-purple-500/30"></div>
                <span className="text-sm font-semibold text-purple-200 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                  {date}
                </span>
                <div className="h-px flex-1 bg-purple-500/30"></div>
              </div>

              {/* Transaction Cards */}
              <div className="space-y-3">
                {dayTransactions.map((transaction) => (
                  <div
                    key={transaction._id || transaction.id}
                    className="group bg-indigo-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left Side - Icon and Details */}
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Category Icon */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${transaction.type === 'income'
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-red-500/20 border border-red-500/30'
                          }`}>
                          {getCategoryIcon(transaction.category)}
                        </div>

                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-white text-lg truncate">
                              {transaction.description}
                            </h3>
                            {transaction.isRecurring && (
                              <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300">
                                Recurring
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-purple-200">
                            <div className="flex items-center space-x-1">
                              <Tag className="w-3.5 h-3.5" />
                              <span>{transaction.category}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{getTimeAgo(transaction.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Amount and Actions */}
                      <div className="flex items-center space-x-4">
                        {/* Amount */}
                        <div className="text-right">
                          <div className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                          <div className="text-xs text-purple-300 mt-0.5">
                            {transaction.type === 'income' ? 'Income' : 'Expense'}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit && onEdit(transaction)}
                            className="p-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete && onDelete(transaction._id || transaction.id)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-indigo-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-10 h-10 text-purple-300" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No transactions found</h3>
          <p className="text-purple-200 mb-6">
            {searchTerm || filterType !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by adding your first transaction'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;