import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, Lock, Mail, Calculator, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sample users for demo
  const sampleUsers = [
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      permissions: ['all'],
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'فاطمة أحمد',
      email: 'accountant@company.com',
      password: 'accountant123',
      role: 'accountant',
      permissions: ['view_dashboard', 'manage_invoices', 'manage_expenses', 'view_reports'],
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'محمد علي',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager',
      permissions: ['view_dashboard', 'manage_projects', 'manage_employees', 'view_reports'],
      isActive: true,
      createdAt: '2024-02-01'
    },
    {
      id: '4',
      name: 'سارة خالد',
      email: 'user@company.com',
      password: 'user123',
      role: 'user',
      permissions: ['view_dashboard', 'view_reports'],
      isActive: true,
      createdAt: '2024-02-15'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user
      const user = sampleUsers.find(u => 
        u.email === formData.email && 
        u.password === formData.password &&
        u.isActive
      );

      if (user) {
        // Set user in context
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        toast.success(state.currentLanguage === 'ar' ? 
          `مرحباً ${user.name}` : 
          `Welcome ${user.name}`
        );
      } else {
        toast.error(state.currentLanguage === 'ar' ? 
          'بيانات الدخول غير صحيحة' : 
          'Invalid credentials'
        );
      }
    } catch (error) {
      toast.error(state.currentLanguage === 'ar' ? 
        'حدث خطأ أثناء تسجيل الدخول' : 
        'Login error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {state.currentLanguage === 'ar' ? 'النظام المحاسبي' : 'Accounting System'}
          </h1>
          <p className="text-gray-600">
            {state.currentLanguage === 'ar' ? 'تسجيل الدخول إلى حسابك' : 'Sign in to your account'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline ml-1" />
                {state.currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={state.currentLanguage === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline ml-1" />
                {state.currentLanguage === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={state.currentLanguage === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="rememberMe" className="mr-2 text-sm text-gray-600">
                  {state.currentLanguage === 'ar' ? 'تذكرني' : 'Remember me'}
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                {state.currentLanguage === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                state.currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {state.currentLanguage === 'ar' ? 'حسابات تجريبية:' : 'Demo Accounts:'}
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>
                <strong>{state.currentLanguage === 'ar' ? 'مدير النظام:' : 'Admin:'}</strong> admin@company.com / admin123
              </div>
              <div>
                <strong>{state.currentLanguage === 'ar' ? 'محاسب:' : 'Accountant:'}</strong> accountant@company.com / accountant123
              </div>
              <div>
                <strong>{state.currentLanguage === 'ar' ? 'مدير:' : 'Manager:'}</strong> manager@company.com / manager123
              </div>
              <div>
                <strong>{state.currentLanguage === 'ar' ? 'مستخدم:' : 'User:'}</strong> user@company.com / user123
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 space-x-reverse text-gray-500">
            <Building className="w-4 h-4" />
            <span className="text-sm">
              {state.currentLanguage === 'ar' 
                ? state.settings.company.arabicName || state.settings.company.name
                : state.settings.company.englishName || state.settings.company.name
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;