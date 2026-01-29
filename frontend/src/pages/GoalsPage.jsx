import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { formatINR } from '../utils/storage';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Calendar,
  ArrowUpDown,
  SlidersHorizontal,
  Plus,
  Edit2,
  ChevronDown,
  X,
  Target,
  Trash2
} from 'lucide-react';

const GoalsPage = ({ user, savingsGoals, createSavingsGoal, editSavingsGoal, depositToGoal, removeSavingsGoal, refetchGoals, loading: goalsLoading, error: goalsError }) => {
  const isLoading = goalsLoading === true;
  const hasError = goalsError && String(goalsError).length > 0;
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [deleteGoalConfirm, setDeleteGoalConfirm] = useState({ show: false, goal: null });
  const [filterGoal, setFilterGoal] = useState('all'); // 'all' | 'in_progress' | 'finished' | 'not_started'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'deadline' | 'amount'
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    category: 'General'
  });

  // Stats calculation
  const totalGoals = savingsGoals?.length || 0;
  const finishedGoals = savingsGoals?.filter(g => g.currentAmount >= g.targetAmount).length || 0;
  const inProgressGoals = savingsGoals?.filter(g => g.currentAmount > 0 && g.currentAmount < g.targetAmount).length || 0;
  const notStartedGoals = savingsGoals?.filter(g => g.currentAmount === 0).length || 0;

  // Generate chart data from actual savings goals progress
  const totalSaved = savingsGoals?.reduce((acc, g) => acc + (g.currentAmount || 0), 0) || 0;
  const totalTarget = savingsGoals?.reduce((acc, g) => acc + (g.targetAmount || 0), 0) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetAmount = parseFloat(formData.targetAmount);
    if (isNaN(targetAmount) || targetAmount < 0) {
      return;
    }
    const goalData = {
      name: formData.name.trim(),
      targetAmount,
      category: formData.category,
      currentAmount: editingGoal?.currentAmount ?? 0
    };
    if (formData.deadline && formData.deadline.trim()) {
      goalData.deadline = formData.deadline;
    }

    if (editingGoal) {
      await editSavingsGoal(editingGoal._id || editingGoal.id, goalData);
    } else {
      await createSavingsGoal(goalData);
    }

    setFormData({ name: '', targetAmount: '', deadline: '', category: 'General' });
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      category: goal.category || 'General'
    });
    setShowForm(true);
  };

  const handleDeposit = async () => {
    if (!showDepositModal) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    const success = await depositToGoal(showDepositModal, amount);
    if (success) {
      setDepositAmount('');
      setShowDepositModal(null);
    }
  };

  const getProgress = (goal) => {
    const target = goal?.targetAmount;
    const current = goal?.currentAmount ?? 0;
    if (!target || target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 70) return 'var(--success-800)';
    if (progress >= 40) return 'var(--primary-600)';
    return 'var(--primary-400)';
  };

  const confirmDeleteGoal = async () => {
    if (deleteGoalConfirm.goal) {
      const id = deleteGoalConfirm.goal._id || deleteGoalConfirm.goal.id;
      await removeSavingsGoal(id);
      setDeleteGoalConfirm({ show: false, goal: null });
    }
  };

  const filteredAndSortedGoals = useMemo(() => {
    let list = savingsGoals || [];
    if (filterGoal === 'in_progress') {
      list = list.filter(g => (g.currentAmount ?? 0) > 0 && (g.currentAmount ?? 0) < (g.targetAmount ?? 0));
    } else if (filterGoal === 'finished') {
      list = list.filter(g => (g.currentAmount ?? 0) >= (g.targetAmount ?? 0));
    } else if (filterGoal === 'not_started') {
      list = list.filter(g => (g.currentAmount ?? 0) === 0);
    }
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'deadline') {
        const da = a.deadline ? new Date(a.deadline).getTime() : 0;
        const db = b.deadline ? new Date(b.deadline).getTime() : 0;
        return da - db;
      }
      if (sortBy === 'amount') return (b.targetAmount ?? 0) - (a.targetAmount ?? 0);
      return 0;
    });
    return sorted;
  }, [savingsGoals, filterGoal, sortBy]);

  const renderGoalFormModal = () => (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--neutral-900)]">
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h2>
          <button type="button" onClick={() => { setShowForm(false); setEditingGoal(null); }} className="text-[var(--neutral-400)] hover:text-[var(--neutral-600)]">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Goal Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="e.g., New MacBook Pro"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Target Amount</label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetAmount: e.target.value }))}
                className="input"
                placeholder="₹0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Due Date</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {editingGoal ? 'Update Goal' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Header title="Goals" subtitle="Create financial goals and manage your savings" user={user} />
        <div className="card p-12 text-center mt-8">
          <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-600)' }} />
          <p className="text-[var(--neutral-500)]">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="max-w-7xl mx-auto">
        <Header title="Goals" subtitle="Create financial goals and manage your savings" user={user} />
        <div className="card p-8 mt-8 border border-[var(--danger-200)]">
          <p className="text-[var(--danger-600)] font-medium mb-2">Failed to load goals</p>
          <p className="text-sm text-[var(--neutral-500)] mb-4">{goalsError}</p>
          {refetchGoals && (
            <button type="button" className="btn btn-primary" onClick={() => refetchGoals()}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!savingsGoals || savingsGoals.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Header 
          title="Goals"
          subtitle="Create financial goals and manage your savings"
          user={user}
        >
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Add new goal
          </button>
        </Header>

        {/* Empty State */}
        <div className="card p-12 text-center mt-8">
          <div className="max-w-sm mx-auto">
            <div className="w-64 h-64 mx-auto mb-6 bg-[var(--primary-100)] rounded-full flex items-center justify-center">
              <Target size={80} className="text-[var(--primary-600)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--neutral-900)] mb-2">You haven't added any goals yet</h2>
            <p className="text-[var(--neutral-500)] mb-6">
              Start planning your future now! Create your first goal and start saving for it
            </p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} />
              Add new goal
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && renderGoalFormModal()}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Header 
        title="Goals"
        subtitle="Create financial goals and manage your savings"
        user={user}
      >
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Add new goal
        </button>
      </Header>

      {/* Sort */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <label className="text-sm text-[var(--neutral-500)]">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input py-2 px-3 text-sm"
          style={{ width: 'auto' }}
        >
          <option value="name">Name A–Z</option>
          <option value="deadline">Due date</option>
          <option value="amount">Target amount (high to low)</option>
        </select>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          type="button"
          className={`filter-chip ${filterGoal === 'all' ? 'active' : ''}`}
          onClick={() => setFilterGoal('all')}
        >
          All
        </button>
        <button
          type="button"
          className={`filter-chip ${filterGoal === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilterGoal('in_progress')}
        >
          In progress
        </button>
        <button
          type="button"
          className={`filter-chip ${filterGoal === 'not_started' ? 'active' : ''}`}
          onClick={() => setFilterGoal('not_started')}
        >
          Not started
        </button>
        <button
          type="button"
          className={`filter-chip ${filterGoal === 'finished' ? 'active' : ''}`}
          onClick={() => setFilterGoal('finished')}
        >
          Finished
        </button>
        <button
          type="button"
          className="text-sm text-[var(--primary-600)] font-medium hover:underline"
          onClick={() => { setFilterGoal('all'); setSortBy('name'); }}
        >
          Reset all
        </button>
      </div>

      <p className="text-sm text-[var(--neutral-400)] mb-4">{filteredAndSortedGoals.length} goal{filteredAndSortedGoals.length !== 1 ? 's' : ''}</p>

      {/* Goals Grid - show all goals, responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {filteredAndSortedGoals.map((goal) => {
          const progress = getProgress(goal);
          const target = goal.targetAmount ?? 0;
          const current = goal.currentAmount ?? 0;
          const remaining = Math.max(0, target - current);
          const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

          return (
                <div key={goal._id || goal.id} className="card p-5 relative">
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: getProgressColor(progress) }} />
                  
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--neutral-900)]">{goal.name}</h3>
                      <p className="text-xs text-[var(--neutral-400)]">
                        {goal.deadline ? `Due date — ${new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 
                         daysLeft !== null && daysLeft !== undefined ? `Left — ${daysLeft} days` : 'No deadline'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => handleEdit(goal)} className="p-2 hover:bg-[var(--neutral-100)] rounded-lg" title="Edit goal">
                        <Edit2 size={16} className="text-[var(--neutral-400)]" />
                      </button>
                      <button type="button" onClick={() => setDeleteGoalConfirm({ show: true, goal })} className="p-2 hover:bg-[var(--danger-100)] rounded-lg" title="Delete goal">
                        <Trash2 size={16} className="text-[var(--danger-500)]" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-[var(--neutral-900)]">
                      {formatINR(goal.currentAmount)}
                      <span className="text-sm font-normal text-[var(--neutral-400)]"> / {formatINR(goal.targetAmount)}</span>
                    </p>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ 
                        background: `${getProgressColor(progress)}20`,
                        color: getProgressColor(progress)
                      }}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, background: getProgressColor(progress) }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--neutral-400)]">Left to complete the goal</span>
                    <span className="font-medium text-[var(--neutral-700)]">{formatINR(remaining)}</span>
                  </div>

                  <button
                    onClick={() => setShowDepositModal(goal._id || goal.id)}
                    className="w-full mt-4 py-2 text-sm font-medium text-[var(--primary-600)] hover:bg-[var(--primary-100)] rounded-lg transition-colors"
                  >
                    Add deposit
                  </button>
                </div>
          );
        })}
      </div>

      {/* Stats & Chart Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Goals Stats */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--neutral-900)]">Total goals</h3>
            <select className="text-xs border border-[var(--border)] rounded-lg px-2 py-1 bg-white">
              <option>This year</option>
            </select>
          </div>
          <p className="text-4xl font-bold text-[var(--neutral-900)] mb-6">{totalGoals}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--warning-200)] flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <p className="text-xs text-[var(--warning-500)]">Not started</p>
                <p className="font-bold text-[var(--neutral-900)]">{notStartedGoals}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--success-200)] flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
              <div>
                <p className="text-xs text-[var(--success-800)]">In progress</p>
                <p className="font-bold text-[var(--neutral-900)]">{inProgressGoals}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--danger-200)] flex items-center justify-center">
                <span className="text-lg">❌</span>
              </div>
              <div>
                <p className="text-xs text-[var(--danger-500)]">Canceled</p>
                <p className="font-bold text-[var(--neutral-900)]">0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary-200)] flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <div>
                <p className="text-xs text-[var(--primary-600)]">Finished</p>
                <p className="font-bold text-[var(--neutral-900)]">{finishedGoals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--neutral-900)]">Savings Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-[var(--primary-100)] rounded-xl">
              <p className="text-sm text-[var(--primary-600)] mb-1">Total Saved</p>
              <p className="text-3xl font-bold text-[var(--primary-800)]">{formatINR(totalSaved)}</p>
            </div>
            <div className="p-4 bg-[var(--neutral-100)] rounded-xl">
              <p className="text-sm text-[var(--neutral-500)] mb-1">Total Target</p>
              <p className="text-3xl font-bold text-[var(--neutral-900)]">{formatINR(totalTarget)}</p>
            </div>
          </div>
          {totalTarget > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--neutral-500)]">Overall Progress</span>
                <span className="text-sm font-medium text-[var(--neutral-900)]">{Math.round((totalSaved / totalTarget) * 100)}%</span>
              </div>
              <div className="h-3 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--primary-600)] rounded-full transition-all"
                  style={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && renderGoalFormModal()}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDepositModal(null)}>
          <div className="modal-content p-6 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-[var(--neutral-900)] mb-4">Add Deposit</h2>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="input mb-4"
              placeholder="₹0"
              autoFocus
              min="0"
              step="any"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowDepositModal(null)} className="btn btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={handleDeposit} className="btn btn-primary flex-1">Deposit</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Goal Confirmation */}
      <ConfirmDialog
        isOpen={deleteGoalConfirm.show}
        onClose={() => setDeleteGoalConfirm({ show: false, goal: null })}
        onConfirm={confirmDeleteGoal}
        title="Delete Goal"
        message={deleteGoalConfirm.goal ? `Are you sure you want to delete the goal "${deleteGoalConfirm.goal.name}"? This action cannot be undone.` : 'Delete this goal?'}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default GoalsPage;
