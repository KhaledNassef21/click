import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency } from '../../utils/currencyUtils';

const RevenueChart: React.FC = () => {
  const { state } = useApp();
  
  const monthlyData = [
    { month: state.currentLanguage === 'ar' ? 'يناير' : 'January', revenue: 150000, expenses: 90000, profit: 60000 },
    { month: state.currentLanguage === 'ar' ? 'فبراير' : 'February', revenue: 180000, expenses: 110000, profit: 70000 },
    { month: state.currentLanguage === 'ar' ? 'مارس' : 'March', revenue: 200000, expenses: 120000, profit: 80000 },
    { month: state.currentLanguage === 'ar' ? 'أبريل' : 'April', revenue: 170000, expenses: 100000, profit: 70000 },
    { month: state.currentLanguage === 'ar' ? 'مايو' : 'May', revenue: 220000, expenses: 130000, profit: 90000 },
    { month: state.currentLanguage === 'ar' ? 'يونيو' : 'June', revenue: 250000, expenses: 140000, profit: 110000 }
  ];

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value, state.settings.company.currency, state.currentLanguage);
  };

  return (
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
              formatter={(value: number) => [formatTooltipValue(value), '']}
              labelFormatter={(label) => label}
            />
            <Bar 
              dataKey="revenue" 
              fill="#3B82F6" 
              name={state.currentLanguage === 'ar' ? 'الإيرادات' : 'Revenue'} 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="expenses" 
              fill="#EF4444" 
              name={state.currentLanguage === 'ar' ? 'المصروفات' : 'Expenses'} 
              radius={[4, 4, 0, 0]} 
            />
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
              formatter={(value: number) => [formatTooltipValue(value), state.currentLanguage === 'ar' ? 'صافي الربح' : 'Net Profit']}
              labelFormatter={(label) => label}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;