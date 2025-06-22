import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './components/Auth/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import InvoiceList from './components/Invoices/InvoiceList';
import InvoiceForm from './components/Invoices/InvoiceForm';
import CustomerList from './components/Customers/CustomerList';
import SupplierList from './components/Suppliers/SupplierList';
import EmployeeList from './components/Employees/EmployeeList';
import ProjectList from './components/Projects/ProjectList';
import ExpenseList from './components/Expenses/ExpenseList';
import ExpenseForm from './components/Expenses/ExpenseForm';
import JournalEntryList from './components/JournalEntries/JournalEntryList';
import JournalEntryPage from './components/JournalEntries/JournalEntryPage';
import VoucherList from './components/Vouchers/VoucherList';
import ReceiptVoucherPage from './components/Vouchers/ReceiptVoucherPage';
import PaymentVoucherPage from './components/Vouchers/PaymentVoucherPage';
import CheckList from './components/Checks/CheckList';
import CheckPage from './components/Checks/CheckPage';
import TreasuryManagement from './components/Treasury/TreasuryManagement';
import FixedAssetList from './components/FixedAssets/FixedAssetList';
import InventoryList from './components/Inventory/InventoryList';
import ReportsDashboard from './components/Reports/ReportsDashboard';
import ChartOfAccounts from './components/Accounts/ChartOfAccounts';
import SettingsPage from './components/Settings/SettingsPage';
import UserList from './components/Users/UserList';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { 
  sampleUser, 
  sampleCompany, 
  sampleAccounts, 
  sampleCustomers, 
  sampleSuppliers, 
  sampleEmployees, 
  sampleProjects, 
  sampleInvoices, 
  sampleExpenses 
} from './utils/sampleData';

const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Initialize with sample data only once
    if (state.accounts.length === 0) {
      dispatch({ type: 'SET_COMPANY', payload: sampleCompany });
      dispatch({ type: 'SET_ACCOUNTS', payload: sampleAccounts });
      dispatch({ type: 'SET_CUSTOMERS', payload: sampleCustomers });
      dispatch({ type: 'SET_SUPPLIERS', payload: sampleSuppliers });
      dispatch({ type: 'SET_EMPLOYEES', payload: sampleEmployees });
      dispatch({ type: 'SET_PROJECTS', payload: sampleProjects });
      dispatch({ type: 'SET_INVOICES', payload: sampleInvoices });
      dispatch({ type: 'SET_EXPENSES', payload: sampleExpenses });

      // Initialize sample users
      const sampleUsers = [
        {
          id: '1',
          name: 'أحمد محمد',
          email: 'admin@company.com',
          role: 'admin' as const,
          permissions: ['all'],
          isActive: true,
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'فاطمة أحمد',
          email: 'accountant@company.com',
          role: 'accountant' as const,
          permissions: ['view_dashboard', 'manage_invoices', 'manage_expenses', 'view_reports'],
          isActive: true,
          createdAt: '2024-01-15'
        },
        {
          id: '3',
          name: 'محمد علي',
          email: 'manager@company.com',
          role: 'manager' as const,
          permissions: ['view_dashboard', 'manage_projects', 'manage_employees', 'view_reports'],
          isActive: true,
          createdAt: '2024-02-01'
        },
        {
          id: '4',
          name: 'سارة خالد',
          email: 'user@company.com',
          role: 'user' as const,
          permissions: ['view_dashboard', 'view_reports'],
          isActive: true,
          createdAt: '2024-02-15'
        }
      ];
      dispatch({ type: 'SET_USERS', payload: sampleUsers });
    }
  }, [dispatch, state.accounts.length]);

  // تطبيق إعدادات الواجهة
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    // تطبيق اتجاه النص
    htmlElement.dir = state.settings.ui.direction;
    htmlElement.lang = state.settings.ui.language;
    
    // تطبيق اللون الأساسي
    htmlElement.style.setProperty('--primary-color', state.settings.ui.primaryColor);
    
    // تطبيق حجم الخط
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    htmlElement.style.setProperty('--base-font-size', fontSizeMap[state.settings.ui.fontSize as keyof typeof fontSizeMap]);
    
    // تطبيق المظهر
    if (state.settings.ui.theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [state.settings.ui]);

  // If not authenticated, show login page
  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Router>
      <div className={`min-h-screen bg-gray-50 ${state.currentLanguage === 'ar' ? 'rtl' : 'ltr'}`} dir={state.currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute permission="view_dashboard">
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/invoices" 
                  element={
                    <ProtectedRoute permission="manage_invoices">
                      <InvoiceList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/invoices/new" 
                  element={
                    <ProtectedRoute permission="manage_invoices">
                      <InvoiceForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/invoices/:id" 
                  element={
                    <ProtectedRoute permission="manage_invoices">
                      <InvoiceForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/expenses" 
                  element={
                    <ProtectedRoute permission="manage_expenses">
                      <ExpenseList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/expenses/new" 
                  element={
                    <ProtectedRoute permission="manage_expenses">
                      <ExpenseForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/expenses/:id" 
                  element={
                    <ProtectedRoute permission="manage_expenses">
                      <ExpenseForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/customers" 
                  element={
                    <ProtectedRoute permission="manage_customers">
                      <CustomerList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/suppliers" 
                  element={
                    <ProtectedRoute permission="manage_suppliers">
                      <SupplierList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employees" 
                  element={
                    <ProtectedRoute permission="manage_employees">
                      <EmployeeList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects" 
                  element={
                    <ProtectedRoute permission="manage_projects">
                      <ProjectList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/journal-entries" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <JournalEntryList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/journal-entries/new" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <JournalEntryPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/journal-entries/:id" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <JournalEntryPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vouchers" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <VoucherList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vouchers/receipt/new" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <ReceiptVoucherPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vouchers/receipt/:id" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <ReceiptVoucherPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vouchers/payment/new" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <PaymentVoucherPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vouchers/payment/:id" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <PaymentVoucherPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checks" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <CheckList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checks/new" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <CheckPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checks/:id" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <CheckPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/treasury" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <TreasuryManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/inventory" 
                  element={
                    <ProtectedRoute permission="manage_inventory">
                      <InventoryList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fixed-assets" 
                  element={
                    <ProtectedRoute permission="manage_assets">
                      <FixedAssetList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute permission="view_reports">
                      <ReportsDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/accounts" 
                  element={
                    <ProtectedRoute permission="manage_accounts">
                      <ChartOfAccounts />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute permission="manage_users">
                      <UserList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute permission="manage_settings">
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster 
          position={state.currentLanguage === 'ar' ? 'top-right' : 'top-left'} 
          toastOptions={{
            duration: 4000,
            style: {
              direction: state.currentLanguage === 'ar' ? 'rtl' : 'ltr',
              fontFamily: state.currentLanguage === 'ar' ? 'Tajawal, Cairo, sans-serif' : 'Inter, sans-serif'
            }
          }}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;