import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Receipt, 
  CreditCard, 
  Building2,
  UserCheck,
  Package,
  Calculator,
  BarChart3,
  Settings,
  Briefcase,
  Truck,
  PiggyBank,
  FileBarChart,
  Banknote,
  ShoppingCart,
  TrendingUp,
  FolderOpen,
  UserCircle,
  Menu,
  X,
  Shield
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { state, dispatch, hasPermission } = useApp();

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: state.currentLanguage === 'ar' ? 'لوحة التحكم' : 'Dashboard', 
      path: '/dashboard',
      permission: 'view_dashboard'
    },
    { 
      icon: FileText, 
      label: state.currentLanguage === 'ar' ? 'الفواتير' : 'Invoices', 
      path: '/invoices',
      permission: 'manage_invoices'
    },
    { 
      icon: Receipt, 
      label: state.currentLanguage === 'ar' ? 'المصروفات' : 'Expenses', 
      path: '/expenses',
      permission: 'manage_expenses'
    },
    { 
      icon: Users, 
      label: state.currentLanguage === 'ar' ? 'العملاء' : 'Customers', 
      path: '/customers',
      permission: 'manage_customers'
    },
    { 
      icon: Truck, 
      label: state.currentLanguage === 'ar' ? 'الموردين' : 'Suppliers', 
      path: '/suppliers',
      permission: 'manage_suppliers'
    },
    { 
      icon: UserCheck, 
      label: state.currentLanguage === 'ar' ? 'الموظفين' : 'Employees', 
      path: '/employees',
      permission: 'manage_employees'
    },
    { 
      icon: Briefcase, 
      label: state.currentLanguage === 'ar' ? 'المشاريع' : 'Projects', 
      path: '/projects',
      permission: 'manage_projects'
    },
    { 
      icon: Calculator, 
      label: state.currentLanguage === 'ar' ? 'القيود اليومية' : 'Journal Entries', 
      path: '/journal-entries',
      permission: 'manage_accounts'
    },
    { 
      icon: Banknote, 
      label: state.currentLanguage === 'ar' ? 'سندات القبض والصرف' : 'Vouchers', 
      path: '/vouchers',
      permission: 'manage_accounts'
    },
    { 
      icon: CreditCard, 
      label: state.currentLanguage === 'ar' ? 'الشيكات' : 'Checks', 
      path: '/checks',
      permission: 'manage_accounts'
    },
    { 
      icon: PiggyBank, 
      label: state.currentLanguage === 'ar' ? 'الخزينة والبنك' : 'Treasury & Bank', 
      path: '/treasury',
      permission: 'manage_accounts'
    },
    { 
      icon: Package, 
      label: state.currentLanguage === 'ar' ? 'المخزون' : 'Inventory', 
      path: '/inventory',
      permission: 'manage_inventory'
    },
    { 
      icon: Building2, 
      label: state.currentLanguage === 'ar' ? 'الأصول الثابتة' : 'Fixed Assets', 
      path: '/fixed-assets',
      permission: 'manage_assets'
    },
    { 
      icon: BarChart3, 
      label: state.currentLanguage === 'ar' ? 'التقارير' : 'Reports', 
      path: '/reports',
      permission: 'view_reports'
    },
    { 
      icon: FileBarChart, 
      label: state.currentLanguage === 'ar' ? 'دليل الحسابات' : 'Chart of Accounts', 
      path: '/accounts',
      permission: 'manage_accounts'
    },
    { 
      icon: Shield, 
      label: state.currentLanguage === 'ar' ? 'المستخدمين والصلاحيات' : 'Users & Permissions', 
      path: '/users',
      permission: 'manage_users'
    },
    { 
      icon: Settings, 
      label: state.currentLanguage === 'ar' ? 'الإعدادات' : 'Settings', 
      path: '/settings',
      permission: 'manage_settings'
    }
  ];

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <>
      {/* Mobile backdrop */}
      {state.sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg z-50 transition-transform duration-300 ease-in-out
        ${state.sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        w-64 lg:translate-x-0 lg:static lg:z-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {state.currentLanguage === 'ar' ? 'النظام المحاسبي' : 'Accounting System'}
              </h1>
              <p className="text-sm text-gray-500">
                {state.currentLanguage === 'ar' ? 'الإدارة المالية' : 'Financial Management'}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{state.user?.name}</p>
              <p className="text-xs text-gray-500">
                {state.user?.role === 'admin' && (state.currentLanguage === 'ar' ? 'مدير النظام' : 'System Admin')}
                {state.user?.role === 'accountant' && (state.currentLanguage === 'ar' ? 'محاسب' : 'Accountant')}
                {state.user?.role === 'manager' && (state.currentLanguage === 'ar' ? 'مدير' : 'Manager')}
                {state.user?.role === 'user' && (state.currentLanguage === 'ar' ? 'مستخدم' : 'User')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20">
          {filteredMenuItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;