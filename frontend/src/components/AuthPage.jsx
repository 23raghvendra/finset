import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Wallet, TrendingUp, PiggyBank, BarChart3, Target, ArrowRight, Check } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        if (!agreeTerms) {
          setError('Please agree to the Terms & Privacy');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          setLoading(false);
          return;
        }
        await register({ name: formData.name, email: formData.email, password: formData.password });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const features = [
    { icon: Wallet, label: 'Manage your finances', desc: 'Track all accounts in one place' },
    { icon: TrendingUp, label: 'Track transactions', desc: 'Monitor every penny spent' },
    { icon: PiggyBank, label: 'Create budgets', desc: 'Set limits and stay on track' },
    { icon: BarChart3, label: 'View analytics', desc: 'Insights into your spending' },
    { icon: Target, label: 'Achieve goals', desc: 'Save for what matters most' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 sm:p-4">
      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative min-h-[500px] sm:min-h-[650px] flex">
        
        {/* Sliding Overlay Panel - Hidden on mobile */}
        <div 
          className={`hidden md:flex absolute top-0 w-1/2 h-full bg-gradient-to-br from-[#7664E4] via-[#8470FF] to-[#A498FF] z-20 transition-all duration-700 ease-in-out items-center justify-center ${
            isLogin ? 'left-1/2 rounded-l-[100px]' : 'left-0 rounded-r-[100px]'
          }`}
        >
          <div className={`text-white text-center px-12 transition-all duration-500 ${isLogin ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} style={{ display: isLogin ? 'block' : 'none' }}>
            <h2 className="text-4xl font-bold mb-4">New Here?</h2>
            <p className="text-white/80 mb-8 text-lg">
              Sign up and discover a great amount of new opportunities!
            </p>
            <button
              onClick={switchMode}
              className="px-10 py-3.5 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-[#8470FF] transition-all duration-300 flex items-center gap-2 mx-auto group"
            >
              Sign Up
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className={`text-white text-center px-12 transition-all duration-500 ${!isLogin ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ display: !isLogin ? 'block' : 'none' }}>
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-white/80 mb-8 text-lg">
              To keep connected with us please login with your personal info
            </p>
            <button
              onClick={switchMode}
              className="px-10 py-3.5 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-[#8470FF] transition-all duration-300 flex items-center gap-2 mx-auto group"
            >
              Sign In
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-20 h-20 border-2 border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 border-2 border-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
        </div>

        {/* Sign In Form Panel */}
        <div 
          className={`w-full md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col justify-center transition-all duration-700 ${
            isLogin ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-full pointer-events-none absolute'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#7664E4] to-[#8470FF] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white font-bold text-lg sm:text-xl">F</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">FinSet</span>
          </div>

          <div className="mb-5 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Sign In</h1>
            <p className="text-gray-500 text-sm sm:text-base">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="group">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8470FF] transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:border-[#8470FF] focus:ring-4 focus:ring-purple-100 outline-none transition-all text-base"
                  style={{ fontSize: '16px' }}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8470FF] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-12 py-3 sm:py-3.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:border-[#8470FF] focus:ring-4 focus:ring-purple-100 outline-none transition-all text-base"
                  style={{ fontSize: '16px' }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-[#8470FF] peer-checked:border-[#8470FF] transition-all flex items-center justify-center">
                    {keepLoggedIn && <Check size={14} className="text-white" />}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Keep me logged in</span>
              </label>
              <a href="#" className="text-xs sm:text-sm text-[#8470FF] hover:text-[#7664E4] font-medium transition-colors">
                Forgot Password?
              </a>
            </div>

            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#7664E4] to-[#8470FF] hover:from-[#6657C6] hover:to-[#7664E4] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Mobile Switch Link */}
          <div className="md:hidden mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-2">Don't have an account?</p>
            <button
              onClick={switchMode}
              className="text-[#8470FF] font-semibold text-sm hover:text-[#7664E4] transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Sign Up Form Panel */}
        <div 
          className={`w-full md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col justify-center transition-all duration-700 md:absolute md:right-0 ${
            !isLogin ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-full pointer-events-none absolute'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#7664E4] to-[#8470FF] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white font-bold text-lg sm:text-xl">F</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">FinSet</span>
          </div>

          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Create Account</h1>
            <p className="text-gray-500 text-sm sm:text-base">Start your financial journey today!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="group">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8470FF] transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:border-[#8470FF] focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                  style={{ fontSize: '16px' }}
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8470FF] transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:border-[#8470FF] focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                  style={{ fontSize: '16px' }}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password fields - stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="group">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8470FF] transition-colors pointer-events-none z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 sm:pl-12 pr-10 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:border-[#8470FF] focus:ring-4 focus:ring-purple-100 outline-none transition-all relative z-0"
                    style={{ fontSize: '16px' }}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8470FF] transition-colors pointer-events-none z-10" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 sm:pl-12 pr-10 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:border-[#8470FF] focus:ring-4 focus:ring-purple-100 outline-none transition-all relative z-0"
                    style={{ fontSize: '16px' }}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-[#8470FF] peer-checked:border-[#8470FF] transition-all flex items-center justify-center">
                  {agreeTerms && <Check size={14} className="text-white" />}
                </div>
              </div>
              <span className="text-xs sm:text-sm text-gray-600">
                I agree to the <a href="#" className="text-[#8470FF] hover:underline font-medium">Terms</a> and <a href="#" className="text-[#8470FF] hover:underline font-medium">Privacy Policy</a>
              </span>
            </label>

            {error && (
              <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#7664E4] to-[#8470FF] hover:from-[#6657C6] hover:to-[#7664E4] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 disabled:opacity-50 transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Mobile Switch Link */}
          <div className="md:hidden mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
            <button
              onClick={switchMode}
              className="text-[#8470FF] font-semibold text-sm hover:text-[#7664E4] transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Background Decorations - Smaller on mobile */}
      <div className="fixed top-20 left-10 sm:left-20 w-40 sm:w-72 h-40 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 sm:opacity-30 animate-blob"></div>
      <div className="fixed top-40 right-10 sm:right-20 w-40 sm:w-72 h-40 sm:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 sm:opacity-30 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-20 left-1/2 w-40 sm:w-72 h-40 sm:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 sm:opacity-30 animate-blob animation-delay-4000"></div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
