import React, { useState } from 'react';
import { useAdvancedFinance } from '../hooks/useAdvancedFinance';
import { Plus, Edit2, Trash2, Target, DollarSign, Calendar, X, Check } from 'lucide-react';
import { formatCurrency } from '../utils/storage';
import ConfirmDialog from './ConfirmDialog';

const SavingsGoals = () => {
  const {
    savingsGoals,
    createSavingsGoal,
    editSavingsGoal,
    depositToGoal,
    removeSavingsGoal
  } = useAdvancedFinance();

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ show: false, goal: null });

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    category: 'General'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      return;
    }

    const goalData = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      deadline: formData.deadline,
      category: formData.category
    };

    if (editingGoal) {
      await editSavingsGoal(editingGoal._id || editingGoal.id, goalData);
    } else {
      await createSavingsGoal(goalData);
    }

    setFormData({ name: '', targetAmount: '', deadline: '', category: 'General' });
    setShowGoalForm(false);
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
    setShowGoalForm(true);
  };

  const handleDelete = (goal) => {
    setDeleteDialog({ show: true, goal });
  };

  const confirmDelete = async () => {
    if (deleteDialog.goal) {
      await removeSavingsGoal(deleteDialog.goal._id || deleteDialog.goal.id);
    }
    setDeleteDialog({ show: false, goal: null });
  };

  const handleDeposit = async (goalId) => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      await depositToGoal(goalId, amount);
      setDepositAmount('');
      setShowDepositForm(null);
    }
  };

  const getProgress = (goal) => (goal.currentAmount / goal.targetAmount) * 100;

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Savings Goals</h2>
        <button onClick={() => setShowGoalForm(true)} className="btn btn-secondary">
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-3 gap-4">
        {savingsGoals.map((goal) => {
          const progress = getProgress(goal);
          const daysLeft = getDaysRemaining(goal.deadline);
          const isComplete = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal._id || goal.id}
              className="bg-surface rounded-2xl p-5 border border-default transition-all hover:border-[var(--accent)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-primary">{goal.name}</h3>
                  <p className="text-xs text-muted">{goal.category}</p>
                </div>
                <div className="flex gap-1">
                  {!isComplete && (
                    <button onClick={() => setShowDepositForm(goal._id || goal.id)} className="p-1.5 hover:bg-elevated rounded-lg text-muted hover:text-primary transition-colors">
                      <DollarSign size={14} />
                    </button>
                  )}
                  <button onClick={() => handleEdit(goal)} className="p-1.5 hover:bg-elevated rounded-lg text-muted hover:text-primary transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(goal)} className="p-1.5 hover:bg-elevated rounded-lg text-muted hover:text-primary transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-end justify-between mb-2">
                  <p className="text-2xl font-bold text-primary">{formatCurrency(goal.currentAmount)}</p>
                  <p className="text-sm text-secondary">of {formatCurrency(goal.targetAmount)}</p>
                </div>
                <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(progress, 100)}%`,
                      background: 'var(--accent)'
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                {daysLeft !== null && (
                  <span className="text-secondary flex items-center gap-1">
                    <Calendar size={12} />
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                  </span>
                )}
                {isComplete && (
                  <span className="text-primary font-medium flex items-center gap-1">
                    <Check size={14} /> Complete
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {savingsGoals.length === 0 && (
          <div className="col-span-3 bg-elevated rounded-2xl p-8 border border-dashed border-default text-center">
            <Target className="w-10 h-10 text-muted mx-auto mb-3 opacity-50" />
            <p className="text-secondary text-sm">No savings goals yet</p>
          </div>
        )}
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowGoalForm(false)}>
          <div className="modal-content p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={() => setShowGoalForm(false)} className="text-muted hover:text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Goal Name <span style={{ color: 'var(--danger-500)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., New Car, Vacation"
                  minLength={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Target Amount <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="input"
                    placeholder="₹100,000"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGoalForm(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingGoal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDepositForm(null)}>
          <div className="modal-content p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Add Deposit</h2>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="input mb-4"
              placeholder="Amount"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowDepositForm(null)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={() => handleDeposit(showDepositForm)} className="btn btn-primary flex-1">
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, goal: null })}
        onConfirm={confirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deleteDialog.goal?.name}"? All progress will be lost.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default SavingsGoals;
