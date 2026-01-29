import React, { useState, useCallback, memo } from 'react';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import { formatINR } from '../utils/storage';
import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';

/**
 * Memoized transaction row for performance
 */
const TransactionRow = memo(({ 
  transaction, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete,
  showActions,
  onToggleActions,
  style 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const transactionId = transaction._id || transaction.id;

  return (
    <div 
      style={{ 
        ...style,
        borderBottom: '1px solid var(--border-light)',
        background: isSelected ? 'var(--primary-100)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        transition: 'background 0.15s'
      }}
      className="hover:bg-[var(--hover-bg)]"
    >
      {/* Checkbox */}
      <div className="w-12 flex-shrink-0">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onSelect(transactionId)}
          className="w-4 h-4 rounded"
        />
      </div>

      {/* Date */}
      <div className="w-28 flex-shrink-0 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {formatDate(transaction.date)}
      </div>

      {/* Amount */}
      <div 
        className="w-32 flex-shrink-0 text-sm font-medium"
        style={{ color: transaction.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)' }}
      >
        {transaction.type === 'income' ? '+' : '-'} {formatINR(transaction.amount)}
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--hover-bg)' }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {transaction.description?.substring(0, 2).toUpperCase() || '??'}
          </span>
        </div>
        <span className="truncate" style={{ color: 'var(--text-primary)' }}>
          {transaction.description}
        </span>
      </div>

      {/* Category */}
      <div className="w-28 flex-shrink-0 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {transaction.category}
      </div>

      {/* Type Badge */}
      <div className="w-24 flex-shrink-0">
        <span 
          className="badge text-xs"
          style={{
            background: transaction.type === 'income' ? 'var(--success-200)' : 'var(--danger-200)',
            color: transaction.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)'
          }}
        >
          {transaction.type === 'income' ? 'Income' : 'Expense'}
        </span>
      </div>

      {/* Actions */}
      <div className="w-12 flex-shrink-0 relative">
        <button 
          onClick={() => onToggleActions(transactionId)}
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <MoreHorizontal size={16} />
        </button>
        
        {showActions && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => onToggleActions(null)} />
            <div 
              className="absolute right-0 top-8 z-50 rounded-lg shadow-lg border py-1 w-32"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => { onEdit(transaction); onToggleActions(null); }}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-[var(--hover-bg)]"
                style={{ color: 'var(--text-primary)' }}
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                onClick={() => { onDelete(transactionId); onToggleActions(null); }}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-[var(--danger-200)]"
                style={{ color: 'var(--danger-500)' }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

TransactionRow.displayName = 'TransactionRow';

/**
 * Virtual scrolling transaction list for large datasets
 */
const VirtualTransactionList = ({
  transactions = [],
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  onEdit,
  onDelete,
  containerHeight = 500
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const {
    containerProps,
    innerProps,
    visibleItems
  } = useVirtualScroll(transactions, { 
    itemHeight: 60, 
    containerHeight,
    overscan: 3 
  });

  const handleSelectAll = useCallback((e) => {
    onSelectAll?.(e.target.checked);
  }, [onSelectAll]);

  if (transactions.length === 0) {
    return (
      <div 
        className="flex items-center justify-center py-12"
        style={{ color: 'var(--text-muted)' }}
      >
        No transactions found
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center px-4 py-3 text-xs font-medium uppercase"
        style={{ 
          background: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--border)',
          color: 'var(--text-muted)'
        }}
      >
        <div className="w-12 flex-shrink-0">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded"
            checked={selectedRows.length === transactions.length && transactions.length > 0}
            onChange={handleSelectAll}
          />
        </div>
        <div className="w-28 flex-shrink-0">Date</div>
        <div className="w-32 flex-shrink-0">Amount</div>
        <div className="flex-1">Description</div>
        <div className="w-28 flex-shrink-0">Category</div>
        <div className="w-24 flex-shrink-0">Type</div>
        <div className="w-12 flex-shrink-0">Actions</div>
      </div>

      {/* Virtual List */}
      <div {...containerProps}>
        <div {...innerProps}>
          {visibleItems.map((item) => (
            <TransactionRow
              key={item._id || item.id || item.virtualIndex}
              transaction={item}
              isSelected={selectedRows.includes(item._id || item.id)}
              onSelect={onSelectRow}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={activeMenu === (item._id || item.id)}
              onToggleActions={setActiveMenu}
              style={item.style}
            />
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div 
        className="px-4 py-2 text-xs flex items-center justify-between"
        style={{ 
          background: 'var(--bg-secondary)', 
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)'
        }}
      >
        <span>
          Showing {visibleItems.length} of {transactions.length} transactions
        </span>
        {selectedRows.length > 0 && (
          <span style={{ color: 'var(--primary-600)' }}>
            {selectedRows.length} selected
          </span>
        )}
      </div>
    </div>
  );
};

export default VirtualTransactionList;
