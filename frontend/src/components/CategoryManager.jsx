import React, { useState } from 'react';
import { Plus, X, Tag, Trash2 } from 'lucide-react';
import { getCategories, saveCategories, getDefaultCategories } from '../utils/storage';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

const CATEGORY_COLORS = [
  '#8470FF', '#10B981', '#F59E0B', '#EF4444', '#6366F1', 
  '#EC4899', '#14B8A6', '#8B5CF6', '#F97316', '#06B6D4'
];

const CategoryManager = ({ onCategoriesChange }) => {
  const [categories, setCategories] = useState(() => getCategories());
  const [newCategory, setNewCategory] = useState('');
  const [activeType, setActiveType] = useState('expense');
  const [deleteDialog, setDeleteDialog] = useState({ show: false, type: '', name: '' });
  const defaultCategories = getDefaultCategories();

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (categories[activeType].includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }

    const updatedCategories = {
      ...categories,
      [activeType]: [...categories[activeType], newCategory.trim()]
    };

    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setNewCategory('');
    onCategoriesChange?.(updatedCategories);
    toast.success('Category added!');
  };

  const handleDeleteCategory = () => {
    const { type, name } = deleteDialog;
    
    // Check if it's a default category
    if (defaultCategories[type].includes(name)) {
      toast.error("Can't delete default categories");
      setDeleteDialog({ show: false, type: '', name: '' });
      return;
    }

    const updatedCategories = {
      ...categories,
      [type]: categories[type].filter(c => c !== name)
    };

    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    setDeleteDialog({ show: false, type: '', name: '' });
    toast.success('Category deleted');
  };

  const isCustomCategory = (type, name) => {
    return !defaultCategories[type].includes(name);
  };

  return (
    <div className="space-y-6">
      {/* Type Tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
        <button
          onClick={() => setActiveType('expense')}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
          style={{
            background: activeType === 'expense' ? 'var(--card-bg)' : 'transparent',
            color: activeType === 'expense' ? 'var(--danger-500)' : 'var(--text-secondary)',
            boxShadow: activeType === 'expense' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Expense Categories
        </button>
        <button
          onClick={() => setActiveType('income')}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
          style={{
            background: activeType === 'income' ? 'var(--card-bg)' : 'transparent',
            color: activeType === 'income' ? 'var(--success-800)' : 'var(--text-secondary)',
            boxShadow: activeType === 'income' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Income Categories
        </button>
      </div>

      {/* Add New Category */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name..."
          className="input flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
        />
        <button
          onClick={handleAddCategory}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-2 gap-2">
        {categories[activeType].map((category, index) => {
          const isCustom = isCustomCategory(activeType, category);
          return (
            <div
              key={category}
              className="flex items-center justify-between p-3 rounded-xl group"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {category}
                </span>
                {isCustom && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}
                  >
                    Custom
                  </span>
                )}
              </div>
              {isCustom && (
                <button
                  onClick={() => setDeleteDialog({ show: true, type: activeType, name: category })}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
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
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Default categories cannot be deleted. Custom categories are marked with a badge.
      </p>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, type: '', name: '' })}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteDialog.name}"? Transactions using this category won't be affected.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CategoryManager;
