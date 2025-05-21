// components/admin/schedule/DepartmentSchedule.jsx
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const DepartmentSchedule = ({ department }) => {
  const [schedules, setSchedules] = useState([]);
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

  // Mock API call to get schedules for a specific department
  useEffect(() => {
    // In a real application, this would be an API call
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // These would come from an API
      const mockSchedules = [
        {
          id: 1,
          departmentName: 'Computer Science',
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          teacherName: 'Dr. Johnson',
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:30',
          roomName: 'Room 101',
          semester: 'Spring 2025'
        },
        {
          id: 2,
          departmentName: 'Computer Science',
          courseCode: 'CS201',
          courseName: 'Data Structures',
          teacherName: 'Prof. Williams',
          day: 'Wednesday',
          startTime: '13:00',
          endTime: '14:30',
          roomName: 'Lab 201',
          semester: 'Spring 2025'
        },
        {
          id: 3,
          departmentName: 'Computer Science',
          courseCode: 'CS150',
          courseName: 'Computer Networks',
          teacherName: 'Dr. Johnson',
          day: 'Monday',
          startTime: '11:00',
          endTime: '12:30',
          roomName: 'Room 102',
          semester: 'Spring 2025'
        },
        {
          id: 4,
          departmentName: 'Business Administration',
          courseCode: 'BA120',
          courseName: 'Marketing 101',
          teacherName: 'Dr. Smith',
          day: 'Tuesday',
          startTime: '11:00',
          endTime: '12:30',
          roomName: 'Room 102',
          semester: 'Spring 2025'
        }
      ];
      
      // Filter by department
      const filteredSchedules = department 
        ? mockSchedules.filter(s => s.departmentName === department)
        : mockSchedules;
        
      setSchedules(filteredSchedules);
      setLoading(false);
    }, 500);
  }, [department]);
  
  // Helper function to determine if a class is scheduled at a particular time
  const getClassAtTime = (day, time) => {
    return schedules.find(schedule => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {department ? `${department} Department Schedule` : 'All Departments Schedule'}
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
      
      {loading ? (
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
                          {classAtTime.courseCode} - {classAtTime.courseName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {classAtTime.teacherName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {classAtTime.roomName} • {classAtTime.startTime} - {classAtTime.endTime}
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
    </div>
  );
};

export default DepartmentSchedule;