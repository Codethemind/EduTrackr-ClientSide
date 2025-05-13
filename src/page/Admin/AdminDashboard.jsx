import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance.jsx";
import Sidebar from "../../components/admin/Commen/Sidebar.jsx";
import Header from "../../components/admin/Commen/Header.jsx";
import StatCard from "../../components/admin/Commen/StatCard.jsx";
import UserTable from "../../components/admin/Dashboard/UserTable.jsx";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const auth = useSelector((state) => state.auth);
  const [dashboardStats, setDashboardStats] = useState({
    users: { count: 0, trend: 0 },
    courses: { count: 0, trend: 0 },
    assignments: { count: 0, trend: 0 },
    resources: { count: 0, trend: 0 },
  });
  const [userRoleCounts, setUserRoleCounts] = useState({
    admin: 0,
    teacher: 0,
    student: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, adminRes, teacherRes] = await Promise.all([
          axios.get("/api/students/"),
          axios.get("/api/admins/"),
          axios.get("/api/teachers/"),
        ]);

        const students = studentRes.data?.data || [];
        const admins = adminRes.data?.data || [];
        const teachers = teacherRes.data?.data || [];

        const counts = {
          student: students.length,
          teacher: teachers.length,
          admin: admins.length,
          total: students.length + teachers.length + admins.length,
        };

        setUserRoleCounts(counts);

        setDashboardStats((prev) => ({
          ...prev,
          users: { count: counts.total, trend: 5 },
          courses: { count: 20, trend: 3 },
          assignments: { count: 50, trend: -2 },
          resources: { count: 100, trend: 7 },
        }));

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load live data. Showing fallback data.");
        setDashboardStats({
          users: { count: 145, trend: 12 },
          courses: { count: 32, trend: 8 },
          assignments: { count: 78, trend: -3 },
          resources: { count: 254, trend: 15 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const getTrendDirection = (value) => (value >= 0 ? "up" : "down");
  const formatTrendValue = (value) => `${Math.abs(value)}% since last month`;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-100 to-gray-50">
      {/* Sidebar for mobile (with overlay) */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      
      {/* Sidebar for desktop */}
      <div className="hidden lg:block">
        <Sidebar activePage="dashboard" />
      </div>
      
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <Sidebar activePage="dashboard" onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 pl-0 lg:pl-64">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <section className="p-4 sm:p-6 lg:p-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="mb-6 text-sm sm:text-base text-gray-500">
            Welcome back, Admin! Here's what's happening today.
          </p>

          {error && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded">
              <p className="text-yellow-700 font-semibold text-sm">{error}</p>
              <p className="text-yellow-600 text-xs">Fallback data may not be real-time.</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  icon="users"
                  iconColor="blue"
                  value={formatNumber(userRoleCounts.total)}
                  label="Total Users"
                  trend={getTrendDirection(dashboardStats.users.trend)}
                  trendValue={formatTrendValue(dashboardStats.users.trend)}
                  gradient="from-blue-50 to-blue-100"
                />
                <StatCard
                  icon="school"
                  iconColor="green"
                  value={formatNumber(userRoleCounts.student)}
                  label="Students"
                  trend="up"
                  trendValue="Active students"
                  gradient="from-green-50 to-green-100"
                />
                <StatCard
                  icon="user-star"
                  iconColor="purple"
                  value={formatNumber(userRoleCounts.teacher)}
                  label="Teachers"
                  trend="up"
                  trendValue="Active teachers"
                  gradient="from-purple-50 to-purple-100"
                />
                <StatCard
                  icon="user-shield"
                  iconColor="red"
                  value={formatNumber(userRoleCounts.admin)}
                  label="Admins"
                  trend="up"
                  trendValue="System admins"
                  gradient="from-red-50 to-red-100"
                />
              </div>

              {/* User Distribution & Platform Statistics */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">User Distribution</h3>
                  <div className="space-y-4">
                    {["student", "teacher", "admin"].map((role) => (
                      <div key={role} className="flex justify-between items-center">
                        <span className="capitalize text-gray-600 text-sm sm:text-base">{role}s</span>
                        <div className="flex items-center">
                          <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2.5 mr-2 sm:mr-3">
                            <div
                              className={`h-2.5 rounded-full ${
                                role === "student"
                                  ? "bg-green-500"
                                  : role === "teacher"
                                  ? "bg-purple-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${
                                  userRoleCounts.total
                                    ? (userRoleCounts[role] / userRoleCounts.total) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {userRoleCounts.total
                              ? Math.round((userRoleCounts[role] / userRoleCounts.total) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Platform Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg text-center">
                      <div className="text-xl sm:text-2xl font-bold text-indigo-700">
                        {formatNumber(dashboardStats.courses.count)}
                      </div>
                      <div className="text-xs sm:text-sm text-indigo-600">Active Courses</div>
                    </div>
                    <div className="bg-amber-50 p-3 sm:p-4 rounded-lg text-center">
                      <div className="text-xl sm:text-2xl font-bold text-amber-700">
                        {formatNumber(dashboardStats.assignments.count)}
                      </div>
                      <div className="text-xs sm:text-sm text-amber-600">Assignments</div>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-700">
                        {formatNumber(dashboardStats.resources.count)}
                      </div>
                      <div className="text-xs sm:text-sm text-green-600">Resources</div>
                    </div>
                    <div className="bg-pink-50 p-3 sm:p-4 rounded-lg text-center">
                      <div className="text-xl sm:text-2xl font-bold text-pink-700">
                        {formatNumber(dashboardStats.users.count)}
                      </div>
                      <div className="text-xs sm:text-sm text-pink-600">Users</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Table */}
              <div className="mt-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Recent Users</h3>
                <div className="overflow-x-auto">
                  <UserTable />
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;