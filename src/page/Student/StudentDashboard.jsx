import React from 'react';
import Sidebar from '../../components/student/Common/Sidebar';
import Header from '../../components/student/Common/Header';
import StatsCard from '../../components/student/Dashboard/StatsCard';
import CourseProgress from '../../components/student/Dashboard/CourseProgress';
import UpcomingAssignments from '../../components/student/Dashboard/UpcomingAssignments';
import TodaySchedule from '../../components/student/Dashboard/TodaySchedule';
import RecentAnnouncements from '../../components/student/Dashboard/RecentAnnouncements';
import { MdSchool, MdAssignment, MdTrendingUp } from 'react-icons/md';

const Dashboard = () => {
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's an overview of your academic progress.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Three Column Layout */}
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
        
      </main>
    </div>
  );
};

export default Dashboard; 