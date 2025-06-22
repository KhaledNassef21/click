import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, FileText, Download, Calendar, Filter, TrendingUp, DollarSign, Users, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../../utils/currencyUtils';

const ReportsDashboard: React.FC = () => {
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('financial');

  // Sample data for charts
  const monthlyData = [
    { month: state.currentLanguage === 'ar' ? 'يناير' : 'January', revenue: 150000, expenses: 90000, profit: 60000 },
    { month: state.currentLanguage === 'ar' ? 'فبراير' : 'February', revenue: 180000, expenses: 110000, profit: 70000 },
    { month: state.currentLanguage === 'ar' ? 'مارس' : 'March', revenue: 200000, expenses: 120000, profit: 80000 },
    { month: state.currentLanguage === 'ar' ? 'أبريل' : 'April', revenue: 170000, expenses: 100000, profit: 70000 },
    { month: state.currentLanguage === 'ar' ? 'مايو' : 'May', revenue: 220000, expenses: 130000, profit: 90000 },
    { month: state.currentLanguage === 'ar' ? 'يونيو' : 'June', revenue: 250000, expenses: 140000, profit: 110000 }
  ];

  const projectData = [
    { name: state.currentLanguage === 'ar' ? 'مجمع الأعمال التجاري' : 'Commercial Complex', value: 45, color: '#3B82F6' },
    { name: state.currentLanguage === 'ar' ? 'فيلا سكنية' : 'Residential Villa', value: 25, color: '#10B981' },
    { name: state.currentLanguage === 'ar' ? 'مدرسة ابتدائية' : 'Elementary School', value: 20, color: '#F59E0B' },
    { name: state.currentLanguage === 'ar' ? 'مشاريع أخرى' : 'Other Projects', value: 10, color: '#EF4444' }
  ];

  const expenseCategories = [
    { 
      category: state.currentLanguage === 'ar' ? 'مواد البناء' : 'Construction Materials', 
      amount: 120000, 
      percentage: 40 
    },
    { 
      category: state.currentLanguage === 'ar' ? 'أجور العمالة' : 'Labor Costs', 
      amount: 90000, 
      percentage: 30 
    },
    { 
      category: state.currentLanguage === 'ar' ? 'معدات ومعدات' : 'Equipment & Machinery', 
      amount: 60000, 
      percentage: 20 
    },
    { 
      category: state.currentLanguage === 'ar' ? 'مصاريف إدارية' : 'Administrative Expenses', 
      amount: 30000, 
      percentage: 10 
    }
  ];

  const reports = [
    {
      id: 'balance-sheet',
      name: state.currentLanguage === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet',
      description: state.currentLanguage === 'ar' ? 'تقرير الأصول والخصوم وحقوق الملكية' : 'Assets, liabilities and equity report',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'income-statement',
      name: state.currentLanguage === 'ar' ? 'قائمة الدخل' : 'Income Statement',
      description: state.currentLanguage === 'ar' ? 'تقرير الإيرادات والمصروفات والأرباح' : 'Revenues, expenses and profits report',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'cash-flow',
      name: state.currentLanguage === 'ar' ? 'قائمة التدفقات النقدية' : 'Cash Flow Statement',
      description: state.currentLanguage === 'ar' ? 'تقرير التدفقات النقدية الداخلة والخارجة' : 'Inflows and outflows of cash report',
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'trial-balance',
      name: state.currentLanguage === 'ar' ? 'ميزان المراجعة' : 'Trial Balance',
      description: state.currentLanguage === 'ar' ? 'تقرير أرصدة الحسابات' : 'Account balances report',
      icon: FileText,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'customer-statement',
      name: state.currentLanguage === 'ar' ? 'كشف حساب العملاء' : 'Customer Statement',
      description: state.currentLanguage === 'ar' ? 'تقرير مستحقات العملاء' : 'Customer receivables report',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'project-profitability',
      name: state.currentLanguage === 'ar' ? 'ربحية المشاريع' : 'Project Profitability',
      description: state.currentLanguage === 'ar' ? 'تقرير أرباح وخسائر المشاريع' : 'Project profit and loss report',
      icon: Briefcase,
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  const handleExportReport = (format: string) => {
    console.log(`Exporting report in ${format} format`);
    // Here you would implement the actual export functionality
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {state.currentLanguage === 'ar' ? 'التقارير والتحليلات' : 'Reports & Analytics'}
          </h1>
          <p className="text-gray-600">
            {state.currentLanguage === 'ar' ? 'تقارير مالية شاملة وتحليلات الأداء' : 'Comprehensive financial reports and performance analytics'}
          </p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="monthly">{state.currentLanguage === 'ar' ? 'شهري' : 'Monthly'}</option>
            <option value="quarterly">{state.currentLanguage === 'ar' ? 'ربع سنوي' : 'Quarterly'}</option>
            <option value="yearly">{state.currentLanguage === 'ar' ? 'سنوي' : 'Yearly'}</option>
          </select>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse">
            <Download className="w-5 h-5" />
            <span>{state.currentLanguage === 'ar' ? 'تصدير التقارير' : 'Export Reports'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {state.currentLanguage === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenues'}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(1170000, state.settings.company.currency, state.currentLanguage)}
              </p>
              <p className="text-sm text-green-600">+12.5% {state.currentLanguage === 'ar' ? 'من الشهر الماضي' : 'from last month'}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {state.currentLanguage === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(690000, state.settings.company.currency, state.currentLanguage)}
              </p>
              <p className="text-sm text-red-600">+8.3% {state.currentLanguage === 'ar' ? 'من الشهر الماضي' : 'from last month'}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {state.currentLanguage === 'ar' ? 'صافي الربح' : 'Net Profit'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(480000, state.settings.company.currency, state.currentLanguage)}
              </p>
              <p className="text-sm text-blue-600">+18.7% {state.currentLanguage === 'ar' ? 'من الشهر الماضي' : 'from last month'}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {state.currentLanguage === 'ar' ? 'هامش الربح' : 'Profit Margin'}
              </p>
              <p className="text-2xl font-bold text-purple-600">41.0%</p>
              <p className="text-sm text-purple-600">+2.1% {state.currentLanguage === 'ar' ? 'من الشهر الماضي' : 'from last month'}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue vs Expenses Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {state.currentLanguage === 'ar' ? 'الإيرادات والمصروفات الشهرية' : 'Monthly Revenue & Expenses'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value, state.settings.company.currency, state.currentLanguage), '']}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="revenue" fill="#10B981" name={state.currentLanguage === 'ar' ? 'الإيرادات' : 'Revenue'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" name={state.currentLanguage === 'ar' ? 'المصروفات' : 'Expenses'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {state.currentLanguage === 'ar' ? 'اتجاه صافي الربح' : 'Net Profit Trend'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value, state.settings.company.currency, state.currentLanguage), state.currentLanguage === 'ar' ? 'صافي الربح' : 'Net Profit']}
                labelFormatter={(label) => label}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Project Distribution */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {state.currentLanguage === 'ar' ? 'توزيع الإيرادات حسب المشاريع' : 'Revenue Distribution by Project'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {projectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {state.currentLanguage === 'ar' ? 'تصنيف المصروفات' : 'Expense Categories'}
          </h3>
          <div className="space-y-4">
            {expenseCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(category.amount, state.settings.company.currency, state.currentLanguage)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {state.currentLanguage === 'ar' ? 'التقارير المتاحة' : 'Available Reports'}
          </h3>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button 
              onClick={() => handleExportReport('pdf')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button 
              onClick={() => handleExportReport('excel')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  {state.currentLanguage === 'ar' ? 'عرض التقرير' : 'View Report'}
                </button>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;