import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Building, 
  Calculator, 
  Receipt, 
  FileText, 
  Briefcase, 
  Package, 
  Users, 
  Shield, 
  Mail, 
  Printer, 
  Database, 
  Palette,
  Save,
  Upload,
  Download,
  Eye,
  EyeOff,
  Globe,
  Calendar,
  CreditCard,
  Percent,
  Clock,
  Bell,
  Lock,
  Key,
  Smartphone,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('company');
  const [showPassword, setShowPassword] = useState(false);

  // إعدادات الشركة
  const [companySettings, setCompanySettings] = useState(state.settings.company);

  // إعدادات المحاسبة
  const [accountingSettings, setAccountingSettings] = useState(state.settings.accounting);

  // إعدادات الضرائب
  const [taxSettings, setTaxSettings] = useState(state.settings.tax);

  // إعدادات الفواتير
  const [invoiceSettings, setInvoiceSettings] = useState(state.settings.invoice);

  // إعدادات المشاريع
  const [projectSettings, setProjectSettings] = useState(state.settings.project);

  // إعدادات المخزون
  const [inventorySettings, setInventorySettings] = useState(state.settings.inventory);

  // إعدادات الموارد البشرية
  const [hrSettings, setHrSettings] = useState(state.settings.hr);

  // إعدادات الأمان
  const [securitySettings, setSecuritySettings] = useState(state.settings.security);

  // إعدادات البريد الإلكتروني
  const [emailSettings, setEmailSettings] = useState(state.settings.email);

  // إعدادات الطباعة
  const [printSettings, setPrintSettings] = useState(state.settings.print);

  // إعدادات النظام
  const [systemSettings, setSystemSettings] = useState(state.settings.system);

  // إعدادات الواجهة
  const [uiSettings, setUiSettings] = useState(state.settings.ui);

  const settingsTabs = [
    { id: 'company', name: state.currentLanguage === 'ar' ? 'إعدادات الشركة' : 'Company Settings', icon: Building, color: 'text-blue-600' },
    { id: 'accounting', name: state.currentLanguage === 'ar' ? 'المحاسبة' : 'Accounting', icon: Calculator, color: 'text-green-600' },
    { id: 'tax', name: state.currentLanguage === 'ar' ? 'الضرائب' : 'Taxes', icon: Percent, color: 'text-purple-600' },
    { id: 'invoice', name: state.currentLanguage === 'ar' ? 'الفواتير' : 'Invoices', icon: Receipt, color: 'text-orange-600' },
    { id: 'project', name: state.currentLanguage === 'ar' ? 'المشاريع' : 'Projects', icon: Briefcase, color: 'text-indigo-600' },
    { id: 'inventory', name: state.currentLanguage === 'ar' ? 'المخزون' : 'Inventory', icon: Package, color: 'text-yellow-600' },
    { id: 'hr', name: state.currentLanguage === 'ar' ? 'الموارد البشرية' : 'Human Resources', icon: Users, color: 'text-pink-600' },
    { id: 'security', name: state.currentLanguage === 'ar' ? 'الأمان' : 'Security', icon: Shield, color: 'text-red-600' },
    { id: 'email', name: state.currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email', icon: Mail, color: 'text-cyan-600' },
    { id: 'print', name: state.currentLanguage === 'ar' ? 'الطباعة' : 'Printing', icon: Printer, color: 'text-gray-600' },
    { id: 'system', name: state.currentLanguage === 'ar' ? 'النظام' : 'System', icon: Database, color: 'text-emerald-600' },
    { id: 'ui', name: state.currentLanguage === 'ar' ? 'الواجهة' : 'Interface', icon: Palette, color: 'text-violet-600' }
  ];

  const handleSaveSettings = () => {
    // حفظ جميع الإعدادات
    const allSettings = {
      company: companySettings,
      accounting: accountingSettings,
      tax: taxSettings,
      invoice: invoiceSettings,
      project: projectSettings,
      inventory: inventorySettings,
      hr: hrSettings,
      security: securitySettings,
      email: emailSettings,
      print: printSettings,
      system: systemSettings,
      ui: uiSettings
    };

    dispatch({ type: 'SET_SETTINGS', payload: allSettings });
    toast.success(state.currentLanguage === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
  };

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'اسم الشركة بالعربية *' : 'Company Name (Arabic) *'}
          </label>
          <input
            type="text"
            value={companySettings.arabicName}
            onChange={(e) => setCompanySettings({...companySettings, arabicName: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'اسم الشركة بالإنجليزية' : 'Company Name (English)'}
          </label>
          <input
            type="text"
            value={companySettings.englishName}
            onChange={(e) => setCompanySettings({...companySettings, englishName: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
          </label>
          <input
            type="email"
            value={companySettings.email}
            onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
          </label>
          <input
            type="tel"
            value={companySettings.phone}
            onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'الرقم الضريبي' : 'Tax Number'}
          </label>
          <input
            type="text"
            value={companySettings.taxNumber}
            onChange={(e) => setCompanySettings({...companySettings, taxNumber: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'العملة الأساسية' : 'Base Currency'}
          </label>
          <select
            value={companySettings.currency}
            onChange={(e) => setCompanySettings({...companySettings, currency: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="SAR">ريال سعودي (SAR)</option>
            <option value="USD">دولار أمريكي (USD)</option>
            <option value="EUR">يورو (EUR)</option>
            <option value="AED">درهم إماراتي (AED)</option>
            <option value="KWD">دينار كويتي (KWD)</option>
            <option value="QAR">ريال قطري (QAR)</option>
            <option value="BHD">دينار بحريني (BHD)</option>
            <option value="OMR">ريال عماني (OMR)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'العنوان' : 'Address'}
          </label>
          <textarea
            value={companySettings.address}
            onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
          </label>
          <input
            type="url"
            value={companySettings.website}
            onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="www.company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'السجل التجاري' : 'Commercial Register'}
          </label>
          <input
            type="text"
            value={companySettings.commercialRegister}
            onChange={(e) => setCompanySettings({...companySettings, commercialRegister: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'شعار الشركة' : 'Company Logo'}
          </label>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="flex items-center space-x-2 space-x-reverse px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              <span>{state.currentLanguage === 'ar' ? 'رفع الشعار' : 'Upload Logo'}</span>
            </button>
            {companySettings.logo && (
              <img src={companySettings.logo} alt="Company Logo" className="h-12 w-12 object-contain" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountingSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'بداية السنة المالية' : 'Fiscal Year Start'}
          </label>
          <input
            type="text"
            value={accountingSettings.fiscalYearStart}
            onChange={(e) => setAccountingSettings({...accountingSettings, fiscalYearStart: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="01-01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'طريقة المحاسبة' : 'Accounting Method'}
          </label>
          <select
            value={accountingSettings.accountingMethod}
            onChange={(e) => setAccountingSettings({...accountingSettings, accountingMethod: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="accrual">{state.currentLanguage === 'ar' ? 'محاسبة الاستحقاق' : 'Accrual Accounting'}</option>
            <option value="cash">{state.currentLanguage === 'ar' ? 'المحاسبة النقدية' : 'Cash Accounting'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'عدد المنازل العشرية' : 'Decimal Places'}
          </label>
          <select
            value={accountingSettings.decimalPlaces}
            onChange={(e) => setAccountingSettings({...accountingSettings, decimalPlaces: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="0">0</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'تنسيق التاريخ' : 'Date Format'}
          </label>
          <select
            value={accountingSettings.dateFormat}
            onChange={(e) => setAccountingSettings({...accountingSettings, dateFormat: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="dd/mm/yyyy">{state.currentLanguage === 'ar' ? 'يوم/شهر/سنة' : 'DD/MM/YYYY'}</option>
            <option value="mm/dd/yyyy">{state.currentLanguage === 'ar' ? 'شهر/يوم/سنة' : 'MM/DD/YYYY'}</option>
            <option value="yyyy-mm-dd">{state.currentLanguage === 'ar' ? 'سنة-شهر-يوم' : 'YYYY-MM-DD'}</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableMultiCurrency"
            checked={accountingSettings.enableMultiCurrency}
            onChange={(e) => setAccountingSettings({...accountingSettings, enableMultiCurrency: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableMultiCurrency" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل العملات المتعددة' : 'Enable Multi-Currency'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoPostJournalEntries"
            checked={accountingSettings.autoPostJournalEntries}
            onChange={(e) => setAccountingSettings({...accountingSettings, autoPostJournalEntries: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="autoPostJournalEntries" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'ترحيل القيود تلقائياً' : 'Auto-Post Journal Entries'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableCostCenters"
            checked={accountingSettings.enableCostCenters}
            onChange={(e) => setAccountingSettings({...accountingSettings, enableCostCenters: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableCostCenters" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل مراكز التكلفة' : 'Enable Cost Centers'}
          </label>
        </div>
      </div>
    </div>
  );

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          {state.currentLanguage === 'ar' ? 'ضريبة القيمة المضافة' : 'Value Added Tax (VAT)'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="vatEnabled"
              checked={taxSettings.vatEnabled}
              onChange={(e) => setTaxSettings({...taxSettings, vatEnabled: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="vatEnabled" className="mr-2 text-sm font-medium text-gray-700">
              {state.currentLanguage === 'ar' ? 'تفعيل ضريبة القيمة المضافة' : 'Enable VAT'}
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {state.currentLanguage === 'ar' ? 'معدل الضريبة (%)' : 'Tax Rate (%)'}
            </label>
            <input
              type="number"
              value={taxSettings.vatRate}
              onChange={(e) => setTaxSettings({...taxSettings, vatRate: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!taxSettings.vatEnabled}
            />
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">
          {state.currentLanguage === 'ar' ? 'الزكاة' : 'Zakat'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="zakatEnabled"
              checked={taxSettings.zakatEnabled}
              onChange={(e) => setTaxSettings({...taxSettings, zakatEnabled: e.target.checked})}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="zakatEnabled" className="mr-2 text-sm font-medium text-gray-700">
              {state.currentLanguage === 'ar' ? 'تفعيل حساب الزكاة' : 'Enable Zakat Calculation'}
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {state.currentLanguage === 'ar' ? 'معدل الزكاة (%)' : 'Zakat Rate (%)'}
            </label>
            <input
              type="number"
              value={taxSettings.zakatRate}
              onChange={(e) => setTaxSettings({...taxSettings, zakatRate: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={!taxSettings.zakatEnabled}
            />
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">
          {state.currentLanguage === 'ar' ? 'ضريبة الاستقطاع' : 'Withholding Tax'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="withholdingTaxEnabled"
              checked={taxSettings.withholdingTaxEnabled}
              onChange={(e) => setTaxSettings({...taxSettings, withholdingTaxEnabled: e.target.checked})}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="withholdingTaxEnabled" className="mr-2 text-sm font-medium text-gray-700">
              {state.currentLanguage === 'ar' ? 'تفعيل ضريبة الاستقطاع' : 'Enable Withholding Tax'}
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {state.currentLanguage === 'ar' ? 'معدل الاستقطاع (%)' : 'Withholding Rate (%)'}
            </label>
            <input
              type="number"
              value={taxSettings.withholdingTaxRate}
              onChange={(e) => setTaxSettings({...taxSettings, withholdingTaxRate: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!taxSettings.withholdingTaxEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoiceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'بادئة رقم الفاتورة' : 'Invoice Prefix'}
          </label>
          <input
            type="text"
            value={invoiceSettings.invoicePrefix}
            onChange={(e) => setInvoiceSettings({...invoiceSettings, invoicePrefix: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'تنسيق رقم الفاتورة' : 'Invoice Number Format'}
          </label>
          <input
            type="text"
            value={invoiceSettings.invoiceNumberFormat}
            onChange={(e) => setInvoiceSettings({...invoiceSettings, invoiceNumberFormat: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="INV-YYYY-####"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'شروط الدفع الافتراضية (يوم)' : 'Default Payment Terms (Days)'}
          </label>
          <input
            type="number"
            value={invoiceSettings.defaultPaymentTerms}
            onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultPaymentTerms: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'تاريخ الاستحقاق الافتراضي (يوم)' : 'Default Due Date (Days)'}
          </label>
          <input
            type="number"
            value={invoiceSettings.defaultDueDate}
            onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultDueDate: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'الملاحظات الافتراضية' : 'Default Notes'}
          </label>
          <textarea
            value={invoiceSettings.defaultNotes}
            onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultNotes: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoGenerateNumbers"
            checked={invoiceSettings.autoGenerateNumbers}
            onChange={(e) => setInvoiceSettings({...invoiceSettings, autoGenerateNumbers: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="autoGenerateNumbers" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'إنشاء أرقام الفواتير تلقائياً' : 'Auto-Generate Invoice Numbers'}
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showTaxBreakdown"
            checked={invoiceSettings.showTaxBreakdown}
            onChange={(e) => setInvoiceSettings({...invoiceSettings, showTaxBreakdown: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showTaxBreakdown" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'إظهار تفاصيل الضرائب' : 'Show Tax Breakdown'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowPartialPayments"
            checked={invoiceSettings.allowPartialPayments}
            onChange={(e) => setInvoiceSettings({...invoiceSettings, allowPartialPayments: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="allowPartialPayments" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'السماح بالدفعات الجزئية' : 'Allow Partial Payments'}
          </label>
        </div>
      </div>
    </div>
  );

  const renderProjectSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableProjectPhases"
            checked={projectSettings.enableProjectPhases}
            onChange={(e) => setProjectSettings({...projectSettings, enableProjectPhases: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableProjectPhases" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل مراحل المشاريع' : 'Enable Project Phases'}
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableProjectBudgets"
            checked={projectSettings.enableProjectBudgets}
            onChange={(e) => setProjectSettings({...projectSettings, enableProjectBudgets: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableProjectBudgets" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل ميزانيات المشاريع' : 'Enable Project Budgets'}
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableTimeTracking"
            checked={projectSettings.enableTimeTracking}
            onChange={(e) => setProjectSettings({...projectSettings, enableTimeTracking: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableTimeTracking" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل تتبع الوقت' : 'Enable Time Tracking'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableExpenseTracking"
            checked={projectSettings.enableExpenseTracking}
            onChange={(e) => setProjectSettings({...projectSettings, enableExpenseTracking: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableExpenseTracking" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل تتبع المصروفات' : 'Enable Expense Tracking'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireProjectApproval"
            checked={projectSettings.requireProjectApproval}
            onChange={(e) => setProjectSettings({...projectSettings, requireProjectApproval: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="requireProjectApproval" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'يتطلب موافقة على المشاريع' : 'Require Project Approval'}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'تنسيق رقم المشروع' : 'Project Number Format'}
          </label>
          <input
            type="text"
            value={projectSettings.projectNumberFormat}
            onChange={(e) => setProjectSettings({...projectSettings, projectNumberFormat: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="PRJ-YYYY-####"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'حالة المشروع الافتراضية' : 'Default Project Status'}
          </label>
          <select
            value={projectSettings.defaultProjectStatus}
            onChange={(e) => setProjectSettings({...projectSettings, defaultProjectStatus: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="planning">{state.currentLanguage === 'ar' ? 'تخطيط' : 'Planning'}</option>
            <option value="active">{state.currentLanguage === 'ar' ? 'نشط' : 'Active'}</option>
            <option value="on_hold">{state.currentLanguage === 'ar' ? 'متوقف' : 'On Hold'}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderInventorySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'طريقة تقييم المخزون' : 'Inventory Valuation Method'}
          </label>
          <select
            value={inventorySettings.inventoryMethod}
            onChange={(e) => setInventorySettings({...inventorySettings, inventoryMethod: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="fifo">{state.currentLanguage === 'ar' ? 'الوارد أولاً صادر أولاً (FIFO)' : 'First In, First Out (FIFO)'}</option>
            <option value="lifo">{state.currentLanguage === 'ar' ? 'الوارد أخيراً صادر أولاً (LIFO)' : 'Last In, First Out (LIFO)'}</option>
            <option value="average">{state.currentLanguage === 'ar' ? 'المتوسط المرجح' : 'Weighted Average'}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'حد التنبيه للمخزون المنخفض' : 'Low Stock Alert Threshold'}
          </label>
          <input
            type="number"
            value={inventorySettings.lowStockThreshold}
            onChange={(e) => setInventorySettings({...inventorySettings, lowStockThreshold: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'الوحدة الافتراضية' : 'Default Unit'}
          </label>
          <select
            value={inventorySettings.defaultUnit}
            onChange={(e) => setInventorySettings({...inventorySettings, defaultUnit: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="piece">{state.currentLanguage === 'ar' ? 'قطعة' : 'Piece'}</option>
            <option value="kg">{state.currentLanguage === 'ar' ? 'كيلوجرام' : 'Kilogram'}</option>
            <option value="meter">{state.currentLanguage === 'ar' ? 'متر' : 'Meter'}</option>
            <option value="liter">{state.currentLanguage === 'ar' ? 'لتر' : 'Liter'}</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableLowStockAlerts"
            checked={inventorySettings.enableLowStockAlerts}
            onChange={(e) => setInventorySettings({...inventorySettings, enableLowStockAlerts: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableLowStockAlerts" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل تنبيهات المخزون المنخفض' : 'Enable Low Stock Alerts'}
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableBarcodes"
            checked={inventorySettings.enableBarcodes}
            onChange={(e) => setInventorySettings({...inventorySettings, enableBarcodes: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableBarcodes" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل الباركود' : 'Enable Barcodes'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableLocationTracking"
            checked={inventorySettings.enableLocationTracking}
            onChange={(e) => setInventorySettings({...inventorySettings, enableLocationTracking: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableLocationTracking" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل تتبع المواقع' : 'Enable Location Tracking'}
          </label>
        </div>
      </div>
    </div>
  );

  const renderHRSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'تكرار كشف الراتب' : 'Payroll Frequency'}
          </label>
          <select
            value={hrSettings.payrollFrequency}
            onChange={(e) => setHrSettings({...hrSettings, payrollFrequency: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="weekly">{state.currentLanguage === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
            <option value="biweekly">{state.currentLanguage === 'ar' ? 'كل أسبوعين' : 'Bi-weekly'}</option>
            <option value="monthly">{state.currentLanguage === 'ar' ? 'شهري' : 'Monthly'}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'ساعات العمل اليومية' : 'Working Hours Per Day'}
          </label>
          <input
            type="number"
            value={hrSettings.workingHoursPerDay}
            onChange={(e) => setHrSettings({...hrSettings, workingHoursPerDay: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'أيام العمل في الأسبوع' : 'Working Days Per Week'}
          </label>
          <input
            type="number"
            value={hrSettings.workingDaysPerWeek}
            onChange={(e) => setHrSettings({...hrSettings, workingDaysPerWeek: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="7"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'معدل الوقت الإضافي' : 'Overtime Rate'}
          </label>
          <input
            type="number"
            value={hrSettings.overtimeRate}
            onChange={(e) => setHrSettings({...hrSettings, overtimeRate: parseFloat(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            step="0.1"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enablePayroll"
            checked={hrSettings.enablePayroll}
            onChange={(e) => setHrSettings({...hrSettings, enablePayroll: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enablePayroll" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل نظام الرواتب' : 'Enable Payroll System'}
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableAttendance"
            checked={hrSettings.enableAttendance}
            onChange={(e) => setHrSettings({...hrSettings, enableAttendance: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableAttendance" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل نظام الحضور والانصراف' : 'Enable Attendance System'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableLeaveManagement"
            checked={hrSettings.enableLeaveManagement}
            onChange={(e) => setHrSettings({...hrSettings, enableLeaveManagement: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableLeaveManagement" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل إدارة الإجازات' : 'Enable Leave Management'}
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-900 mb-4">
          {state.currentLanguage === 'ar' ? 'إعدادات كلمة المرور' : 'Password Settings'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {state.currentLanguage === 'ar' ? 'الحد الأدنى لطول كلمة المرور' : 'Minimum Password Length'}
            </label>
            <input
              type="number"
              value={securitySettings.passwordMinLength}
              onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {state.currentLanguage === 'ar' ? 'انتهاء صلاحية كلمة المرور (يوم)' : 'Password Expiry (Days)'}
            </label>
            <input
              type="number"
              value={securitySettings.passwordExpiry}
              onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {state.currentLanguage === 'ar' ? 'الحد الأقصى لمحاولات تسجيل الدخول' : 'Max Login Attempts'}
            </label>
            <input
              type="number"
              value={securitySettings.maxLoginAttempts}
              onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {state.currentLanguage === 'ar' ? 'انتهاء الجلسة (دقيقة)' : 'Session Timeout (Minutes)'}
            </label>
            <input
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireUppercase"
              checked={securitySettings.requireUppercase}
              onChange={(e) => setSecuritySettings({...securitySettings, requireUppercase: e.target.checked})}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="requireUppercase" className="mr-2 text-sm font-medium text-gray-700">
              {state.currentLanguage === 'ar' ? 'يتطلب أحرف كبيرة' : 'Require Uppercase Letters'}
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireNumbers"
              checked={securitySettings.requireNumbers}
              onChange={(e) => setSecuritySettings({...securitySettings, requireNumbers: e.target.checked})}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="requireNumbers" className="mr-2 text-sm font-medium text-gray-700">
              {state.currentLanguage === 'ar' ? 'يتطلب أرقام' : 'Require Numbers'}
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableTwoFactor"
              checked={securitySettings.enableTwoFactor}
              onChange={(e) => setSecuritySettings({...securitySettings, enableTwoFactor: e.target.checked})}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="enableTwoFactor" className="mr-2 text-sm font-medium text-gray-700">
              {state.currentLanguage === 'ar' ? 'تفعيل المصادقة الثنائية' : 'Enable Two-Factor Authentication'}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableAuditLog"
              checked={securitySettings.enableAuditLog}
              onChange={(e) => setSecuritySettings({...securitySettings, enableAuditLog: e.target.checked})}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="enableAuditLog" className="mr-2 text-sm font-medium text-gray-700">
              {state.currentLanguage === 'ar' ? 'تفعيل سجل المراجعة' : 'Enable Audit Log'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'خادم SMTP' : 'SMTP Host'}
          </label>
          <input
            type="text"
            value={emailSettings.smtpHost}
            onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'منفذ SMTP' : 'SMTP Port'}
          </label>
          <input
            type="number"
            value={emailSettings.smtpPort}
            onChange={(e) => setEmailSettings({...emailSettings, smtpPort: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'اسم المستخدم' : 'Username'}
          </label>
          <input
            type="text"
            value={emailSettings.smtpUsername}
            onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'كلمة المرور' : 'Password'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={emailSettings.smtpPassword}
              onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'التشفير' : 'Encryption'}
          </label>
          <select
            value={emailSettings.smtpEncryption}
            onChange={(e) => setEmailSettings({...emailSettings, smtpEncryption: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">{state.currentLanguage === 'ar' ? 'بدون تشفير' : 'None'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'البريد المرسل من' : 'From Email'}
          </label>
          <input
            type="email"
            value={emailSettings.fromEmail}
            onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableEmailNotifications"
            checked={emailSettings.enableEmailNotifications}
            onChange={(e) => setEmailSettings({...emailSettings, enableEmailNotifications: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableEmailNotifications" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل الإشعارات عبر البريد الإلكتروني' : 'Enable Email Notifications'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableInvoiceEmails"
            checked={emailSettings.enableInvoiceEmails}
            onChange={(e) => setEmailSettings({...emailSettings, enableInvoiceEmails: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableInvoiceEmails" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'إرسال الفواتير بالبريد الإلكتروني' : 'Send Invoices via Email'}
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrintSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'حجم الورق الافتراضي' : 'Default Paper Size'}
          </label>
          <select
            value={printSettings.defaultPaperSize}
            onChange={(e) => setPrintSettings({...printSettings, defaultPaperSize: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="Letter">Letter</option>
            <option value="Legal">Legal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'اتجاه الطباعة' : 'Page Orientation'}
          </label>
          <select
            value={printSettings.defaultOrientation}
            onChange={(e) => setPrintSettings({...printSettings, defaultOrientation: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="portrait">{state.currentLanguage === 'ar' ? 'عمودي' : 'Portrait'}</option>
            <option value="landscape">{state.currentLanguage === 'ar' ? 'أفقي' : 'Landscape'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'حجم الخط' : 'Font Size'}
          </label>
          <input
            type="number"
            value={printSettings.fontSize}
            onChange={(e) => setPrintSettings({...printSettings, fontSize: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'نوع الخط' : 'Font Family'}
          </label>
          <select
            value={printSettings.fontFamily}
            onChange={(e) => setPrintSettings({...printSettings, fontFamily: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Calibri">Calibri</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeCompanyLogo"
            checked={printSettings.includeCompanyLogo}
            onChange={(e) => setPrintSettings({...printSettings, includeCompanyLogo: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="includeCompanyLogo" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تضمين شعار الشركة' : 'Include Company Logo'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeWatermark"
            checked={printSettings.includeWatermark}
            onChange={(e) => setPrintSettings({...printSettings, includeWatermark: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="includeWatermark" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تضمين علامة مائية' : 'Include Watermark'}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'هامش علوي (مم)' : 'Top Margin (mm)'}
          </label>
          <input
            type="number"
            value={printSettings.marginTop}
            onChange={(e) => setPrintSettings({...printSettings, marginTop: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'هامش سفلي (مم)' : 'Bottom Margin (mm)'}
          </label>
          <input
            type="number"
            value={printSettings.marginBottom}
            onChange={(e) => setPrintSettings({...printSettings, marginBottom: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'هامش يمين (مم)' : 'Right Margin (mm)'}
          </label>
          <input
            type="number"
            value={printSettings.marginRight}
            onChange={(e) => setPrintSettings({...printSettings, marginRight: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'هامش يسار (مم)' : 'Left Margin (mm)'}
          </label>
          <input
            type="number"
            value={printSettings.marginLeft}
            onChange={(e) => setPrintSettings({...printSettings, marginLeft: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'تكرار النسخ الاحتياطي' : 'Backup Frequency'}
          </label>
          <select
            value={systemSettings.backupFrequency}
            onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">{state.currentLanguage === 'ar' ? 'يومي' : 'Daily'}</option>
            <option value="weekly">{state.currentLanguage === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
            <option value="monthly">{state.currentLanguage === 'ar' ? 'شهري' : 'Monthly'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'فترة الاحتفاظ بالنسخ الاحتياطية (يوم)' : 'Backup Retention (Days)'}
          </label>
          <input
            type="number"
            value={systemSettings.backupRetention}
            onChange={(e) => setSystemSettings({...systemSettings, backupRetention: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'مستوى السجلات' : 'Log Level'}
          </label>
          <select
            value={systemSettings.logLevel}
            onChange={(e) => setSystemSettings({...systemSettings, logLevel: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="error">{state.currentLanguage === 'ar' ? 'أخطاء فقط' : 'Error Only'}</option>
            <option value="warn">{state.currentLanguage === 'ar' ? 'تحذيرات' : 'Warning'}</option>
            <option value="info">{state.currentLanguage === 'ar' ? 'معلومات' : 'Info'}</option>
            <option value="debug">{state.currentLanguage === 'ar' ? 'تصحيح' : 'Debug'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'الحد الأقصى لحجم الملف (ميجابايت)' : 'Max File Size (MB)'}
          </label>
          <input
            type="number"
            value={systemSettings.maxFileSize}
            onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableBackup"
            checked={systemSettings.enableBackup}
            onChange={(e) => setSystemSettings({...systemSettings, enableBackup: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableBackup" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل النسخ الاحتياطي التلقائي' : 'Enable Automatic Backup'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableMaintenance"
            checked={systemSettings.enableMaintenance}
            onChange={(e) => setSystemSettings({...systemSettings, enableMaintenance: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableMaintenance" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableCaching"
            checked={systemSettings.enableCaching}
            onChange={(e) => setSystemSettings({...systemSettings, enableCaching: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableCaching" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل التخزين المؤقت' : 'Enable Caching'}
          </label>
        </div>
      </div>

      {systemSettings.enableMaintenance && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'رسالة الصيانة' : 'Maintenance Message'}
          </label>
          <textarea
            value={systemSettings.maintenanceMessage}
            onChange={(e) => setSystemSettings({...systemSettings, maintenanceMessage: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      )}
    </div>
  );

  const renderUISettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'المظهر' : 'Theme'}
          </label>
          <select
            value={uiSettings.theme}
            onChange={(e) => setUiSettings({...uiSettings, theme: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="light">{state.currentLanguage === 'ar' ? 'فاتح' : 'Light'}</option>
            <option value="dark">{state.currentLanguage === 'ar' ? 'داكن' : 'Dark'}</option>
            <option value="auto">{state.currentLanguage === 'ar' ? 'تلقائي' : 'Auto'}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'اللغة' : 'Language'}
          </label>
          <select
            value={uiSettings.language}
            onChange={(e) => {
              setUiSettings({...uiSettings, language: e.target.value});
              dispatch({ type: 'SET_LANGUAGE', payload: e.target.value as 'ar' | 'en' });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'اللون الأساسي' : 'Primary Color'}
          </label>
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="color"
              value={uiSettings.primaryColor}
              onChange={(e) => setUiSettings({...uiSettings, primaryColor: e.target.value})}
              className="w-10 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={uiSettings.primaryColor}
              onChange={(e) => setUiSettings({...uiSettings, primaryColor: e.target.value})}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {state.currentLanguage === 'ar' ? 'حجم الخط' : 'Font Size'}
          </label>
          <select
            value={uiSettings.fontSize}
            onChange={(e) => setUiSettings({...uiSettings, fontSize: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="small">{state.currentLanguage === 'ar' ? 'صغير' : 'Small'}</option>
            <option value="medium">{state.currentLanguage === 'ar' ? 'متوسط' : 'Medium'}</option>
            <option value="large">{state.currentLanguage === 'ar' ? 'كبير' : 'Large'}</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableAnimations"
            checked={uiSettings.enableAnimations}
            onChange={(e) => setUiSettings({...uiSettings, enableAnimations: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableAnimations" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'تفعيل الحركات والانتقالات' : 'Enable Animations'}
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="compactMode"
            checked={uiSettings.compactMode}
            onChange={(e) => setUiSettings({...uiSettings, compactMode: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="compactMode" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'الوضع المضغوط' : 'Compact Mode'}
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showSidebar"
            checked={uiSettings.showSidebar}
            onChange={(e) => setUiSettings({...uiSettings, showSidebar: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showSidebar" className="mr-2 text-sm font-medium text-gray-700">
            {state.currentLanguage === 'ar' ? 'إظهار الشريط الجانبي' : 'Show Sidebar'}
          </label>
        </div>
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'company':
        return renderCompanySettings();
      case 'accounting':
        return renderAccountingSettings();
      case 'tax':
        return renderTaxSettings();
      case 'invoice':
        return renderInvoiceSettings();
      case 'project':
        return renderProjectSettings();
      case 'inventory':
        return renderInventorySettings();
      case 'hr':
        return renderHRSettings();
      case 'security':
        return renderSecuritySettings();
      case 'email':
        return renderEmailSettings();
      case 'print':
        return renderPrintSettings();
      case 'system':
        return renderSystemSettings();
      case 'ui':
        return renderUISettings();
      default:
        return <div>{state.currentLanguage === 'ar' ? 'اختر قسم من الإعدادات' : 'Select a settings section'}</div>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {state.currentLanguage === 'ar' ? 'إعدادات النظام' : 'System Settings'}
          </h1>
          <p className="text-gray-600">
            {state.currentLanguage === 'ar' ? 'إدارة جميع إعدادات النظام والتخصيصات' : 'Manage all system settings and customizations'}
          </p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
        >
          <Save className="w-5 h-5" />
          <span>{state.currentLanguage === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-right transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : 'text-gray-400'}`} />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {settingsTabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <div className="h-1 w-20 bg-blue-600 rounded"></div>
            </div>

            {renderCurrentTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;