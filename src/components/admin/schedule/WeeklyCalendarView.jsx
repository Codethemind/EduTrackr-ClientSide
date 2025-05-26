import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, BookOpen, Filter } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSchedules } from '../../../redux/slices/scheduleSlice';
import axios from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const WeeklyCalendarView = () => {
  const dispatch = useDispatch();
  const { schedules = [], loading: scheduleLoading } = useSelector((state) => state.schedule);
  console.log('Redux schedules:', schedules); // Debug Redux state

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [];

  // Generate time slots from 8 AM to 6 PM (30-minute intervals)
  for (let hour = 8; hour <= 18; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    timeSlots.push(`${formattedHour}:00`);
    if (hour < 18) timeSlots.push(`${formattedHour}:30`);
  }

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(''); // Department filter
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all required data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch schedules using Redux
        const response = await dispatch(fetchAllSchedules()).unwrap();
        console.log('Schedules response:', response); // Debug response

        // Ensure response is an array
        const schedulesArray = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        if (!schedulesArray.length) {
          console.warn('No schedules found in response');
        }

        // Fetch departments, courses, teachers
        const [deptResponse, courseResponse, teacherResponse] = await Promise.all([
          axios.get('/api/departments'),
          axios.get('/api/courses'),
          axios.get('/api/teachers'),
        ]);

        if (deptResponse.data.success) {
          const fetchedDepartments = deptResponse.data.data;
          setDepartments(fetchedDepartments);
          // Set first department as default if available
          if (fetchedDepartments.length > 0) {
            setSelectedDepartment(fetchedDepartments[0]._id);
            console.log('Selected first department:', fetchedDepartments[0].name); // Debug
          }
        }
        if (courseResponse.data.success) {
          setCourses(courseResponse.data.data);
        }
        if (teacherResponse.data.success) {
          setTeachers(teacherResponse.data.data);
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

  // Handle department filter change
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    console.log('Selected department ID:', e.target.value); // Debug
  };

  // Clear department filter
  const clearFilter = () => {
    setSelectedDepartment('');
    console.log('Department filter cleared'); // Debug
  };

  // Get count of active departments
  const getActiveDepartmentsCount = () => {
    if (!Array.isArray(schedules)) return 0;
    const activeDepartmentIds = new Set();
    schedules.forEach((schedule) => {
      const deptId = schedule.departmentId?._id || schedule.departmentId?.id || schedule.departmentId;
      if (deptId) activeDepartmentIds.add(deptId);
    });
    return activeDepartmentIds.size;
  };

  // Get count of active courses
  const getActiveCoursesCount = () => {
    if (!Array.isArray(schedules)) return 0;
    const activeCourseIds = new Set();
    schedules.forEach((schedule) => {
      const courseId = schedule.courseId?._id || schedule.courseId?.id || schedule.courseId;
      if (courseId) activeCourseIds.add(courseId);
    });
    return activeCourseIds.size;
  };

  // Get count of active teachers
  const getActiveTeachersCount = () => {
    if (!Array.isArray(schedules)) return 0;
    const activeTeacherIds = new Set();
    schedules.forEach((schedule) => {
      const teacherId = schedule.teacherId?._id || schedule.teacherId?.id || schedule.teacherId;
      if (teacherId) activeTeacherIds.add(teacherId);
    });
    return activeTeacherIds.size;
  };

  // Helper function to get schedules for a specific day and time
  const getSchedulesForSlot = (day, timeSlot) => {
    if (!Array.isArray(schedules)) return [];
    const matchingSchedules = schedules.filter((schedule) => {
      const isDayMatch = schedule.day === day;
      const isDepartmentMatch = !selectedDepartment || 
        (schedule.departmentId?._id || schedule.departmentId?.id || schedule.departmentId) === selectedDepartment;
      const slotTime = convertTimeToMinutes(timeSlot);
      const startTime = convertTimeToMinutes(schedule.startTime);
      const endTime = convertTimeToMinutes(schedule.endTime);
      const isTimeMatch = slotTime >= startTime && slotTime < endTime;
      console.log(
        `Checking schedule: ${schedule._id || 'no-id'}, Day: ${isDayMatch}, Dept: ${isDepartmentMatch}, Time: ${isTimeMatch}`
      );
      return isDayMatch && isDepartmentMatch && isTimeMatch;
    });
    console.log(`Schedules for ${day} at ${timeSlot}:`, matchingSchedules);
    return matchingSchedules;
  };

  // Convert time string (HH:MM) to minutes for comparison
  const convertTimeToMinutes = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // Check if this timeslot is the start of a class
  const isClassStart = (schedule, timeSlot) => {
    return schedule.startTime === timeSlot;
  };

  // Calculate how many rows (time slots) a class should span
  const calculateTimeSlotSpan = (startTime, endTime) => {
    const start = convertTimeToMinutes(startTime);
    const end = convertTimeToMinutes(endTime);
    return Math.ceil((end - start) / 30);
  };

  // Get a CSS class based on department for color coding
  const getDepartmentColorClass = (departmentId) => {
    const department = departments.find(
      (d) => d._id === (departmentId?._id || departmentId?.id || departmentId)
    );
    const departmentName = department?.name || 'Unknown';
    const departmentColors = {
      'Computer Science': 'bg-blue-50 border-blue-200 text-blue-800',
      'Business Administration': 'bg-green-50 border-green-200 text-green-800',
      'Engineering': 'bg-purple-50 border-blue-200 text-blue-800',
      'Arts & Humanities': 'bg-yellow-50 border-blue-200 text-blue-800',
      'Mathematics': 'bg-red-50 border-blue-200 text-blue-800',
      'Science': 'bg-indigo-50 border-blue-200 text-blue-800',
    };
    return departmentColors[departmentName] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  // Get schedule details for display
  const getScheduleDetails = (schedule) => {
    const course = courses.find((c) => c._id === (schedule.courseId?._id || schedule.courseId?.id || schedule.courseId));
    const teacher = teachers.find((t) => t._id === (schedule.teacherId?._id || schedule.teacherId?.id || schedule.teacherId));
    const department = departments.find(
      (d) => d._id === (schedule.departmentId?._id || schedule.departmentId?.id || schedule.departmentId)
    );

    return {
      courseCode: course?.code || schedule.courseId?.code || 'N/A',
      courseName: course?.name || schedule.courseId?.name || 'Unknown Course',
      teacherName: teacher
        ? `${teacher.firstname} ${teacher.lastname}`
        : schedule.teacherId
        ? `${schedule.teacherId.firstname} ${schedule.teacherId.lastname}`
        : 'TBA',
      departmentName: department?.name || schedule.departmentId?.name || 'Unknown Dept',
      semester: schedule.courseId?.semester || 'N/A',
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
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Details</h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
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
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Semester</p>
                <p className="text-sm text-gray-600">{details.semester}</p>
              </div>
            </div>
          </div>
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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Weekly Schedule</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-grow">
              <label htmlFor="department-filter" className="sr-only">Filter by Department</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="department-filter"
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  className="pl-10 w-full sm:w-64 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedDepartment && (
              <button
                onClick={clearFilter}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
            <p className="text-2xl font-bold text-blue-800">{getActiveCoursesCount()}</p>
            <p className="text-xs text-blue-500 mt-1">of {courses.length} total</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Time
                </th>
                {daysOfWeek.map((day) => (
                  <th
                    key={day}
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {timeSlots.map((timeSlot, index) => (
                <tr key={timeSlot} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                    {timeSlot}
                  </td>
                  {daysOfWeek.map((day) => {
                    const schedulesForSlot = getSchedulesForSlot(day, timeSlot);
                    if (schedulesForSlot.length === 0) {
                      return <td key={`${day}-${timeSlot}`} className="border border-gray-100 px-2 py-2 h-12"></td>;
                    }
                    const startingClasses = schedulesForSlot.filter((schedule) => isClassStart(schedule, timeSlot));
                    if (startingClasses.length === 0) {
                      return <td key={`${day}-${timeSlot}`} className="border border-gray-100"></td>;
                    }
                    return (
                      <td key={`${day}-${timeSlot}`} className="border border-gray-100 px-1 py-1 relative">
                        {startingClasses.map((schedule) => {
                          const rowSpan = calculateTimeSlotSpan(schedule.startTime, schedule.endTime);
                          const colorClass = getDepartmentColorClass(schedule.departmentId);
                          const details = getScheduleDetails(schedule);
                          return (
                            <div
                              key={schedule._id || `${day}-${timeSlot}-${details.courseCode}`}
                              className={`p-2 border rounded-md cursor-pointer hover:shadow-md transition-all duration-200 ${colorClass}`}
                              style={{
                                minHeight: `${rowSpan * 3}rem`,
                                position: 'absolute',
                                top: 0,
                                left: '4px',
                                right: '4px',
                                zIndex: 1,
                              }}
                              onClick={() => handleScheduleClick(schedule)}
                            >
                              <div className="text-xs font-semibold truncate">{details.courseCode}</div>
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

        {schedules.length === 0 && (
          <div className="text-center py-8">
            {console.log('No schedules in state')} {/* Debug no schedules */}
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No schedules found</p>
            <p className="text-gray-400 text-sm">Schedules will appear here once they are created</p>
          </div>
        )}
      </div>

      {isModalOpen && <ScheduleModal />}
    </>
  );
};

export default WeeklyCalendarView;