// components/admin/schedule/DepartmentSchedule.jsx
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSchedules } from '../../../redux/slices/scheduleSlice';
import axios from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const DepartmentSchedule = ({ department }) => {
  const dispatch = useDispatch();
  const { schedules = [], loading: scheduleLoading } = useSelector((state) => state.schedule);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  // Fetch schedules and departments from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch schedules using Redux
        const schedulesResult = await dispatch(fetchAllSchedules()).unwrap();
        console.log('Schedules fetched:', schedulesResult);
        
        // Fetch departments
        const deptResponse = await axios.get('/api/departments');
        console.log('Departments fetched:', deptResponse.data);
        
        if (deptResponse.data.success) {
          setDepartments(deptResponse.data.data);
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

  // Filter schedules based on selected department
  useEffect(() => {
    console.log('Filtering schedules:', { schedules, department, departments });
    
    if (!Array.isArray(schedules)) {
      console.log('Schedules is not an array:', schedules);
      return;
    }

    let result = [...schedules];
    console.log('All schedules:', result);
    
    // Filter by department if one is selected
    if (department) {
      // Find the department ID by name
      const selectedDept = departments.find(dept => dept.name === department);
      console.log('Selected department:', selectedDept);
      
      if (selectedDept) {
        result = result.filter(s => {
          const matches = s.departmentId?._id === selectedDept._id || s.departmentId === selectedDept._id;
          console.log('Schedule department check:', {
            scheduleId: s._id,
            scheduleDeptId: s.departmentId?._id || s.departmentId,
            selectedDeptId: selectedDept._id,
            matches
          });
          return matches;
        });
      } else {
        console.log('Department not found in departments list');
        result = [];
      }
    }
    
    console.log('Filtered schedules:', result);
    setFilteredSchedules(result);
  }, [schedules, department, departments]);
  
  // Helper function to determine if a class is scheduled at a particular time
  const getClassAtTime = (day, time) => {
    return filteredSchedules.find(schedule => {
      if (schedule.day !== day) return false;
      
      const scheduleStart = getMinutesFromTime(schedule.startTime);
      const scheduleEnd = getMinutesFromTime(schedule.endTime);
      const slotTime = getMinutesFromTime(time);
      
      return slotTime >= scheduleStart && slotTime < scheduleEnd;
    });
  };
  
  // Convert time to minutes for easier comparison
  const getMinutesFromTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Get class duration in 30-minute slots
  const getClassDuration = (startTime, endTime) => {
    const start = getMinutesFromTime(startTime);
    const end = getMinutesFromTime(endTime);
    
    return Math.ceil((end - start) / 30);
  };

  // Get department name for display
  const getDepartmentDisplayName = () => {
    if (!department) return 'All Departments';
    return department;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {getDepartmentDisplayName()} Schedule
      </h2>
      
      {/* Day selector */}
      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        <div className="flex items-center mr-4">
          <Calendar size={18} className="text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">Select Day:</span>
        </div>
        <div className="flex space-x-2">
          {daysOfWeek.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedDay === day
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      
      {/* Show debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
          <div>Total Schedules: {schedules.length}</div>
          <div>Filtered Schedules: {filteredSchedules.length}</div>
          <div>Selected Department: {department || 'All'}</div>
          <div>Selected Day: {selectedDay}</div>
        </div>
      )}
      
      {(loading || scheduleLoading) ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map(time => {
                const classAtTime = getClassAtTime(selectedDay, time);
                
                // If this is the start time of a class
                if (classAtTime && classAtTime.startTime === time) {
                  const rowSpan = getClassDuration(classAtTime.startTime, classAtTime.endTime);
                  
                  return (
                    <tr key={time}>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                        {time}
                      </td>
                      <td 
                        rowSpan={rowSpan} 
                        className="px-2 py-2 bg-blue-50 border border-blue-200 rounded-md"
                      >
                        <div className="mb-1 font-medium text-blue-800">
                          {classAtTime.courseId?.code || 'N/A'} - {classAtTime.courseId?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {classAtTime.teacherId?.firstname} {classAtTime.teacherId?.lastname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {classAtTime.roomId?.name || 'Room TBA'} • {classAtTime.startTime} - {classAtTime.endTime}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {classAtTime.departmentId?.name || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                // If there's a class in progress but not starting at this time slot
                if (classAtTime) {
                  return (
                    <tr key={time}>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                        {time}
                      </td>
                      {/* No TD here because the cell above spans multiple rows */}
                    </tr>
                  );
                }
                
                // No class at this time
                return (
                  <tr key={time}>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                      {time}
                    </td>
                    <td className="px-2 py-3 text-sm text-gray-400 italic">
                      No class scheduled
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Show message if no schedules found */}
      {!loading && !scheduleLoading && filteredSchedules.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No schedules found for {getDepartmentDisplayName()}
          </p>
        </div>
      )}
    </div>
  );
};

export default DepartmentSchedule;