import React from 'react';
import { useApp } from '../../context/AppContext';
import { Menu, Bell, Search, Globe, User, LogOut, Settings } from 'lucide-react';
import { Menu as HeadlessMenu } from '@headlessui/react';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();

  const toggleLanguage = () => {
    const newLanguage = state.currentLanguage === 'ar' ? 'en' : 'ar';
    dispatch({ type: 'SET_LANGUAGE', payload: newLanguage });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={state.currentLanguage === 'ar' ? 'البحث...' : 'Search...'}
              className="pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96 text-right"
            />
          </div>
        </div>

        {/* Center - Company Info */}
        <div className="flex items-center space-x-3 space-x-reverse">
          {state.settings.company.logo && (
            <img 
              src={state.settings.company.logo} 
              alt="Company Logo" 
              className="h-8 w-8 object-contain rounded"
            />
          )}
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">
              {state.currentLanguage === 'ar' 
                ? state.settings.company.arabicName || state.settings.company.name
                : state.settings.company.englishName || state.settings.company.name
              }
            </h2>
            <p className="text-xs text-gray-500">
              {state.currentLanguage === 'ar' ? 'النظام المحاسبي' : 'Accounting System'}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Currency Display */}
          <div className="flex items-center space-x-2 space-x-reverse px-3 py-1 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-600">
              {state.settings.company.currency}
            </span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 space-x-reverse"
            title={state.currentLanguage === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          >
            <Globe className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">
              {state.currentLanguage === 'ar' ? 'EN' : 'ع'}
            </span>
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <HeadlessMenu as="div" className="relative">
            <HeadlessMenu.Button className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{state.user?.name}</p>
                <p className="text-xs text-gray-500">
                  {state.user?.role === 'admin' && (state.currentLanguage === 'ar' ? 'مدير النظام' : 'System Admin')}
                  {state.user?.role === 'accountant' && (state.currentLanguage === 'ar' ? 'محاسب' : 'Accountant')}
                  {state.user?.role === 'manager' && (state.currentLanguage === 'ar' ? 'مدير' : 'Manager')}
                  {state.user?.role === 'user' && (state.currentLanguage === 'ar' ? 'مستخدم' : 'User')}
                </p>
              </div>
            </HeadlessMenu.Button>

            <HeadlessMenu.Items className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <HeadlessMenu.Item>
                {({ active }) => (
                  <a
                    href="/profile"
                    className={`flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm ${
                      active ? 'bg-gray-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>{state.currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
                  </a>
                )}
              </HeadlessMenu.Item>
              <HeadlessMenu.Item>
                {({ active }) => (
                  <a
                    href="/settings"
                    className={`flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm ${
                      active ? 'bg-gray-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>{state.currentLanguage === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                  </a>
                )}
              </HeadlessMenu.Item>
              <hr className="my-1" />
              <HeadlessMenu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm w-full text-right ${
                      active ? 'bg-gray-50 text-red-700' : 'text-red-600'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{state.currentLanguage === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                  </button>
                )}
              </HeadlessMenu.Item>
            </HeadlessMenu.Items>
          </HeadlessMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;