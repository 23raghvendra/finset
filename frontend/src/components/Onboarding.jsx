import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Wallet,
  Target,
  PiggyBank,
  BarChart3,
  Lightbulb,
  Check,
  Sparkles
} from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to FinSet!',
    description: 'Your personal finance tracker to help you manage money smarter. Let\'s take a quick tour!',
    icon: Sparkles,
    image: null
  },
  {
    id: 'transactions',
    title: 'Track Your Transactions',
    description: 'Easily add income and expenses. Categorize them to understand where your money goes.',
    icon: Wallet,
    tip: 'Pro tip: Use the quick-add button to log transactions on the go!'
  },
  {
    id: 'budgets',
    title: 'Set Budgets',
    description: 'Create monthly budgets for different categories. Get alerts when you\'re close to your limit.',
    icon: PiggyBank,
    tip: 'Start with your biggest expense categories first.'
  },
  {
    id: 'goals',
    title: 'Achieve Your Goals',
    description: 'Set savings goals and track your progress. Whether it\'s an emergency fund or a vacation!',
    icon: Target,
    tip: 'Setting a deadline helps you stay motivated.'
  },
  {
    id: 'insights',
    title: 'Get Smart Insights',
    description: 'Our AI analyzes your spending patterns and gives you personalized recommendations.',
    icon: Lightbulb,
    tip: 'Check the Insights page weekly for new tips!'
  },
  {
    id: 'analytics',
    title: 'Visualize Your Finances',
    description: 'Beautiful charts and reports help you understand your financial health at a glance.',
    icon: BarChart3,
    tip: 'Export reports as PDF to share with your financial advisor.'
  }
];

const Onboarding = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsExiting(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem('onboardingCompleted', 'true');
      onComplete?.();
      onClose();
    }, 300);
  };

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem('onboardingCompleted', 'true');
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className={`w-full max-w-lg rounded-3xl overflow-hidden transition-all duration-300 ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ background: 'var(--card-bg)' }}
      >
        {/* Header */}
        <div className="relative h-48 flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-600) 0%, #6366f1 100%)' }}>
          {/* Decorative circles */}
          <div className="absolute w-64 h-64 rounded-full opacity-10" style={{ background: 'white', top: '-100px', right: '-50px' }} />
          <div className="absolute w-32 h-32 rounded-full opacity-10" style={{ background: 'white', bottom: '-20px', left: '20px' }} />
          
          {/* Icon */}
          <div 
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
          >
            <Icon size={48} color="white" />
          </div>

          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={20} color="white" />
          </button>

          {/* Step indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: index === currentStep ? 'white' : 'rgba(255,255,255,0.4)',
                  width: index === currentStep ? '24px' : '8px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {step.title}
          </h2>
          <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
            {step.description}
          </p>

          {step.tip && (
            <div 
              className="p-4 rounded-xl mb-6 flex items-start gap-3"
              style={{ background: 'var(--primary-100)' }}
            >
              <Lightbulb size={20} style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: '2px' }} />
              <p className="text-sm" style={{ color: 'var(--primary-600)' }}>{step.tip}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Skip tour
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 transition-colors"
                  style={{ 
                    background: 'var(--bg-secondary)', 
                    color: 'var(--text-secondary)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-1 transition-all"
                style={{ background: 'var(--primary-600)' }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <Check size={16} />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Setup Wizard Component
export const SetupWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    topExpenseCategories: [],
    savingsGoal: '',
    hasBudget: null
  });

  const categories = [
    'Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities',
    'Entertainment', 'Healthcare', 'Education', 'Travel'
  ];

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      topExpenseCategories: prev.topExpenseCategories.includes(category)
        ? prev.topExpenseCategories.filter(c => c !== category)
        : [...prev.topExpenseCategories, category].slice(0, 5)
    }));
  };

  const handleComplete = () => {
    localStorage.setItem('setupCompleted', 'true');
    localStorage.setItem('userSetupData', JSON.stringify(formData));
    onComplete?.(formData);
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    // Step 1: Monthly Income
    <div key="income" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          What's your monthly income?
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          This helps us set realistic budgets and savings goals.
        </p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium" style={{ color: 'var(--text-muted)' }}>₹</span>
          <input
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
            className="input pl-8 text-2xl font-bold"
            placeholder="50,000"
          />
        </div>
      </div>
    </div>,

    // Step 2: Top Categories
    <div key="categories" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          What do you spend most on?
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Select up to 5 categories. We'll help you track these.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className="p-3 rounded-xl text-sm font-medium text-left transition-all flex items-center justify-between"
              style={{
                background: formData.topExpenseCategories.includes(category) 
                  ? 'var(--primary-100)' 
                  : 'var(--bg-secondary)',
                color: formData.topExpenseCategories.includes(category)
                  ? 'var(--primary-600)'
                  : 'var(--text-secondary)',
                border: `2px solid ${formData.topExpenseCategories.includes(category) ? 'var(--primary-600)' : 'transparent'}`
              }}
            >
              {category}
              {formData.topExpenseCategories.includes(category) && (
                <Check size={16} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3: Savings Goal
    <div key="savings" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          What % do you want to save?
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Experts recommend saving at least 20% of your income.
        </p>
        <div className="flex gap-3">
          {[10, 20, 30, 40].map(pct => (
            <button
              key={pct}
              onClick={() => setFormData({ ...formData, savingsGoal: pct })}
              className="flex-1 py-4 rounded-xl text-center font-bold transition-all"
              style={{
                background: formData.savingsGoal === pct ? 'var(--primary-600)' : 'var(--bg-secondary)',
                color: formData.savingsGoal === pct ? 'white' : 'var(--text-secondary)'
              }}
            >
              {pct}%
            </button>
          ))}
        </div>
        {formData.monthlyIncome && formData.savingsGoal && (
          <p className="text-center mt-4" style={{ color: 'var(--text-muted)' }}>
            That's <span className="font-bold" style={{ color: 'var(--primary-600)' }}>
              ₹{(parseFloat(formData.monthlyIncome) * formData.savingsGoal / 100).toLocaleString('en-IN')}
            </span> per month
          </p>
        )}
      </div>
    </div>,

    // Step 4: Budget Experience
    <div key="budget" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Have you budgeted before?
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          This helps us customize your experience.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => setFormData({ ...formData, hasBudget: true })}
            className="w-full p-4 rounded-xl text-left transition-all"
            style={{
              background: formData.hasBudget === true ? 'var(--primary-100)' : 'var(--bg-secondary)',
              border: `2px solid ${formData.hasBudget === true ? 'var(--primary-600)' : 'transparent'}`
            }}
          >
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Yes, I'm a pro!</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>I've tracked expenses and set budgets before</p>
          </button>
          <button
            onClick={() => setFormData({ ...formData, hasBudget: false })}
            className="w-full p-4 rounded-xl text-left transition-all"
            style={{
              background: formData.hasBudget === false ? 'var(--primary-100)' : 'var(--bg-secondary)',
              border: `2px solid ${formData.hasBudget === false ? 'var(--primary-600)' : 'transparent'}`
            }}
          >
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>I'm new to this</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Guide me through setting up my first budget</p>
          </button>
        </div>
      </div>
    </div>
  ];

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)' }}
      >
        {/* Progress */}
        <div className="h-1 bg-[var(--bg-secondary)]">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${((step + 1) / steps.length) * 100}%`,
              background: 'var(--primary-600)'
            }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Step {step + 1} of {steps.length}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X size={18} />
            </button>
          </div>

          {steps[step]}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleComplete()}
              className="px-6 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--primary-600)' }}
            >
              {step < steps.length - 1 ? 'Continue' : 'Finish Setup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
