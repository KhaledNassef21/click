import React from 'react';
import { FileText, DollarSign, Users, Briefcase, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'invoice',
      title: 'فاتورة جديدة #INV-2024-001',
      description: 'تم إنشاء فاتورة لمؤسسة البناء الحديث',
      amount: '57,500 ر.س',
      time: 'منذ ساعتين',
      status: 'pending',
      icon: FileText,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 2,
      type: 'payment',
      title: 'دفعة مستلمة',
      description: 'تم استلام دفعة من شركة التطوير العقاري',
      amount: '25,000 ر.س',
      time: 'منذ 4 ساعات',
      status: 'completed',
      icon: DollarSign,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 3,
      type: 'customer',
      title: 'عميل جديد',
      description: 'تم إضافة شركة الإنشاءات المتقدمة',
      amount: '',
      time: 'منذ يوم',
      status: 'completed',
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 4,
      type: 'project',
      title: 'تحديث المشروع',
      description: 'تم تحديث حالة مشروع الفيلا السكنية',
      amount: '',
      time: 'منذ يومين',
      status: 'pending',
      icon: Briefcase,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      id: 5,
      type: 'expense',
      title: 'مصروف جديد',
      description: 'تم تسجيل مصروف شراء مواد بناء',
      amount: '15,000 ر.س',
      time: 'منذ 3 أيام',
      status: 'approved',
      icon: DollarSign,
      color: 'text-red-600 bg-red-100'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">النشاط الأخير</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          عرض الكل
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 space-x-reverse p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0`}>
              <activity.icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </h4>
                <div className="flex items-center space-x-2 space-x-reverse">
                  {activity.amount && (
                    <span className="text-sm font-medium text-gray-700">
                      {activity.amount}
                    </span>
                  )}
                  {getStatusIcon(activity.status)}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {activity.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;