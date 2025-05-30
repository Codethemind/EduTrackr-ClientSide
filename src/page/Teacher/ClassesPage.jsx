import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ClassesPage = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [teacherSchedules, setTeacherSchedules] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch teacher's schedules and student counts
  useEffect(() => {
    const fetchTeacherData = async () => {
      const teacherId = authState?.user?._id || authState?.user?.id;
      const accessToken = authState?.accessToken;
      
      if (!teacherId || !accessToken) {
        console.log('Missing required auth data:', { teacherId, hasToken: !!accessToken });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch teacher info
        const teacherResponse = await axios.get(`/api/teachers/${teacherId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (teacherResponse.data.success) {
          setTeacherInfo(teacherResponse.data.data);
        }

        // Fetch teacher schedules
        const schedulesResponse = await axios.get(`/api/schedules/teacher/${teacherId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (schedulesResponse.data.success) {
          setTeacherSchedules(schedulesResponse.data.data);
          
          // Fetch student counts for each course/department combination
          const counts = {};
          for (const schedule of schedulesResponse.data.data) {
            if (schedule.departmentId?._id && !counts[schedule.departmentId._id]) {
              try {
                const studentsResponse = await axios.get(`/api/students/department/${schedule.departmentId._id}`, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                });
                
                if (studentsResponse.data.success) {
                  counts[schedule.departmentId._id] = studentsResponse.data.data.length;
                }
              } catch (error) {
                console.error('Error fetching student count:', error);
                counts[schedule.departmentId._id] = 0;
              }
            }
          }
          setStudentCounts(counts);
        } else {
          toast.error('Failed to load schedule data');
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        toast.error('Failed to load schedule');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [authState]);

  // Group schedules by day and sort by time
  const schedulesByDay = teacherSchedules.reduce((acc, schedule) => {
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
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Teaching Schedule</h1>
                  {teacherInfo && (
                    <div className="flex items-center space-x-4">
                      <p className="text-gray-600">
                        Instructor: <span className="font-semibold text-blue-600">{teacherInfo.username}</span>
                      </p>
                      {teacherInfo.email && (
                        <p className="text-gray-600">
                          Email: <span className="font-medium text-gray-800">{teacherInfo.email}</span>
                        </p>
                      )}
                      {teacherInfo.departmentId?.name && (
                        <p className="text-gray-600">
                          Department: <span className="font-medium text-gray-800">{teacherInfo.departmentId.name}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Teaching Schedule</p>
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
                <p className="mt-4 text-lg text-gray-600">Loading your teaching schedule...</p>
              </div>
            ) : teacherSchedules.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Assigned</h3>
                <p className="text-gray-600">No teaching schedules found at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {daysOfWeek.map(day => (
                  <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center justify-between">
                        {day}
                        <span className="text-sm font-normal text-green-100">
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
                              className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4 hover:shadow-md transition-shadow duration-200"
                            >
                              {/* Course Name */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                                    {schedule.courseId?.name || 'Course Name Not Available'}
                                  </h4>
                                  {schedule.courseId?.code && (
                                    <p className="text-sm font-medium text-blue-700 mt-1">
                                      Course Code: {schedule.courseId.code}
                                    </p>
                                  )}
                                </div>
                                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Period {index + 1}
                                </span>
                              </div>

                              {/* Time and Room */}
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

                              {/* Department and Student Count */}
                              <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                                <div className="flex items-center text-sm">
                                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h5"></path>
                                  </svg>
                                  <span className="text-gray-600">Department: </span>
                                  <span className="font-semibold text-gray-800 ml-1">
                                    {schedule.departmentId?.name || 'Not Assigned'}
                                  </span>
                                </div>
                                
                                {/* Student Count */}
                                <div className="flex items-center text-sm">
                                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                  </svg>
                                  <span className="font-bold text-purple-700">
                                    {studentCounts[schedule.departmentId?._id] || 0} Students
                                  </span>
                                </div>
                              </div>

                              {/* Course Credits and Additional Info */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
                                {schedule.courseId?.credits && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                                    {schedule.courseId.credits} Credit Hours
                                  </span>
                                )}
                                
                                {schedule.courseId?.type && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                    {schedule.courseId.type}
                                  </span>
                                )}
                              </div>

                              {/* Course Description */}
                              {schedule.courseId?.description && (
                                <div className="mt-3 pt-3 border-t border-blue-200">
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
                          <p className="text-xs text-gray-400">Free day for preparation!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Teaching Summary */}
            {!isLoading && teacherSchedules.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{teacherSchedules.length}</div>
                    <div className="text-sm text-gray-600">Total Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {new Set(teacherSchedules.map(s => s.courseId?.code)).size}
                    </div>
                    <div className="text-sm text-gray-600">Unique Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.values(studentCounts).reduce((total, count) => total + count, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {new Set(teacherSchedules.map(s => s.departmentId?.name)).size}
                    </div>
                    <div className="text-sm text-gray-600">Departments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Object.keys(schedulesByDay).filter(day => schedulesByDay[day].length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Teaching Days</div>
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

export default ClassesPage;