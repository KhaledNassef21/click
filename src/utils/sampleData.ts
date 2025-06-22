import { User, Company, Account, Customer, Supplier, Employee, Invoice, Expense, Project } from '../types';

export const sampleUser: User = {
  id: '1',
  name: 'أحمد محمد',
  email: 'ahmed@company.com',
  role: 'admin',
  permissions: ['all'],
  isActive: true,
  createdAt: '2024-01-01'
};

export const sampleCompany: Company = {
  id: '1',
  name: 'شركة النجاح للمقاولات',
  arabicName: 'شركة النجاح للمقاولات',
  address: 'الرياض، المملكة العربية السعودية',
  phone: '+966-11-123-4567',
  email: 'info@najah-contracting.com',
  taxNumber: '300123456700003',
  currency: 'SAR',
  fiscalYearStart: '01-01',
  country: 'Saudi Arabia',
  city: 'Riyadh'
};

export const sampleAccounts: Account[] = [
  {
    id: '1',
    code: '1000',
    name: 'النقدية',
    arabicName: 'النقدية',
    type: 'asset',
    balance: 50000,
    isActive: true,
    level: 1,
    hasChildren: false
  },
  {
    id: '2',
    code: '1100',
    name: 'البنك الأهلي',
    arabicName: 'البنك الأهلي',
    type: 'asset',
    balance: 125000,
    isActive: true,
    level: 1,
    hasChildren: false
  },
  {
    id: '3',
    code: '1200',
    name: 'العملاء',
    arabicName: 'العملاء',
    type: 'asset',
    balance: 75000,
    isActive: true,
    level: 1,
    hasChildren: false
  },
  {
    id: '4',
    code: '2000',
    name: 'الموردون',
    arabicName: 'الموردون',
    type: 'liability',
    balance: 35000,
    isActive: true,
    level: 1,
    hasChildren: false
  },
  {
    id: '5',
    code: '4000',
    name: 'إيرادات المشاريع',
    arabicName: 'إيرادات المشاريع',
    type: 'revenue',
    balance: 200000,
    isActive: true,
    level: 1,
    hasChildren: false
  },
  {
    id: '6',
    code: '5000',
    name: 'مصروفات المشاريع',
    arabicName: 'مصروفات المشاريع',
    type: 'expense',
    balance: 120000,
    isActive: true,
    level: 1,
    hasChildren: false
  }
];

export const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'مؤسسة البناء الحديث',
    arabicName: 'مؤسسة البناء الحديث',
    email: 'info@modernbuild.com',
    phone: '+966-11-234-5678',
    address: 'الرياض، حي العليا',
    taxNumber: '300234567800003',
    balance: 25000,
    creditLimit: 100000,
    paymentTerms: 30,
    contactPerson: 'محمد أحمد',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'شركة التطوير العقاري',
    arabicName: 'شركة التطوير العقاري',
    email: 'contact@realestate-dev.com',
    phone: '+966-11-345-6789',
    address: 'جدة، حي الحمراء',
    balance: 50000,
    creditLimit: 200000,
    paymentTerms: 45,
    contactPerson: 'فاطمة سالم',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'شركة الإنشاءات المتقدمة',
    arabicName: 'شركة الإنشاءات المتقدمة',
    email: 'info@advanced-construction.com',
    phone: '+966-11-456-7890',
    address: 'الدمام، حي الشاطئ',
    balance: 15000,
    creditLimit: 150000,
    paymentTerms: 30,
    contactPerson: 'عبدالله خالد',
    isActive: true,
    createdAt: '2024-02-01'
  }
];

export const sampleSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'مصنع الخرسانة المتقدم',
    arabicName: 'مصنع الخرسانة المتقدم',
    email: 'sales@concrete-factory.com',
    phone: '+966-11-456-7890',
    address: 'الرياض، المنطقة الصناعية',
    taxNumber: '300345678900003',
    balance: 15000,
    paymentTerms: 30,
    contactPerson: 'سالم محمد',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'شركة الحديد والصلب',
    arabicName: 'شركة الحديد والصلب',
    email: 'orders@steel-company.com',
    phone: '+966-11-567-8901',
    address: 'الدمام، المنطقة الصناعية الثانية',
    balance: 20000,
    paymentTerms: 45,
    contactPerson: 'أحمد علي',
    isActive: true,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'مؤسسة المواد الكهربائية',
    arabicName: 'مؤسسة المواد الكهربائية',
    email: 'info@electrical-supplies.com',
    phone: '+966-11-678-9012',
    address: 'جدة، حي الصناعية',
    balance: 8000,
    paymentTerms: 15,
    contactPerson: 'خالد عبدالرحمن',
    isActive: true,
    createdAt: '2024-01-20'
  }
];

export const sampleEmployees: Employee[] = [
  {
    id: '1',
    name: 'محمد عبدالله',
    arabicName: 'محمد عبدالله',
    email: 'mohammed@company.com',
    phone: '+966-50-123-4567',
    address: 'الرياض، حي الملز',
    position: 'مهندس مشاريع',
    department: 'الهندسة',
    salary: 12000,
    hireDate: '2023-01-15',
    isActive: true,
    bankAccount: '1234567890',
    nationalId: '1234567890',
    emergencyContact: '+966-50-987-6543'
  },
  {
    id: '2',
    name: 'فاطمة أحمد',
    arabicName: 'فاطمة أحمد',
    email: 'fatima@company.com',
    phone: '+966-50-234-5678',
    address: 'الرياض، حي النرجس',
    position: 'محاسبة',
    department: 'المالية',
    salary: 8000,
    hireDate: '2023-03-01',
    isActive: true,
    bankAccount: '0987654321',
    nationalId: '0987654321',
    emergencyContact: '+966-50-876-5432'
  },
  {
    id: '3',
    name: 'عبدالرحمن سالم',
    arabicName: 'عبدالرحمن سالم',
    email: 'abdulrahman@company.com',
    phone: '+966-50-345-6789',
    address: 'الرياض، حي الورود',
    position: 'مشرف موقع',
    department: 'العمليات',
    salary: 9000,
    hireDate: '2023-02-15',
    isActive: true,
    bankAccount: '1122334455',
    nationalId: '1122334455',
    emergencyContact: '+966-50-765-4321'
  }
];

export const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'مشروع مجمع الأعمال التجاري',
    arabicName: 'مشروع مجمع الأعمال التجاري',
    description: 'إنشاء مجمع تجاري بمساحة 5000 متر مربع',
    customerId: '1',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    budget: 2000000,
    status: 'active',
    expenses: 750000,
    revenue: 1200000,
    progress: 60,
    manager: 'محمد عبدالله',
    location: 'الرياض، حي العليا',
    costCenter: 'CC001'
  },
  {
    id: '2',
    name: 'مشروع فيلا سكنية',
    arabicName: 'مشروع فيلا سكنية',
    description: 'بناء فيلا سكنية فاخرة',
    customerId: '2',
    startDate: '2024-02-15',
    endDate: '2024-08-15',
    budget: 800000,
    status: 'active',
    expenses: 300000,
    revenue: 500000,
    progress: 40,
    manager: 'عبدالرحمن سالم',
    location: 'جدة، حي الحمراء',
    costCenter: 'CC002'
  },
  {
    id: '3',
    name: 'مشروع مدرسة ابتدائية',
    arabicName: 'مشروع مدرسة ابتدائية',
    description: 'إنشاء مدرسة ابتدائية بـ 20 فصل دراسي',
    customerId: '3',
    startDate: '2024-03-01',
    endDate: '2024-11-30',
    budget: 1500000,
    status: 'active',
    expenses: 450000,
    revenue: 750000,
    progress: 30,
    manager: 'محمد عبدالله',
    location: 'الدمام، حي الشاطئ',
    costCenter: 'CC003'
  }
];

export const sampleInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    projectId: '1',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    items: [
      {
        id: '1',
        description: 'أعمال الحفر والردم',
        quantity: 1,
        unitPrice: 50000,
        taxRate: 15,
        total: 57500,
        accountId: '5'
      }
    ],
    subtotal: 50000,
    taxAmount: 7500,
    discount: 0,
    discountType: 'fixed',
    total: 57500,
    status: 'sent',
    notes: 'دفعة أولى لمشروع المجمع التجاري',
    currency: 'SAR',
    taxes: [
      {
        id: '1',
        name: 'ضريبة القيمة المضافة',
        rate: 15,
        amount: 7500
      }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerId: '2',
    projectId: '2',
    date: '2024-02-20',
    dueDate: '2024-03-20',
    items: [
      {
        id: '2',
        description: 'أعمال الخرسانة المسلحة',
        quantity: 1,
        unitPrice: 80000,
        taxRate: 15,
        total: 92000,
        accountId: '5'
      }
    ],
    subtotal: 80000,
    taxAmount: 12000,
    discount: 0,
    discountType: 'fixed',
    total: 92000,
    status: 'paid',
    notes: 'دفعة ثانية لمشروع الفيلا السكنية',
    currency: 'SAR',
    taxes: [
      {
        id: '1',
        name: 'ضريبة القيمة المضافة',
        rate: 15,
        amount: 12000
      }
    ]
  }
];

export const sampleExpenses: Expense[] = [
  {
    id: '1',
    date: '2024-01-10',
    description: 'شراء مواد بناء',
    amount: 25000,
    category: 'مواد البناء',
    supplierId: '1',
    projectId: '1',
    accountId: '6',
    status: 'approved',
    paymentMethod: 'bank',
    reference: 'PO-001',
    currency: 'SAR'
  },
  {
    id: '2',
    date: '2024-01-12',
    description: 'وقود المعدات',
    amount: 3500,
    category: 'وقود',
    projectId: '1',
    accountId: '6',
    status: 'approved',
    paymentMethod: 'cash',
    reference: 'FUEL-001',
    currency: 'SAR'
  },
  {
    id: '3',
    date: '2024-01-15',
    description: 'أجور العمالة',
    amount: 15000,
    category: 'أجور',
    projectId: '2',
    accountId: '6',
    status: 'approved',
    paymentMethod: 'bank',
    reference: 'LABOR-001',
    currency: 'SAR'
  },
  {
    id: '4',
    date: '2024-01-18',
    description: 'صيانة المعدات',
    amount: 5000,
    category: 'صيانة',
    supplierId: '2',
    projectId: '1',
    accountId: '6',
    status: 'pending',
    paymentMethod: 'check',
    reference: 'MAINT-001',
    currency: 'SAR'
  },
  {
    id: '5',
    date: '2024-01-20',
    description: 'مواد كهربائية',
    amount: 8000,
    category: 'مواد كهربائية',
    supplierId: '3',
    projectId: '3',
    accountId: '6',
    status: 'approved',
    paymentMethod: 'bank',
    reference: 'ELEC-001',
    currency: 'SAR'
  }
];