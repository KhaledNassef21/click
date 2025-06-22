import React from 'react';
import { useApp } from '../../context/AppContext';
import StatsCards from './StatsCards';
import RevenueChart from './RevenueChart';
import RecentActivity from './RecentActivity';
import ProjectsOverview from './ProjectsOverview';

const Dashboard: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {state.currentLanguage === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-gray-600">
          {state.currentLanguage === 'ar' 
            ? 'نظرة شاملة على أداء شركتك المالي' 
            : 'Comprehensive overview of your company\'s financial performance'
          }
        </p>
      </div>

      <StatsCards />
      <RevenueChart />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <ProjectsOverview />
      </div>
    </div>
  );
};

export default Dashboard;