import React, { useState } from 'react';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import Header from '../../components/teacher/common/Header';
import StatsCard from '../../components/teacher/dashboard/StatsCard';
import ScheduleSection from '../../components/teacher/dashboard/ScheduleSection';
import SubmissionsSection from '../../components/teacher/dashboard/SubmissionsSection';
import DeadlinesSection from '../../components/teacher/dashboard/DeadlinesSection';
import PerformanceChart from '../../components/teacher/dashboard/PerformanceChart';
import { MdMenu } from 'react-icons/md'; // Hamburger icon

const TeacherDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar toggle
  const stats = [
    { title: 'Active Classes', value: 5, icon: '📚' },
    { title: 'Total Students', value: 127, icon: '👥' },
    { title: 'Pending Assignments', value: 12, icon: '📝' },
    { title: 'New Messages', value: 8, icon: '💬' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden by default on small screens, slides in when toggled */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform ease-in-out duration-300`}
      >
        <TeacherSideBar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        {/* Header with Hamburger Icon (mobile view) */}
        <div className="flex items-center justify-between bg-white shadow-md p-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MdMenu size={30} />
          </button>
          <Header />
        </div>

        {/* Header for Desktop */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
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

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <StatsCard key={index} {...stat} />
                ))}
              </div>

              {/* Sections Grid */}
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
    </div>
  );
};

export default TeacherDashboard;
