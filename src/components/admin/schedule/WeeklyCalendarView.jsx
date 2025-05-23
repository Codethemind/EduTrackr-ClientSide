// components/admin/schedule/WeeklyCalendarView.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar, Clock, User, MapPin, BookOpen } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSchedules } from '../../../redux/slices/scheduleSlice';
import axios from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const WeeklyCalendarView = () => {
  const dispatch = useDispatch();
  const { schedules = [], loading: scheduleLoading } = useSelector((state) => state.schedule);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [];
  
  // Generate time slots from 8 AM to 6 PM
  for (let hour = 8; hour <= 18; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    timeSlots.push(`${formattedHour}:00`);
    if (hour < 18) timeSlots.push(`${formattedHour}:30`);
  }
  
  const [currentSemester, setCurrentSemester] = useState('Spring 2025');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const semesters = ['Spring 2025', 'Summer 2025', 'Fall 2025'];
  
  // Fetch all required data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch schedules using Redux
        await dispatch(fetchAllSchedules()).unwrap();
        
        // Fetch departments, courses, teachers, and rooms
        const [deptResponse, courseResponse, teacherResponse, roomResponse] = await Promise.all([
          axios.get('/api/departments'),
          axios.get('/api/courses'),
          axios.get('/api/teachers'),
          axios.get('/api/rooms')
        ]);
        
        if (deptResponse.data.success) {
          setDepartments(deptResponse.data.data);
        }
        
        if (courseResponse.data.success) {
          setCourses(courseResponse.data.data);
        }
        
        if (teacherResponse.data.success) {
          setTeachers(teacherResponse.data.data);
        }
        
        if (roomResponse.data.success) {
          setRooms(roomResponse.data.data);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load schedule data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);
  
  // Get count of active departments (departments that have scheduled classes)
  const getActiveDepartmentsCount = () => {
    if (!Array.isArray(schedules)) return 0;
    
    const activeDepartmentIds = new Set();
    schedules.forEach(schedule => {
      const deptId = schedule.departmentId?._id || schedule.departmentId;
      if (deptId) {
        activeDepartmentIds.add(deptId);
      }
    });
    return activeDepartmentIds.size;
  };

  // Get count of active courses (courses that are scheduled)
  const getActiveCoursesCount = () => {
    if (!Array.isArray(schedules)) return 0;
    
    const activeCourseIds = new Set();
    schedules.forEach(schedule => {
      const courseId = schedule.courseId?._id || schedule.courseId;
      if (courseId) {
        activeCourseIds.add(courseId);
      }
    });
    return activeCourseIds.size;
  };

  // Get count of active teachers (teachers who have scheduled classes)
  const getActiveTeachersCount = () => {
    if (!Array.isArray(schedules)) return 0;
    
    const activeTeacherIds = new Set();
    schedules.forEach(schedule => {
      const teacherId = schedule.teacherId?._id || schedule.teacherId;
      if (teacherId) {
        activeTeacherIds.add(teacherId);
      }
    });
    return activeTeacherIds.size;
  };

  // Helper function to get schedules for a specific day and time
  const getSchedulesForSlot = (day, timeSlot) => {
    if (!Array.isArray(schedules)) return [];
    
    return schedules.filter(schedule => {
      if (schedule.day !== day) {
        return false;
      }
      
      const slotTime = convertTimeToMinutes(timeSlot);
      const startTime = convertTimeToMinutes(schedule.startTime);
      const endTime = convertTimeToMinutes(schedule.endTime);
      
      return slotTime >= startTime && slotTime < endTime;
    });
  };
  
  // Convert time string (HH:MM) to minutes for comparison
  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Check if this timeslot is the start of a class
  const isClassStart = (schedule, timeSlot) => {
    return schedule.startTime === timeSlot;
  };
  
  // Calculate how many rows (time slots) a class should span
  const calculateTimeSlotSpan = (startTime, endTime) => {
    const start = convertTimeToMinutes(startTime);
    const end = convertTimeToMinutes(endTime);
    
    // Each slot is 30 minutes
    return Math.ceil((end - start) / 30);
  };
  
  // Get a CSS class based on department for color coding
  const getDepartmentColorClass = (departmentId) => {
    const department = departments.find(d => d._id === departmentId || d._id === departmentId?._id);
    const departmentName = department?.name || 'Unknown';
    
    const departmentColors = {
      'Computer Science': 'bg-blue-50 border-blue-200 text-blue-800',
      'Business Administration': 'bg-green-50 border-green-200 text-green-800',
      'Engineering': 'bg-purple-50 border-purple-200 text-purple-800',
      'Arts & Humanities': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'Mathematics': 'bg-red-50 border-red-200 text-red-800',
      'Science': 'bg-indigo-50 border-indigo-200 text-indigo-800'
    };
    
    return departmentColors[departmentName] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  // Get schedule details for display
  const getScheduleDetails = (schedule) => {
    const course = courses.find(c => c._id === (schedule.courseId?._id || schedule.courseId));
    const teacher = teachers.find(t => t._id === (schedule.teacherId?._id || schedule.teacherId));
    const room = rooms.find(r => r._id === (schedule.roomId?._id || schedule.roomId));
    const department = departments.find(d => d._id === (schedule.departmentId?._id || schedule.departmentId));
    
    return {
      courseCode: course?.code || schedule.courseId?.code || 'N/A',
      courseName: course?.name || schedule.courseId?.name || 'Unknown Course',
      teacherName: teacher ? `${teacher.firstname} ${teacher.lastname}` : 
                   (schedule.teacherId ? `${schedule.teacherId.firstname} ${schedule.teacherId.lastname}` : 'TBA'),
      roomName: room?.name || schedule.roomId?.name || 'Room TBA',
      departmentName: department?.name || schedule.departmentId?.name || 'Unknown Dept'
    };
  };

  // Handle schedule click to open modal
  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  // Render schedule modal
  const ScheduleModal = () => {
    if (!selectedSchedule) return null;
    
    const details = getScheduleDetails(selectedSchedule);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Details</h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{details.courseCode}</p>
                <p className="text-sm text-gray-600">{details.courseName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Instructor</p>
                <p className="text-sm text-gray-600">{details.teacherName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{details.roomName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Schedule</p>
                <p className="text-sm text-gray-600">
                  {selectedSchedule.day} • {selectedSchedule.startTime} - {selectedSchedule.endTime}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">Department</p>
                <p className="text-sm text-gray-600">{details.departmentName}</p>
              </div>
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={closeModal}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading || scheduleLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold mb-3 sm:mb-0">Weekly Schedule</h2>
          
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => {
                const currentIndex = semesters.indexOf(currentSemester);
                if (currentIndex > 0) {
                  setCurrentSemester(semesters[currentIndex - 1]);
                }
              }}
              disabled={semesters.indexOf(currentSemester) === 0}
            >
              <ChevronLeft size={20} className={semesters.indexOf(currentSemester) === 0 ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            
            <span className="text-sm font-medium px-3">{currentSemester}</span>
            
            <button 
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => {
                const currentIndex = semesters.indexOf(currentSemester);
                if (currentIndex < semesters.length - 1) {
                  setCurrentSemester(semesters[currentIndex + 1]);
                }
              }}
              disabled={semesters.indexOf(currentSemester) === semesters.length - 1}
            >
              <ChevronRight size={20} className={semesters.indexOf(currentSemester) === semesters.length - 1 ? 'text-gray-300' : 'text-gray-600'} />
            </button>
          </div>
        </div>
        
        {/* Enhanced Schedule Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Classes</p>
            <p className="text-2xl font-bold text-blue-800">{schedules.length}</p>
            <p className="text-xs text-blue-500 mt-1">Scheduled this week</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Active Departments</p>
            <p className="text-2xl font-bold text-green-800">{getActiveDepartmentsCount()}</p>
            <p className="text-xs text-green-500 mt-1">of {departments.length} total</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">Active Courses</p>
            <p className="text-2xl font-bold text-purple-800">{getActiveCoursesCount()}</p>
            <p className="text-xs text-purple-500 mt-1">of {courses.length} total</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-600 font-medium">Active Teachers</p>
            <p className="text-2xl font-bold text-orange-800">{getActiveTeachersCount()}</p>
            <p className="text-xs text-orange-500 mt-1">of {teachers.length} total</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Time
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {timeSlots.map((timeSlot, index) => (
                <tr 
                  key={timeSlot} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {/* Time Column */}
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                    {timeSlot}
                  </td>
                  
                  {/* Day Columns */}
                  {daysOfWeek.map(day => {
                    const schedulesForSlot = getSchedulesForSlot(day, timeSlot);
                    
                    // If no class at this time slot
                    if (schedulesForSlot.length === 0) {
                      return (
                        <td key={`${day}-${timeSlot}`} className="border border-gray-100 px-2 py-2 h-12"></td>
                      );
                    }
                    
                    // For classes that start at this time slot
                    const startingClasses = schedulesForSlot.filter(schedule => 
                      isClassStart(schedule, timeSlot)
                    );
                    
                    if (startingClasses.length === 0) {
                      return <td key={`${day}-${timeSlot}`} className="border border-gray-100"></td>;
                    }
                    
                    return (
                      <td key={`${day}-${timeSlot}`} className="border border-gray-100 px-1 py-1 relative">
                        {startingClasses.map(schedule => {
                          const rowSpan = calculateTimeSlotSpan(schedule.startTime, schedule.endTime);
                          const colorClass = getDepartmentColorClass(schedule.departmentId);
                          const details = getScheduleDetails(schedule);
                          
                          return (
                            <div 
                              key={schedule._id}
                              className={`p-2 border rounded-md cursor-pointer hover:shadow-md transition-all duration-200 ${colorClass}`}
                              style={{ 
                                minHeight: `${rowSpan * 3}rem`,
                                position: 'absolute',
                                top: 0,
                                left: '4px',
                                right: '4px',
                                zIndex: 1
                              }}
                              onClick={() => handleScheduleClick(schedule)}
                            >
                              <div className="text-xs font-semibold truncate">{details.courseCode}</div>
                              <div className="text-xs truncate mt-1">{details.roomName}</div>
                              <div className="text-xs truncate">{details.teacherName}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Show message if no schedules found */}
        {schedules.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No schedules found</p>
            <p className="text-gray-400 text-sm">Schedules will appear here once they are created</p>
          </div>
        )}
      </div>
      
      {/* Schedule Modal */}
      {isModalOpen && <ScheduleModal />}
    </>
  );
};

export default WeeklyCalendarView;