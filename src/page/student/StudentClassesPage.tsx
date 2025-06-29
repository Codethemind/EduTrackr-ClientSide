import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/Common/Sidebar';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import VideoCall from '../../components/common/VideoCall';

const StudentClassesPage = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [studentSchedules, setStudentSchedules] = useState([]);
  const [studentDepartment, setStudentDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);

  useEffect(() => {
    console.log('Initial state:', { isVideoCallActive, currentChannel });
    setIsVideoCallActive(false);
    setCurrentChannel(null);

    const fetchStudentSchedules = async () => {
      const studentId = authState?.user?._id || authState?.user?.id;
      const accessToken = authState?.accessToken;

      console.log('Auth State:', authState);

      if (!studentId || !accessToken) {
        console.log('Missing required auth data:', { studentId, hasToken: !!accessToken });
        toast.error('Please log in to view your timetable.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${authState.accessToken}` },
        });

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;
          setStudentDepartment(student);

          if (student.departmentId) {
            const schedulesResponse = await axios.get(`/api/schedules/department/${student.departmentId}`, {
              headers: { Authorization: `Bearer ${authState.accessToken}` },
            });

            if (schedulesResponse.data.success) {
              console.log('Student Schedules:', schedulesResponse.data.data);
              setStudentSchedules(schedulesResponse.data.data);
            } else {
              toast.error('Failed to load schedule data');
            }
          } else {
            toast.error('Student department not found');
          }
        } else {
          toast.error('Failed to load student information');
        }
      } catch (error) {
        console.error('Error fetching student schedules:', error.response?.data || error.message);
        toast.error(`Failed to load schedule: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentSchedules();
  }, [authState]);

  const handleJoinClass = (schedule) => {
    console.log('Joining class:', schedule);
    if (!schedule._id) {
      toast.error('Invalid class ID');
      return;
    }
    setCurrentChannel(`class_${schedule._id}`);
    setIsVideoCallActive(true);
  };

  const handleLeaveVideoCall = () => {
    setIsVideoCallActive(false);
    setCurrentChannel(null);
  };

  const schedulesByDay = studentSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.day]) {
      acc[schedule.day] = [];
    }
    acc[schedule.day].push(schedule);
    return acc;
  }, {});

  Object.keys(schedulesByDay).forEach((day) => {
    schedulesByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatTime = (time) => {
    if (!time) return 'N/A';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (error) {
      return time;
    }
  };

  const isClassActive = (schedule) => {
    console.log('Checking class activity:', { schedule });
    return schedule.isLive || false; // Use isLive to determine if class is active
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header role="student" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Timetable</h1>
                  {studentDepartment && (
                    <div className="flex items-center space-x-4">
                      <p className="text-gray-600">
                        Department: <span className="font-semibold text-blue-600">{studentDepartment.departmentName || 'N/A'}</span>
                      </p>
                      {studentDepartment.code && (
                        <p className="text-gray-600">
                          Code: <span className="font-medium text-gray-800">{studentDepartment.code}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Academic Schedule</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-lg text-gray-600">Loading your timetable...</p>
              </div>
            ) : studentSchedules.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Scheduled</h3>
                <p className="text-gray-600">No schedules found for your department. Please contact your administrator if you believe this is an error.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {daysOfWeek.map((day) => (
                  <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center justify-between">
                        {day}
                        <span className="text-sm font-normal text-blue-100">{schedulesByDay[day]?.length || 0} classes</span>
                      </h3>
                    </div>
                    <div className="p-6">
                      {schedulesByDay[day]?.length > 0 ? (
                        <div className="space-y-4">
                          {schedulesByDay[day].map((schedule, index) => {
                            const isActive = isClassActive(schedule);
                            return (
                              <div
                                key={schedule._id}
                                className={`border-l-4 ${isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'} rounded-r-lg p-4 hover:shadow-md transition-shadow duration-200`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                                      {schedule.courseId?.name || 'Course Name Not Available'}
                                    </h4>
                                    {schedule.courseId?.code && (
                                      <p className="text-sm font-medium text-blue-700 mt-1">Course ID: {schedule.courseId.code}</p>
                                    )}
                                  </div>
                                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Class {index + 1}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                  <div className="flex items-center text-sm text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span className="font-medium">
                                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    <span className="font-medium">Room: {schedule.room || 'TBA'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                  <div className="flex items-center space-x-4">
                                    {schedule.teacherId?.name && (
                                      <div className="flex items-center text-sm text-gray-700">
                                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        <span>{schedule.teacherId.name}</span>
                                      </div>
                                    )}
                                    {isActive && (
                                      <div className="flex items-center space-x-2">
                                        <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-green-700">Live Now</span>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleJoinClass(schedule)}
                                    disabled={!isActive}
                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white transition-colors duration-200 ${
                                      isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                    Join Live Class
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p className="mt-2 text-gray-500 font-medium">No classes scheduled</p>
                          <p className="text-xs text-gray-400">Enjoy your free day!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && studentSchedules.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{studentSchedules.length}</div>
                    <div className="text-sm text-gray-600">Total Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {new Set(studentSchedules.map((s) => s.courseId?.code)).size}
                    </div>
                    <div className="text-sm text-gray-600">Unique Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(studentSchedules.map((s) => s.teacherId?.name)).size}
                    </div>
                    <div className="text-sm text-gray-600">Instructors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Object.keys(schedulesByDay).filter((day) => schedulesByDay[day].length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Active Days</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        {isVideoCallActive && currentChannel && (
          <VideoCall channelName={currentChannel} onLeave={handleLeaveVideoCall} />
        )}
      </div>
    </div>
  );
};

export default StudentClassesPage;