// pages/admin/schedule.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Commen/Sidebar';
import Header from '../../components/admin/Commen/Header';
import ScheduleForm from '../../components/admin/schedule/ScheduleForm';
import ScheduleTable from '../../components/admin/schedule/ScheduleTable';
import WeeklyCalendarView from '../../components/admin/schedule/WeeklyCalendarView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ListFilter, Calendar, Grid3X3 } from 'lucide-react';

const AdminSchedule = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [departments, setDepartments] = useState([]);

  

  // Handle adding a new schedule
  const handleScheduleAdded = (newSchedule) => {
    setSchedules(prevSchedules => [...prevSchedules, newSchedule]);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#F5F7FB] to-white">
      {/* Sidebar for mobile (with overlay) */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activePage="schedule" />
      </div>
      
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <Sidebar activePage="schedule" onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 pl-0 lg:pl-64">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">Schedule Management</h1>
              <p className="text-sm sm:text-base text-gray-500">
                Create and manage class schedules for each department according to courses
              </p>
            </div>
            
            {/* View mode selector */}
            <div className="mt-4 sm:mt-0">
              <Tabs 
                defaultValue="table" 
                value={viewMode} 
                onValueChange={setViewMode}
                className="w-full sm:w-auto"
              >
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="table" className="data-[state=active]:bg-white">
                    <ListFilter size={16} className="mr-2" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="data-[state=active]:bg-white">
                    <Calendar size={16} className="mr-2" />
                    Weekly View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Form for adding a new schedule */}
          <div className="mb-8">
            <ScheduleForm onScheduleAdded={handleScheduleAdded} />
          </div>
          
          {/* Different View Modes */}
          {viewMode === 'table' && (
            <ScheduleTable />
          )}
          
          {viewMode === 'weekly' && (
            <WeeklyCalendarView schedules={schedules} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminSchedule;