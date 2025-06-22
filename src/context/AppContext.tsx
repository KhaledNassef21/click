import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, Company, Account, Customer, Supplier, Employee, Invoice, Expense, Project } from '../types';

interface AppSettings {
  // إعدادات الشركة
  company: {
    name: string;
    arabicName: string;
    englishName: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxNumber: string;
    commercialRegister: string;
    currency: string;
    country: string;
    city: string;
    postalCode: string;
    industry: string;
    description: string;
  };
  
  // إعدادات المحاسبة
  accounting: {
    fiscalYearStart: string;
    accountingMethod: string;
    baseCurrency: string;
    decimalPlaces: number;
    dateFormat: string;
    numberFormat: string;
    enableMultiCurrency: boolean;
    autoPostJournalEntries: boolean;
    requireApprovalForJournalEntries: boolean;
    enableCostCenters: boolean;
    enableProjects: boolean;
    defaultTaxRate: number;
  };
  
  // إعدادات الضرائب
  tax: {
    vatEnabled: boolean;
    vatRate: number;
    vatNumber: string;
    zakatEnabled: boolean;
    zakatRate: number;
    withholdingTaxEnabled: boolean;
    withholdingTaxRate: number;
    taxReportingPeriod: string;
    autoCalculateTax: boolean;
    includeTaxInPrice: boolean;
  };
  
  // إعدادات الفواتير
  invoice: {
    invoicePrefix: string;
    invoiceNumberFormat: string;
    autoGenerateNumbers: boolean;
    defaultPaymentTerms: number;
    defaultDueDate: number;
    showTaxBreakdown: boolean;
    allowPartialPayments: boolean;
    sendEmailReminders: boolean;
    reminderDays: number[];
    defaultNotes: string;
    defaultTerms: string;
  };
  
  // إعدادات المشاريع
  project: {
    enableProjectPhases: boolean;
    enableProjectBudgets: boolean;
    enableTimeTracking: boolean;
    enableExpenseTracking: boolean;
    defaultProjectStatus: string;
    requireProjectApproval: boolean;
    enableProjectReports: boolean;
    enableProjectNotifications: boolean;
    projectNumberFormat: string;
    enableProjectTemplates: boolean;
  };
  
  // إعدادات المخزون
  inventory: {
    inventoryMethod: string;
    enableLowStockAlerts: boolean;
    lowStockThreshold: number;
    enableBarcodes: boolean;
    enableSerialNumbers: boolean;
    enableBatchTracking: boolean;
    enableLocationTracking: boolean;
    autoUpdateCosts: boolean;
    enableInventoryReports: boolean;
    defaultUnit: string;
  };
  
  // إعدادات الموارد البشرية
  hr: {
    enablePayroll: boolean;
    payrollFrequency: string;
    enableAttendance: boolean;
    workingDaysPerWeek: number;
    workingHoursPerDay: number;
    overtimeRate: number;
    enableLeaveManagement: boolean;
    enablePerformanceReviews: boolean;
    enableTraining: boolean;
    defaultCurrency: string;
  };
  
  // إعدادات الأمان
  security: {
    passwordMinLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiry: number;
    maxLoginAttempts: number;
    sessionTimeout: number;
    enableTwoFactor: boolean;
    enableAuditLog: boolean;
    enableLoginNotifications: boolean;
    allowMultipleSessions: boolean;
  };
  
  // إعدادات البريد الإلكتروني
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    smtpEncryption: string;
    fromEmail: string;
    fromName: string;
    enableEmailNotifications: boolean;
    enableInvoiceEmails: boolean;
    enablePaymentReminders: boolean;
    enableSystemAlerts: boolean;
  };
  
  // إعدادات الطباعة
  print: {
    defaultPaperSize: string;
    defaultOrientation: string;
    includeCompanyLogo: boolean;
    includeWatermark: boolean;
    watermarkText: string;
    headerHeight: number;
    footerHeight: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    fontSize: number;
    fontFamily: string;
  };
  
  // إعدادات النظام
  system: {
    enableBackup: boolean;
    backupFrequency: string;
    backupRetention: number;
    enableMaintenance: boolean;
    maintenanceMessage: string;
    enableDebugMode: boolean;
    logLevel: string;
    enableCaching: boolean;
    cacheExpiry: number;
    enableCompression: boolean;
    maxFileSize: number;
  };
  
  // إعدادات الواجهة
  ui: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    language: string;
    direction: string;
    fontSize: string;
    enableAnimations: boolean;
    enableSounds: boolean;
    compactMode: boolean;
    showSidebar: boolean;
    sidebarCollapsed: boolean;
  };
}

interface AppState {
  user: User | null;
  company: Company | null;
  accounts: Account[];
  customers: Customer[];
  suppliers: Supplier[];
  employees: Employee[];
  invoices: Invoice[];
  expenses: Expense[];
  projects: Project[];
  users: User[];
  sidebarOpen: boolean;
  currentLanguage: 'ar' | 'en';
  settings: AppSettings;
  isAuthenticated: boolean;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_COMPANY'; payload: Company }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'SET_SUPPLIERS'; payload: Supplier[] }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LANGUAGE'; payload: 'ar' | 'en' }
  | { type: 'UPDATE_SETTINGS'; payload: { category: keyof AppSettings; settings: any } }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOGOUT' };

const defaultSettings: AppSettings = {
  company: {
    name: 'شركة النجاح للمقاولات',
    arabicName: 'شركة النجاح للمقاولات',
    englishName: 'Al-Najah Contracting Company',
    logo: '',
    address: 'الرياض، المملكة العربية السعودية',
    phone: '+966-11-123-4567',
    email: 'info@najah-contracting.com',
    website: 'www.najah-contracting.com',
    taxNumber: '300123456700003',
    commercialRegister: '1010123456',
    currency: 'SAR',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    postalCode: '11564',
    industry: 'Construction',
    description: 'شركة رائدة في مجال المقاولات والإنشاءات'
  },
  accounting: {
    fiscalYearStart: '01-01',
    accountingMethod: 'accrual',
    baseCurrency: 'SAR',
    decimalPlaces: 2,
    dateFormat: 'dd/mm/yyyy',
    numberFormat: 'arabic',
    enableMultiCurrency: false,
    autoPostJournalEntries: true,
    requireApprovalForJournalEntries: true,
    enableCostCenters: true,
    enableProjects: true,
    defaultTaxRate: 15
  },
  tax: {
    vatEnabled: true,
    vatRate: 15,
    vatNumber: '300123456700003',
    zakatEnabled: true,
    zakatRate: 2.5,
    withholdingTaxEnabled: true,
    withholdingTaxRate: 5,
    taxReportingPeriod: 'quarterly',
    autoCalculateTax: true,
    includeTaxInPrice: false
  },
  invoice: {
    invoicePrefix: 'INV',
    invoiceNumberFormat: 'INV-YYYY-####',
    autoGenerateNumbers: true,
    defaultPaymentTerms: 30,
    defaultDueDate: 30,
    showTaxBreakdown: true,
    allowPartialPayments: true,
    sendEmailReminders: true,
    reminderDays: [7, 3, 1],
    defaultNotes: 'شكراً لتعاملكم معنا',
    defaultTerms: 'الدفع خلال 30 يوم من تاريخ الفاتورة'
  },
  project: {
    enableProjectPhases: true,
    enableProjectBudgets: true,
    enableTimeTracking: true,
    enableExpenseTracking: true,
    defaultProjectStatus: 'planning',
    requireProjectApproval: true,
    enableProjectReports: true,
    enableProjectNotifications: true,
    projectNumberFormat: 'PRJ-YYYY-####',
    enableProjectTemplates: true
  },
  inventory: {
    inventoryMethod: 'fifo',
    enableLowStockAlerts: true,
    lowStockThreshold: 10,
    enableBarcodes: true,
    enableSerialNumbers: false,
    enableBatchTracking: false,
    enableLocationTracking: true,
    autoUpdateCosts: true,
    enableInventoryReports: true,
    defaultUnit: 'piece'
  },
  hr: {
    enablePayroll: true,
    payrollFrequency: 'monthly',
    enableAttendance: true,
    workingDaysPerWeek: 5,
    workingHoursPerDay: 8,
    overtimeRate: 1.5,
    enableLeaveManagement: true,
    enablePerformanceReviews: false,
    enableTraining: false,
    defaultCurrency: 'SAR'
  },
  security: {
    passwordMinLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    enableTwoFactor: false,
    enableAuditLog: true,
    enableLoginNotifications: true,
    allowMultipleSessions: false
  },
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: 'info@najah-contracting.com',
    fromName: 'شركة النجاح للمقاولات',
    enableEmailNotifications: true,
    enableInvoiceEmails: true,
    enablePaymentReminders: true,
    enableSystemAlerts: true
  },
  print: {
    defaultPaperSize: 'A4',
    defaultOrientation: 'portrait',
    includeCompanyLogo: true,
    includeWatermark: false,
    watermarkText: 'نسخة أصلية',
    headerHeight: 100,
    footerHeight: 50,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 12,
    fontFamily: 'Arial'
  },
  system: {
    enableBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    enableMaintenance: false,
    maintenanceMessage: 'النظام تحت الصيانة',
    enableDebugMode: false,
    logLevel: 'info',
    enableCaching: true,
    cacheExpiry: 3600,
    enableCompression: true,
    maxFileSize: 10
  },
  ui: {
    theme: 'light',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    language: 'ar',
    direction: 'rtl',
    fontSize: 'medium',
    enableAnimations: true,
    enableSounds: false,
    compactMode: false,
    showSidebar: true,
    sidebarCollapsed: false
  }
};

// Load initial state from localStorage
const loadInitialState = (): AppState => {
  try {
    // Load authentication state
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('currentUser');
    const savedSettings = localStorage.getItem('appSettings');
    
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      company: null,
      accounts: [],
      customers: [],
      suppliers: [],
      employees: [],
      invoices: [],
      expenses: [],
      projects: [],
      users: [],
      sidebarOpen: true,
      currentLanguage: 'ar',
      settings: savedSettings ? JSON.parse(savedSettings) : defaultSettings,
      isAuthenticated: savedAuth === 'true'
    };
  } catch (error) {
    console.error('Error loading initial state:', error);
    return {
      user: null,
      company: null,
      accounts: [],
      customers: [],
      suppliers: [],
      employees: [],
      invoices: [],
      expenses: [],
      projects: [],
      users: [],
      sidebarOpen: true,
      currentLanguage: 'ar',
      settings: defaultSettings,
      isAuthenticated: false
    };
  }
};

const initialState: AppState = loadInitialState();

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    case 'SET_COMPANY':
      return { ...state, company: action.payload };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'SET_SUPPLIERS':
      return { ...state, suppliers: action.payload };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_LANGUAGE':
      const newSettings = {
        ...state.settings,
        ui: {
          ...state.settings.ui,
          language: action.payload,
          direction: action.payload === 'ar' ? 'rtl' : 'ltr'
        }
      };
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return { 
        ...state, 
        currentLanguage: action.payload,
        settings: newSettings
      };
    case 'UPDATE_SETTINGS':
      const updatedSettings = {
        ...state.settings,
        [action.payload.category]: {
          ...state.settings[action.payload.category],
          ...action.payload.settings
        }
      };
      localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      return {
        ...state,
        settings: updatedSettings
      };
    case 'SET_SETTINGS':
      localStorage.setItem('appSettings', JSON.stringify(action.payload));
      return { ...state, settings: action.payload };
    case 'SET_AUTHENTICATED':
      localStorage.setItem('isAuthenticated', action.payload.toString());
      return { ...state, isAuthenticated: action.payload };
    case 'LOGOUT':
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false 
      };
    default:
      return state;
  }
};

// Permission checking utility
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user || !user.isActive) return false;
  if (user.permissions.includes('all')) return true;
  return user.permissions.includes(permission);
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  hasPermission: (permission: string) => boolean;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const checkPermission = (permission: string): boolean => {
    return hasPermission(state.user, permission);
  };

  // Auto-logout on session timeout
  useEffect(() => {
    if (state.isAuthenticated && state.settings.security.sessionTimeout > 0) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'LOGOUT' });
      }, state.settings.security.sessionTimeout * 60 * 1000); // Convert minutes to milliseconds

      return () => clearTimeout(timeout);
    }
  }, [state.isAuthenticated, state.settings.security.sessionTimeout]);

  return (
    <AppContext.Provider value={{ state, dispatch, hasPermission: checkPermission }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};