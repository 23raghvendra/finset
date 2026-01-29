import React, { useState, useEffect } from 'react';
import { getCategories } from '../utils/storage';
import { X, ChevronDown, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionForm = ({ onSubmit, onCancel, transaction = null }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    method: 'UPI',
    status: 'Successful'
  });

  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);

    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        category: transaction.category,
        date: new Date(transaction.date).toISOString().split('T')[0],
        method: 'UPI',
        status: 'Successful'
      });
    }
  }, [transaction]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.description || formData.description.trim().length < 2) {
      newErrors.description = 'Description must be at least 2 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    await onSubmit({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date
    });
  };

  const currentCategories = categories[formData.type] || [];

  return (
    <div className="p-4 sm:p-6" style={{ background: 'var(--card-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sticky top-0 pb-2" style={{ background: 'var(--card-bg)' }}>
        <div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>Fill in the details below</p>
        </div>
        <button 
          onClick={onCancel} 
          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--hover-bg)' }}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-4 sm:mt-6">
        {/* Type & Amount Row - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Type & Currency in row on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
                Type <span style={{ color: 'var(--danger-500)' }}>*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                  className="input appearance-none pr-8 text-sm"
                  style={{ fontSize: '16px' }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            <div className="sm:hidden">
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>Currency</label>
              <div className="relative">
                <select className="input appearance-none pr-8 text-sm" style={{ fontSize: '16px' }}>
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
          
          {/* Currency - Desktop only */}
          <div className="hidden sm:block">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Currency</label>
            <div className="relative">
              <select className="input appearance-none pr-10" style={{ fontSize: '16px' }}>
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
          
          {/* Amount - Full width on mobile */}
          <div className="sm:col-span-1">
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
              Amount <span style={{ color: 'var(--danger-500)' }}>*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                if (errors.amount) setErrors({ ...errors, amount: '' });
              }}
              className={`input ${errors.amount ? 'border-2' : ''}`}
              style={{ borderColor: errors.amount ? 'var(--danger-500)' : undefined, fontSize: '16px' }}
              placeholder="₹10,000"
              required
            />
            {errors.amount && (
              <p className="text-[11px] sm:text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger-500)' }}>
                <AlertCircle size={11} /> {errors.amount}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
            Description <span style={{ color: 'var(--danger-500)' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            className={`input ${errors.description ? 'border-2' : ''}`}
            style={{ borderColor: errors.description ? 'var(--danger-500)' : undefined, fontSize: '16px' }}
            placeholder="Transaction description"
            required
          />
          {errors.description && (
            <p className="text-[11px] sm:text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger-500)' }}>
              <AlertCircle size={11} /> {errors.description}
            </p>
          )}
        </div>

        {/* Method & Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>Payment Method</label>
            <div className="relative">
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="input appearance-none pr-8 sm:pr-10"
                style={{ fontSize: '16px' }}
              >
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Debit Card</option>
                <option>Credit Card</option>
                <option>Cash</option>
                <option>Wallet</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
              Category <span style={{ color: 'var(--danger-500)' }}>*</span>
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: '' });
                }}
                className={`input appearance-none pr-8 sm:pr-10 ${errors.category ? 'border-2' : ''}`}
                style={{ borderColor: errors.category ? 'var(--danger-500)' : undefined, fontSize: '16px' }}
                required
              >
                <option value="">Select category</option>
                {currentCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
            {errors.category && (
              <p className="text-[11px] sm:text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger-500)' }}>
                <AlertCircle size={11} /> {errors.category}
              </p>
            )}
          </div>
        </div>

        {/* Date & Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
              Date <span style={{ color: 'var(--danger-500)' }}>*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  if (errors.date) setErrors({ ...errors, date: '' });
                }}
                className={`input pl-10 ${errors.date ? 'border-2' : ''}`}
                style={{ borderColor: errors.date ? 'var(--danger-500)' : undefined, fontSize: '16px' }}
                required
              />
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            </div>
            {errors.date && (
              <p className="text-[11px] sm:text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger-500)' }}>
                <AlertCircle size={11} /> {errors.date}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>Status</label>
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input appearance-none pr-8 sm:pr-10"
                style={{ fontSize: '16px' }}
              >
                <option>Successful</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Actions - Full width buttons on mobile */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 pb-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex-1 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 min-h-[44px]"
          >
            {transaction ? 'Update' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
