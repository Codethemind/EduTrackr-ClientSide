import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/Common/Sidebar';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const StudentClassesPage = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [studentSchedules, setStudentSchedules] = useState([]);
  const [studentDepartment, setStudentDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch student's department and schedules
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      const studentId = authState?.user?._id || authState?.user?.id;
      const accessToken = authState?.accessToken;
      
      console.log('Auth State:', { 
        studentId, 
        hasToken: !!accessToken, 
        user: authState?.user 
      });
      
      if (!studentId || !accessToken) {
        console.log('Missing required auth data:', { studentId, hasToken: !!accessToken });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching student data for ID:', studentId);
        
        // First, get student's department information
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        console.log('Student Response:', studentResponse.data);

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;
          console.log('Student Data:', student);
          setStudentDepartment(student);

          // Then fetch schedules for student's department
          if (student.departmentId) {
            console.log('Fetching schedules for department:', student.departmentName);
            
            const schedulesResponse = await axios.get(`/api/schedules/department/${student.departmentId}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });

            console.log('Schedules Response:', schedulesResponse.data);

            if (schedulesResponse.data.success) {
              console.log('Schedule Data:', schedulesResponse.data.data);
              setStudentSchedules(schedulesResponse.data.data);
            } else {
              console.error('Schedule API returned success: false');
              toast.error('Failed to load schedule data');
            }
          } else {
            console.error('Student has no department ID');
            toast.error('Student department not found');
          }
        } else {
          console.error('Student API returned success: false');
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

  // Group schedules by day
  const schedulesByDay = studentSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.day]) {
      acc[schedule.day] = [];
    }
    acc[schedule.day].push(schedule);
    return acc;
  }, {});

  // Sort schedules by time within each day
  Object.keys(schedulesByDay).forEach(day => {
    schedulesByDay[day].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  });

  // Days of the week in order
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header role="student" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Timetable</h1>
                  {studentDepartment && (
                    <div className="flex items-center space-x-4">
                      <p className="text-gray-600">
                        Department: <span className="font-semibold text-blue-600">{studentDepartment.departmentName}</span>
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
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Timetable Content */}
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
                <p className="text-gray-600">No schedules found for your department at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {daysOfWeek.map(day => (
                  <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center justify-between">
                        {day}
                        <span className="text-sm font-normal text-blue-100">
                          {schedulesByDay[day]?.length || 0} classes
                        </span>
                      </h3>
                    </div>

                    {/* Classes List */}
                    <div className="p-6">
                      {schedulesByDay[day]?.length > 0 ? (
                        <div className="space-y-4">
                          {schedulesByDay[day].map((schedule, index) => (
                            <div 
                              key={schedule._id} 
                              className="border-l-4 border-green-500 bg-green-50 rounded-r-lg p-4 hover:shadow-md transition-shadow duration-200"
                            >
                              {/* Course Name & Code */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                                    {schedule.courseId?.name || 'Course Name Not Available'}
                                  </h4>
                                  {schedule.courseId?.code && (
                                    <p className="text-sm font-medium text-green-700 mt-1">
                                      Course ID: {schedule.courseId.code}
                                    </p>
                                  )}
                                </div>
                                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Class {index + 1}
                                </span>
                              </div>

                              {/* Time Information */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div className="flex items-center text-sm text-gray-700">
                                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  <span className="font-medium">
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                  </svg>
                                  <span className="font-medium">
                                    Room: {schedule.room || 'TBA'}
                                  </span>
                                </div>
                              </div>

                              {/* Teacher Information */}
                              <div className="flex items-center justify-between pt-3 border-t border-green-200">
                                <div className="flex items-center text-sm">
                                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                  </svg>
                                  <span className="text-gray-600">Instructor: </span>
                                  <span className="font-semibold text-blue-700 ml-1">
                                    {schedule.teacherId?.name || 'To Be Announced'}
                                  </span>
                                </div>
                                
                                {/* Additional Course Info */}
                                {schedule.courseId?.credits && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                    {schedule.courseId.credits} Credits
                                  </span>
                                )}
                              </div>

                              {/* Course Description (if available) */}
                              {schedule.courseId?.description && (
                                <div className="mt-3 pt-3 border-t border-green-200">
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {schedule.courseId.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
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

            {/* Schedule Summary */}
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
                      {new Set(studentSchedules.map(s => s.courseId?.code)).size}
                    </div>
                    <div className="text-sm text-gray-600">Unique Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(studentSchedules.map(s => s.teacherId?.name)).size}
                    </div>
                    <div className="text-sm text-gray-600">Instructors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Object.keys(schedulesByDay).filter(day => schedulesByDay[day].length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Active Days</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentClassesPage;