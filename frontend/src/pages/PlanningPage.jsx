import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { formatINR } from '../utils/storage';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  X,
  PiggyBank,
  CreditCard,
  Home,
  Car,
  Briefcase,
  Target,
  Calculator,
  Shield,
  ChevronRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const COLORS = ['#8470FF', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

const ASSET_ICONS = {
  'Savings': PiggyBank,
  'Investments': TrendingUp,
  'Property': Home,
  'Vehicle': Car,
  'Other': Wallet
};

const LIABILITY_ICONS = {
  'Credit Card': CreditCard,
  'Home Loan': Home,
  'Car Loan': Car,
  'Personal Loan': Briefcase,
  'Other': Wallet
};

const PlanningPage = ({ user, totals }) => {
  const [activeTab, setActiveTab] = useState('networth');
  
  // Net Worth State
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ show: false, type: null, id: null });

  // Debt Calculator State
  const [debtStrategy, setDebtStrategy] = useState('avalanche');
  const [extraPayment, setExtraPayment] = useState(5000);

  // Emergency Fund State
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [emergencyFundTarget, setEmergencyFundTarget] = useState(6);
  const [currentEmergencyFund, setCurrentEmergencyFund] = useState(0);

  // Retirement State
  const [retirementAge, setRetirementAge] = useState(60);
  const [currentAge, setCurrentAge] = useState(25);
  const [monthlyRetirementExpense, setMonthlyRetirementExpense] = useState(0);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [currentRetirementSavings, setCurrentRetirementSavings] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    value: '',
    interestRate: '',
    minPayment: ''
  });

  // Calculations
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetsByType = useMemo(() => {
    const grouped = {};
    assets.forEach(a => {
      grouped[a.type] = (grouped[a.type] || 0) + a.value;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [assets]);

  // Debt payoff calculation
  const debtPayoffPlan = useMemo(() => {
    if (liabilities.length === 0) return { months: 0, totalInterest: 0, schedule: [] };

    let debts = liabilities.map(l => ({
      ...l,
      balance: l.value,
      minPayment: l.minPayment || l.value * 0.02
    }));

    // Sort by strategy
    if (debtStrategy === 'avalanche') {
      debts.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      debts.sort((a, b) => a.balance - b.balance);
    }

    let months = 0;
    let totalInterest = 0;
    const schedule = [];
    let totalDebt = debts.reduce((s, d) => s + d.balance, 0);

    while (totalDebt > 0 && months < 360) {
      months++;
      let availableExtra = extraPayment;

      debts.forEach(debt => {
        if (debt.balance <= 0) return;

        const monthlyInterest = (debt.balance * debt.interestRate) / 100 / 12;
        totalInterest += monthlyInterest;
        debt.balance += monthlyInterest;

        let payment = debt.minPayment;
        if (availableExtra > 0 && debts.filter(d => d.balance > 0)[0].id === debt.id) {
          payment += availableExtra;
          availableExtra = 0;
        }

        debt.balance = Math.max(0, debt.balance - payment);
      });

      totalDebt = debts.reduce((s, d) => s + d.balance, 0);
      
      if (months % 6 === 0 || totalDebt === 0) {
        schedule.push({ month: months, remaining: totalDebt });
      }
    }

    return { months, totalInterest, schedule };
  }, [liabilities, debtStrategy, extraPayment]);

  // Emergency fund calculations
  const emergencyFundGoal = monthlyExpenses * emergencyFundTarget;
  const emergencyFundProgress = (currentEmergencyFund / emergencyFundGoal) * 100;
  const emergencyFundRemaining = emergencyFundGoal - currentEmergencyFund;

  // Retirement calculations
  const retirementCalc = useMemo(() => {
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = 85 - retirementAge;
    
    // Future value of monthly expenses accounting for inflation
    const futureMonthlyExpense = monthlyRetirementExpense * Math.pow(1 + inflation / 100, yearsToRetirement);
    const annualExpenseAtRetirement = futureMonthlyExpense * 12;
    
    // Corpus needed (simplified calculation)
    const realReturn = ((1 + expectedReturn / 100) / (1 + inflation / 100)) - 1;
    const corpusNeeded = annualExpenseAtRetirement * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);
    
    // Future value of current savings
    const futureSavings = currentRetirementSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement);
    
    // Monthly SIP needed
    const gap = corpusNeeded - futureSavings;
    const monthlyRate = expectedReturn / 100 / 12;
    const monthsToRetirement = yearsToRetirement * 12;
    const sipNeeded = gap > 0 ? (gap * monthlyRate) / (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) : 0;

    return {
      yearsToRetirement,
      corpusNeeded,
      futureSavings,
      gap: Math.max(0, gap),
      sipNeeded: Math.max(0, sipNeeded),
      futureMonthlyExpense
    };
  }, [retirementAge, currentAge, monthlyRetirementExpense, expectedReturn, inflation, currentRetirementSavings]);

  // Form handlers
  const handleAddAsset = () => {
    setEditingItem(null);
    setFormData({ name: '', type: 'Savings', value: '' });
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset) => {
    setEditingItem(asset);
    setFormData({ name: asset.name, type: asset.type, value: asset.value.toString() });
    setShowAssetModal(true);
  };

  const handleSaveAsset = () => {
    if (!formData.name || !formData.value) {
      toast.error('Please fill all fields');
      return;
    }

    if (editingItem) {
      setAssets(assets.map(a => a.id === editingItem.id ? { ...a, ...formData, value: parseFloat(formData.value) } : a));
      toast.success('Asset updated');
    } else {
      setAssets([...assets, { id: Date.now(), ...formData, value: parseFloat(formData.value) }]);
      toast.success('Asset added');
    }
    setShowAssetModal(false);
  };

  const handleAddLiability = () => {
    setEditingItem(null);
    setFormData({ name: '', type: 'Credit Card', value: '', interestRate: '', minPayment: '' });
    setShowLiabilityModal(true);
  };

  const handleEditLiability = (liability) => {
    setEditingItem(liability);
    setFormData({
      name: liability.name,
      type: liability.type,
      value: liability.value.toString(),
      interestRate: liability.interestRate?.toString() || '',
      minPayment: liability.minPayment?.toString() || ''
    });
    setShowLiabilityModal(true);
  };

  const handleSaveLiability = () => {
    if (!formData.name || !formData.value) {
      toast.error('Please fill required fields');
      return;
    }

    const newLiability = {
      ...formData,
      value: parseFloat(formData.value),
      interestRate: parseFloat(formData.interestRate) || 0,
      minPayment: parseFloat(formData.minPayment) || parseFloat(formData.value) * 0.02
    };

    if (editingItem) {
      setLiabilities(liabilities.map(l => l.id === editingItem.id ? { ...l, ...newLiability } : l));
      toast.success('Liability updated');
    } else {
      setLiabilities([...liabilities, { id: Date.now(), ...newLiability }]);
      toast.success('Liability added');
    }
    setShowLiabilityModal(false);
  };

  const handleDelete = () => {
    if (deleteDialog.type === 'asset') {
      setAssets(assets.filter(a => a.id !== deleteDialog.id));
    } else {
      setLiabilities(liabilities.filter(l => l.id !== deleteDialog.id));
    }
    setDeleteDialog({ show: false, type: null, id: null });
    toast.success('Item deleted');
  };

  const tabs = [
    { id: 'networth', label: 'Net Worth', icon: Wallet },
    { id: 'debt', label: 'Debt Payoff', icon: CreditCard },
    { id: 'emergency', label: 'Emergency Fund', icon: Shield },
    { id: 'retirement', label: 'Retirement', icon: Target },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <Header
        title="Financial Planning"
        subtitle="Plan your financial future"
        user={user}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--card-bg)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Net Worth Tab */}
      {activeTab === 'networth' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Assets</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--success-800)' }}>{formatINR(totalAssets)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Liabilities</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--danger-500)' }}>{formatINR(totalLiabilities)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Net Worth</p>
              <p className="text-3xl font-bold mt-1" style={{ color: netWorth >= 0 ? 'var(--primary-600)' : 'var(--danger-500)' }}>
                {formatINR(netWorth)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Assets */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Assets</h3>
                <button
                  onClick={handleAddAsset}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: 'var(--success-200)', color: 'var(--success-800)' }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {assets.map(asset => {
                  const Icon = ASSET_ICONS[asset.type] || Wallet;
                  return (
                    <div key={asset.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--success-200)' }}>
                          <Icon size={18} style={{ color: 'var(--success-800)' }} />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{asset.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{asset.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: 'var(--success-800)' }}>{formatINR(asset.value)}</span>
                        <button onClick={() => handleEditAsset(asset)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteDialog({ show: true, type: 'asset', id: asset.id })} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {assets.length === 0 && (
                  <p className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>No assets added yet. Click + to add.</p>
                )}
              </div>
            </div>

            {/* Liabilities */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Liabilities</h3>
                <button
                  onClick={handleAddLiability}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: 'var(--danger-200)', color: 'var(--danger-500)' }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {liabilities.map(liability => {
                  const Icon = LIABILITY_ICONS[liability.type] || Wallet;
                  return (
                    <div key={liability.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--danger-200)' }}>
                          <Icon size={18} style={{ color: 'var(--danger-500)' }} />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{liability.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{liability.interestRate}% APR</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: 'var(--danger-500)' }}>{formatINR(liability.value)}</span>
                        <button onClick={() => handleEditLiability(liability)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteDialog({ show: true, type: 'liability', id: liability.id })} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {liabilities.length === 0 && (
                  <p className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>No liabilities - Great!</p>
                )}
              </div>
            </div>

            {/* Asset Allocation */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Asset Allocation</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                      stroke="none"
                    >
                      {assetsByType.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {assetsByType.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debt Payoff Tab */}
      {activeTab === 'debt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Debt</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--danger-500)' }}>{formatINR(totalLiabilities)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Payoff Time</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {debtPayoffPlan.months} <span className="text-lg font-normal">months</span>
              </p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Interest</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--warning-500)' }}>{formatINR(debtPayoffPlan.totalInterest)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Strategy Selection */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Payoff Strategy</h3>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setDebtStrategy('avalanche')}
                  className="w-full p-4 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: debtStrategy === 'avalanche' ? 'var(--primary-600)' : 'var(--border)',
                    background: debtStrategy === 'avalanche' ? 'var(--primary-100)' : 'var(--card-bg)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Avalanche Method</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Pay highest interest first - saves most money</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2" style={{ 
                      borderColor: debtStrategy === 'avalanche' ? 'var(--primary-600)' : 'var(--border)',
                      background: debtStrategy === 'avalanche' ? 'var(--primary-600)' : 'transparent'
                    }} />
                  </div>
                </button>

                <button
                  onClick={() => setDebtStrategy('snowball')}
                  className="w-full p-4 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: debtStrategy === 'snowball' ? 'var(--primary-600)' : 'var(--border)',
                    background: debtStrategy === 'snowball' ? 'var(--primary-100)' : 'var(--card-bg)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Snowball Method</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Pay smallest balance first - quick wins</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2" style={{ 
                      borderColor: debtStrategy === 'snowball' ? 'var(--primary-600)' : 'var(--border)',
                      background: debtStrategy === 'snowball' ? 'var(--primary-600)' : 'transparent'
                    }} />
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Extra Monthly Payment
                </label>
                <input
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
                  className="input"
                  placeholder="₹5,000"
                />
              </div>
            </div>

            {/* Payoff Chart */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Debt Reduction Timeline</h3>
              <div className="h-64">
                {debtPayoffPlan.schedule.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={debtPayoffPlan.schedule}>
                      <defs>
                        <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--danger-500)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--danger-500)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `${v}mo`} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }} formatter={(value) => [formatINR(value), 'Remaining']} />
                      <Area type="monotone" dataKey="remaining" stroke="var(--danger-500)" strokeWidth={2} fill="url(#colorDebt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p style={{ color: 'var(--text-muted)' }}>No debts to calculate</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Fund Tab */}
      {activeTab === 'emergency' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Current Fund</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--primary-600)' }}>{formatINR(currentEmergencyFund)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Target ({emergencyFundTarget} months)</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{formatINR(emergencyFundGoal)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Still Needed</p>
              <p className="text-3xl font-bold mt-1" style={{ color: emergencyFundRemaining > 0 ? 'var(--warning-500)' : 'var(--success-800)' }}>
                {formatINR(Math.max(0, emergencyFundRemaining))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Progress */}
            <div className="card p-5">
              <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Progress</h3>
              <div className="relative pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>0%</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--primary-600)' }}>{emergencyFundProgress.toFixed(1)}%</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>100%</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, emergencyFundProgress)}%`,
                      background: emergencyFundProgress >= 100 ? 'var(--success-800)' : 'var(--primary-600)'
                    }}
                  />
                </div>
                <div className="flex justify-between mt-4 text-center">
                  {[3, 6, 9, 12].map(months => (
                    <div key={months} className="flex-1">
                      <div 
                        className="w-3 h-3 rounded-full mx-auto mb-1"
                        style={{ 
                          background: currentEmergencyFund >= monthlyExpenses * months 
                            ? 'var(--success-800)' 
                            : 'var(--neutral-200)'
                        }}
                      />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{months}mo</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculator */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Calculator</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Monthly Expenses
                  </label>
                  <input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="₹50,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Target (months of expenses)
                  </label>
                  <div className="flex gap-2">
                    {[3, 6, 9, 12].map(m => (
                      <button
                        key={m}
                        onClick={() => setEmergencyFundTarget(m)}
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: emergencyFundTarget === m ? 'var(--primary-600)' : 'var(--bg-secondary)',
                          color: emergencyFundTarget === m ? 'white' : 'var(--text-secondary)'
                        }}
                      >
                        {m} mo
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Current Emergency Fund
                  </label>
                  <input
                    type="number"
                    value={currentEmergencyFund}
                    onChange={(e) => setCurrentEmergencyFund(parseFloat(e.target.value) || 0)}
                    className="input"
                    placeholder="₹100,000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retirement Tab */}
      {activeTab === 'retirement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Corpus Needed</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{formatINR(retirementCalc.corpusNeeded)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Future Value of Savings</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--success-800)' }}>{formatINR(retirementCalc.futureSavings)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gap to Fill</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--warning-500)' }}>{formatINR(retirementCalc.gap)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Monthly SIP Needed</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--primary-600)' }}>{formatINR(retirementCalc.sipNeeded)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Current Age</label>
                  <input type="number" value={currentAge} onChange={(e) => setCurrentAge(parseInt(e.target.value) || 0)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Retirement Age</label>
                  <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(parseInt(e.target.value) || 0)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Monthly Expense (Today)</label>
                  <input type="number" value={monthlyRetirementExpense} onChange={(e) => setMonthlyRetirementExpense(parseFloat(e.target.value) || 0)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Current Savings</label>
                  <input type="number" value={currentRetirementSavings} onChange={(e) => setCurrentRetirementSavings(parseFloat(e.target.value) || 0)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Expected Return (%)</label>
                  <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(parseFloat(e.target.value) || 0)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Inflation (%)</label>
                  <input type="number" value={inflation} onChange={(e) => setInflation(parseFloat(e.target.value) || 0)} className="input" />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Retirement Summary</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Years to retirement</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{retirementCalc.yearsToRetirement} years</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Monthly expense at retirement (inflation adjusted)</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatINR(retirementCalc.futureMonthlyExpense)}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--primary-100)' }}>
                  <p className="text-sm" style={{ color: 'var(--primary-600)' }}>Start investing this much monthly</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--primary-600)' }}>{formatINR(retirementCalc.sipNeeded)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={(e) => e.target === e.currentTarget && setShowAssetModal(false)}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: 'var(--card-bg)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editingItem ? 'Edit Asset' : 'Add Asset'}</h2>
                <button onClick={() => setShowAssetModal(false)} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="e.g., Savings Account" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input">
                  {Object.keys(ASSET_ICONS).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Value</label>
                <input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="input" placeholder="₹0" />
              </div>
            </div>
            <div className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
              <button onClick={() => setShowAssetModal(false)} className="flex-1 btn btn-secondary">Cancel</button>
              <button onClick={handleSaveAsset} className="flex-1 btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Liability Modal */}
      {showLiabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={(e) => e.target === e.currentTarget && setShowLiabilityModal(false)}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: 'var(--card-bg)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editingItem ? 'Edit Liability' : 'Add Liability'}</h2>
                <button onClick={() => setShowLiabilityModal(false)} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="e.g., Home Loan" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input">
                  {Object.keys(LIABILITY_ICONS).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Amount</label>
                  <input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="input" placeholder="₹0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Interest Rate (%)</label>
                  <input type="number" value={formData.interestRate} onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })} className="input" placeholder="12" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
              <button onClick={() => setShowLiabilityModal(false)} className="flex-1 btn btn-secondary">Cancel</button>
              <button onClick={handleSaveLiability} className="flex-1 btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, type: null, id: null })}
        onConfirm={handleDelete}
        title={`Delete ${deleteDialog.type === 'asset' ? 'Asset' : 'Liability'}`}
        message="Are you sure you want to delete this item?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default PlanningPage;
