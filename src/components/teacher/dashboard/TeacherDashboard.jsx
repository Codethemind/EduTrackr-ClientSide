import React from 'react';
import TeacherSideBar from '../sideBar/teacherSideBar';
import Header from '../common/Header';
import StatsCard from './StatsCard';
import ScheduleSection from './ScheduleSection';
import SubmissionsSection from './SubmissionsSection';
import DeadlinesSection from './DeadlinesSection';
import PerformanceChart from './PerformanceChart';

const TeacherDashboard = () => {
  const stats = [
    { title: 'Active Classes', value: 5, icon: '📚' },
    { title: 'Total Students', value: 127, icon: '👥' },
    { title: 'Pending Assignments', value: 12, icon: '📝' },
    { title: 'New Messages', value: 8, icon: '💬' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your classes today.</p>
              </div>
              <div className="flex gap-4">
                <button className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
                  View Schedule
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Assignment
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ScheduleSection />
              <SubmissionsSection />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeadlinesSection />
              <PerformanceChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard; 