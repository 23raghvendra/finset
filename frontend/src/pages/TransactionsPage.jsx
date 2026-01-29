import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { formatCurrency, formatINR } from '../utils/storage';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination, { usePagination } from '../components/Pagination';
import VirtualTransactionList from '../components/VirtualTransactionList';
import {
  Calendar,
  SlidersHorizontal,
  Download,
  Plus,
  X,
  ChevronDown,
  MoreHorizontal,
  Edit2,
  Trash2,
  Upload,
  Zap,
  Camera
} from 'lucide-react';

const TransactionsPage = ({ user, transactions, onAddTransaction, onEditTransaction, onDeleteTransaction, onImportClick, onScanReceipt }) => {
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [useVirtualScroll, setUseVirtualScroll] = useState(() => {
    return localStorage.getItem('useVirtualScroll') === 'true';
  });

  const categories = [...new Set(transactions?.map(t => t.category) || [])];

  const filteredTransactions = (transactions || []).filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  // Pagination
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedTransactions,
    totalItems,
    itemsPerPage
  } = usePagination(filteredTransactions, 15);

  const toggleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    
    const headers = ['Date', 'Type', 'Amount', 'Description', 'Category'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('en-IN'),
      t.type,
      t.amount,
      t.description,
      t.category
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Transactions exported successfully!');
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      toast.error('No transactions selected');
      return;
    }
    setBulkDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    const count = selectedRows.length;
    selectedRows.forEach(id => onDeleteTransaction(id));
    setSelectedRows([]);
    toast.success(`Deleted ${count} transaction(s)`);
  };

  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    toast.success('Filters reset');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Header 
        title="Transactions"
        subtitle="Overview of your activities"
        user={user}
      >
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={16} />
          Export
        </button>
        {onScanReceipt && (
          <button className="btn btn-secondary" onClick={onScanReceipt}>
            <Camera size={16} />
            Scan Receipt
          </button>
        )}
        {onImportClick && (
          <button className="btn btn-secondary" onClick={onImportClick}>
            <Upload size={16} />
            Import
          </button>
        )}
        <button className="btn btn-primary" onClick={onAddTransaction}>
          <Plus size={16} />
          Add Transaction
        </button>
      </Header>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input py-2 px-3"
          style={{ width: 'auto' }}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input py-2 px-3"
          style={{ width: 'auto' }}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button 
          onClick={resetFilters}
          className="text-sm font-medium flex items-center gap-1"
          style={{ color: 'var(--primary-600)' }}
        >
          Reset filters
        </button>

        {selectedRows.length > 0 && (
          <button 
            onClick={handleDeleteSelected}
            className="btn btn-danger ml-auto"
          >
            <Trash2 size={16} />
            Delete Selected ({selectedRows.length})
          </button>
        )}

        {/* Virtual scroll toggle */}
        <button
          onClick={() => {
            const newValue = !useVirtualScroll;
            setUseVirtualScroll(newValue);
            localStorage.setItem('useVirtualScroll', newValue.toString());
            toast.success(newValue ? 'Virtual scrolling enabled' : 'Standard view enabled');
          }}
          className={`ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${useVirtualScroll ? 'bg-[var(--primary-100)] text-[var(--primary-600)]' : 'bg-[var(--hover-bg)] text-[var(--text-muted)]'}`}
          title={useVirtualScroll ? 'Virtual scrolling enabled (optimized for large lists)' : 'Enable virtual scrolling for better performance'}
        >
          <Zap size={14} />
          {useVirtualScroll ? 'Virtual' : 'Standard'}
        </button>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        {useVirtualScroll && filteredTransactions.length > 50 && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            ⚡ Optimized
          </span>
        )}
      </p>

      {/* Transactions Table */}
      {useVirtualScroll && filteredTransactions.length > 50 ? (
        <VirtualTransactionList
          transactions={filteredTransactions}
          selectedRows={selectedRows}
          onSelectRow={toggleRowSelection}
          onSelectAll={(selectAll) => {
            if (selectAll) {
              setSelectedRows(filteredTransactions.map(t => t._id || t.id));
            } else {
              setSelectedRows([]);
            }
          }}
          onEdit={onEditTransaction}
          onDelete={onDeleteTransaction}
          containerHeight={500}
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th className="table-header w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded"
                      checked={selectedRows.length === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(filteredTransactions.map(t => t._id || t.id));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                    />
                  </th>
                  <th className="table-header text-left">Date</th>
                  <th className="table-header text-left">Amount</th>
                  <th className="table-header text-left">Description</th>
                  <th className="table-header text-left">Category</th>
                  <th className="table-header text-left">Type</th>
                  <th className="table-header w-12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((t) => {
                  const isSelected = selectedRows.includes(t._id || t.id);
                  const transactionId = t._id || t.id;
                  return (
                    <tr 
                      key={transactionId} 
                      style={{ 
                        borderBottom: '1px solid var(--border-light)',
                        background: isSelected ? 'var(--primary-100)' : 'transparent'
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'var(--hover-bg)';
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td className="table-cell">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleRowSelection(transactionId)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="table-cell" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(t.date)}
                      </td>
                      <td className="table-cell font-medium" style={{ color: t.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)' }}>
                        {t.type === 'income' ? '+' : '-'} {formatINR(t.amount)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--hover-bg)' }}>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                              {t.description?.substring(0, 2).toUpperCase() || '??'}
                            </span>
                          </div>
                          <span style={{ color: 'var(--text-primary)' }}>{t.description}</span>
                        </div>
                      </td>
                      <td className="table-cell" style={{ color: 'var(--text-secondary)' }}>
                        {t.category}
                      </td>
                      <td className="table-cell">
                        <span 
                          className="badge"
                          style={{
                            background: t.type === 'income' ? 'var(--success-200)' : 'var(--danger-200)',
                            color: t.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)'
                          }}
                        >
                          {t.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="relative">
                          <button 
                            onClick={() => setShowActionsMenu(showActionsMenu === transactionId ? null : transactionId)}
                            className="p-1 rounded transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {showActionsMenu === transactionId && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowActionsMenu(null)} />
                              <div 
                                className="absolute right-0 top-8 z-50 rounded-lg shadow-lg border py-1 w-32"
                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
                              >
                                <button
                                  onClick={() => {
                                    onEditTransaction(t);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                                  style={{ color: 'var(--text-primary)' }}
                                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    onDeleteTransaction(transactionId);
                                    setShowActionsMenu(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                                  style={{ color: 'var(--danger-500)' }}
                                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--danger-200)'}
                                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="table-cell text-center py-12" style={{ color: 'var(--text-muted)' }}>
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Transactions"
        message={`Are you sure you want to delete ${selectedRows.length} selected transaction(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default TransactionsPage;
