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
            ) : daysOfWeek.map((day) => (
              schedulesByDay[day] && schedulesByDay[day].length > 0 && (
                <div key={day} className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">{day}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedulesByDay[day].map((schedule) => (
                      <div key={schedule._id} className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-bold mb-2">{schedule.courseId?.name || 'N/A'}</h3>
                        <p className="text-gray-600 mb-2">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </p>
                        <p className="text-gray-500 mb-4">
                          Teacher: {schedule.teacherId?.name || 'N/A'}
                        </p>
                        <button
                          onClick={() => handleJoinClass(schedule)}
                          disabled={!isClassActive(schedule)}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                            isClassActive(schedule)
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isClassActive(schedule) ? 'Join Live Class' : 'Class Not Live'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </main>
        {isVideoCallActive && currentChannel && (
          <VideoCall
            channelName={currentChannel}
            onLeave={handleLeaveVideoCall}
            isStudent={true}
          />
        )}
      </div>
    </div>
  );
};

export default StudentClassesPage;