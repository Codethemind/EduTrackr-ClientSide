import React, { useState } from 'react';
import Sidebar from '../../components/student/Common/Sidebar';
import Header from '../../components/student/Common/Header';
import StatsCard from '../../components/student/Dashboard/StatsCard';
import CourseProgress from '../../components/student/Dashboard/CourseProgress';
import UpcomingAssignments from '../../components/student/Dashboard/UpcomingAssignments';
import TodaySchedule from '../../components/student/Dashboard/TodaySchedule';
import RecentAnnouncements from '../../components/student/Dashboard/RecentAnnouncements';
import { MdSchool, MdAssignment, MdTrendingUp, MdMenu } from 'react-icons/md'; // Hamburger icon

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle state

  // Sample data - replace with actual data from your API
  const stats = [
    {
      title: 'Active Courses',
      value: '5',
      trend: 'up',
      trendValue: '1 new this semester',
      icon: MdSchool
    },
    {
      title: 'Pending Assignments',
      value: '8',
      trend: 'up',
      trendValue: '3 due this week',
      icon: MdAssignment
    },
    {
      title: 'Overall GPA',
      value: '87%',
      trend: 'up',
      trendValue: '2% increase',
      icon: MdTrendingUp
    }
  ];

  const courses = [
    {
      name: 'CS101: Introduction to Programming',
      instructor: 'Prof. Emily Johnson',
      schedule: 'MWF 8:00 AM',
      grade: 'A-',
      progress: 75
    },
    {
      name: 'CS201: Data Structures',
      instructor: 'Prof. Michael Brown',
      schedule: 'MWF 10:30 AM',
      grade: 'B+',
      progress: 60
    },
    {
      name: 'CS301: Algorithms',
      instructor: 'Prof. Sarah Davis',
      schedule: 'TR 9:00 AM',
      grade: 'B',
      progress: 45
    }
  ];

  const assignments = [
    {
      title: 'Binary Search Tree Implementation',
      course: 'CS201: Data Structures',
      dueDate: 'Tomorrow, 11:59 PM',
      weight: 15,
      status: 'Started'
    },
    {
      title: 'Database Normalization Exercise',
      course: 'CS401: Database Systems',
      dueDate: 'Dec 10, 11:59 PM',
      weight: 10,
      status: 'Not Started'
    },
    {
      title: 'Software Requirements Document',
      course: 'CS301: Software Engineering',
      dueDate: 'Dec 15, 11:59 PM',
      weight: 20,
      status: 'Not Started'
    }
  ];

  const schedule = [
    {
      time: '8:00 AM',
      duration: '1h 30m',
      title: 'CS101: Introduction to Programming',
      location: 'Room 301, Computer Science Building'
    },
    {
      time: '10:30 AM',
      duration: '1h 30m',
      title: 'CS201: Data Structures',
      location: 'Room 305, Computer Science Building'
    },
    {
      time: '2:00 PM',
      duration: '1h',
      title: 'Study Group: Algorithm Practice',
      location: 'Library, Study Room 4'
    },
    {
      time: '4:00 PM',
      duration: '1h 30m',
      title: 'CS401: Database Systems',
      location: 'Room 201, Computer Science Building'
    }
  ];

  const announcements = [
    {
      course: 'CS201: Data Structures',
      title: 'Assignment Deadline Extended',
      time: 'Today, 9:15 AM',
      instructor: 'Prof. Michael Brown',
      content: 'The deadline for the Binary Search Tree implementation assignment has been extended to Friday, December 8th at 11:59 PM due to the upcoming midterm exams.'
    },
    {
      course: 'CS401: Database Systems',
      title: 'Guest Lecture: Big Data Analytics',
      time: 'Yesterday, 2:30 PM',
      instructor: 'Prof. Jennifer Lee',
      content: 'We will have a guest lecture on Big Data Analytics next Monday. Attendance is mandatory as the content will be included in the final exam.'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (hidden by default on small screens) */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform ease-in-out duration-300`}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        {/* Header with Hamburger Icon */}
        <div className="flex items-center justify-between bg-white shadow-md p-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MdMenu size={30} />
          </button>
          <Header />
        </div>

        {/* Header for desktop */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's an overview of your academic progress.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>

            {/* Two-Column Layout for Desktop, Single Column for Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 gap-6">
                  <UpcomingAssignments assignments={assignments} />
                  <CourseProgress courses={courses} />
                </div>
              </div>
              <div className="space-y-6">
                <TodaySchedule schedule={schedule} />
                <RecentAnnouncements announcements={announcements} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
