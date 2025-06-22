import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Briefcase } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyUtils';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

const StatsCards: React.FC = () => {
  const { state } = useApp();
  
  const stats: StatCard[] = [
    {
      title: state.currentLanguage === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: formatCurrency(1250000, state.settings.company.currency, state.currentLanguage),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: state.currentLanguage === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses',
      value: formatCurrency(750000, state.settings.company.currency, state.currentLanguage),
      change: '-5.2%',
      trend: 'down',
      icon: TrendingDown,
      color: 'text-red-600 bg-red-100'
    },
    {
      title: state.currentLanguage === 'ar' ? 'الفواتير المعلقة' : 'Pending Invoices',
      value: formatCurrency(125000, state.settings.company.currency, state.currentLanguage),
      change: '+8.1%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: state.currentLanguage === 'ar' ? 'عدد العملاء' : 'Total Customers',
      value: '48',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: state.currentLanguage === 'ar' ? 'المشاريع النشطة' : 'Active Projects',
      value: '12',
      change: '+20.0%',
      trend: 'up',
      icon: Briefcase,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: state.currentLanguage === 'ar' ? 'صافي الربح' : 'Net Profit',
      value: formatCurrency(500000, state.settings.company.currency, state.currentLanguage),
      change: '+18.7%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <div className="flex items-center space-x-1 space-x-reverse">
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500">
                  {state.currentLanguage === 'ar' ? 'من الشهر الماضي' : 'from last month'}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;