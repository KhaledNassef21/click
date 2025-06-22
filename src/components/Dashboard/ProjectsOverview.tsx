import React from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, Calendar, DollarSign, TrendingUp, MapPin, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyUtils';

const ProjectsOverview: React.FC = () => {
  const { state } = useApp();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    if (state.currentLanguage === 'ar') {
      switch (status) {
        case 'active':
          return 'نشط';
        case 'completed':
          return 'مكتمل';
        case 'on-hold':
          return 'متوقف';
        default:
          return status;
      }
    } else {
      switch (status) {
        case 'active':
          return 'Active';
        case 'completed':
          return 'Completed';
        case 'on-hold':
          return 'On Hold';
        default:
          return status;
      }
    }
  };

  const calculateProgress = (expenses: number, budget: number) => {
    return budget > 0 ? (expenses / budget) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {state.currentLanguage === 'ar' ? 'نظرة عامة على المشاريع' : 'Projects Overview'}
        </h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          {state.currentLanguage === 'ar' ? 'عرض جميع المشاريع' : 'View All Projects'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.projects.map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-500">{project.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{state.currentLanguage === 'ar' ? 'تاريخ البداية' : 'Start Date'}</span>
                </div>
                <span className="font-medium">{new Date(project.startDate).toLocaleDateString(state.currentLanguage === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>{state.currentLanguage === 'ar' ? 'الميزانية' : 'Budget'}</span>
                </div>
                <span className="font-medium">{formatCurrency(project.budget || 0, state.settings.company.currency, state.currentLanguage)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{state.currentLanguage === 'ar' ? 'المصروفات' : 'Expenses'}</span>
                </div>
                <span className="font-medium text-red-600">{formatCurrency(project.expenses, state.settings.company.currency, state.currentLanguage)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>{state.currentLanguage === 'ar' ? 'الإيرادات' : 'Revenue'}</span>
                </div>
                <span className="font-medium text-green-600">{formatCurrency(project.revenue, state.settings.company.currency, state.currentLanguage)}</span>
              </div>

              {/* Progress Bar */}
              {project.budget && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{state.currentLanguage === 'ar' ? 'تقدم المشروع' : 'Project Progress'}</span>
                    <span className="font-medium">{calculateProgress(project.expenses, project.budget).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(calculateProgress(project.expenses, project.budget), 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {state.projects.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {state.currentLanguage === 'ar' ? 'لا توجد مشاريع' : 'No Projects'}
          </h4>
          <p className="text-gray-500 mb-4">
            {state.currentLanguage === 'ar' ? 'ابدأ بإضافة مشروعك الأول' : 'Start by adding your first project'}
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            {state.currentLanguage === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsOverview;