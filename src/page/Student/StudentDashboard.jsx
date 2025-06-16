import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/student/Common/Sidebar';
import Header from '../../components/student/Common/Header';
import StatsCard from '../../components/student/Dashboard/StatsCard';
import UpcomingAssignments from '../../components/student/Dashboard/UpcomingAssignments';
import TodaySchedule from '../../components/student/Dashboard/TodaySchedule';
import AssignmentDetailModal from '../../components/student/assignments/AssignmentDetailModal';
import { MdSchool, MdAssignment, MdTrendingUp, MdMenu } from 'react-icons/md';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const authState = useSelector((state) => state.auth);
  const studentId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!studentId || !accessToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;

          const assignmentsResponse = await axios.get(
            `/api/assignments/department/${student.departmentId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          const schedulesResponse = await axios.get(
            `/api/schedules/department/${student.departmentId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (assignmentsResponse.data.success && schedulesResponse.data.success) {
            const assignments = assignmentsResponse.data.data;
            const schedules = schedulesResponse.data.data;

            const pendingAssignments = assignments.filter(
              (a) => !a.submissions?.some((s) => s.studentId === studentId) && new Date(a.dueDate) >= new Date()
            ).length;

            const activeCourses = new Set(schedules.map((s) => s.courseId?._id)).size;

            setStats([
              {
                title: 'Active Courses',
                value: activeCourses,
                trend: 'up',
                trendValue: `${activeCourses} this semester`,
                icon: MdSchool,
              },
              {
                title: 'Pending Assignments',
                value: pendingAssignments,
                trend: 'up',
                trendValue: `${pendingAssignments} due`,
                icon: MdAssignment,
              },
              {
                title: 'GPA',
                value: 'N/A',
                trend: 'up',
                trendValue: 'Current semester',
                icon: MdTrendingUp,
              },
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [studentId, accessToken]);

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  const handleStartSubmission = (assignment) => {
    // Navigate to assignments page for submission
    window.location.href = `/student/assignments/${assignment._id}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform ease-in-out duration-300`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        <div className="flex items-center justify-between bg-white shadow-md p-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MdMenu size={30} />
          </button>
          <Header role="student" />
        </div>

        <div className="hidden md:block">
          <Header role="student" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's an overview of your academic progress.</p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 gap-6">
                      <UpcomingAssignments onView={handleViewAssignment} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <TodaySchedule />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isDetailModalOpen && selectedAssignment && (
        <AssignmentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
          onStartSubmission={handleStartSubmission}
        />
      )}
    </div>
  );
};

export default Dashboard;