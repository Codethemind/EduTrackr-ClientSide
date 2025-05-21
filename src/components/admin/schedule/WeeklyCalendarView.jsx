

// components/admin/schedule/WeeklyCalendarView.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WeeklyCalendarView = ({ schedules = [] }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [];
  
  // Generate time slots from 8 AM to 6 PM
  for (let hour = 8; hour <= 18; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    timeSlots.push(`${formattedHour}:00`);
    if (hour < 18) timeSlots.push(`${formattedHour}:30`);
  }
  
  const [currentSemester, setCurrentSemester] = useState('Spring 2025');
  const semesters = ['Spring 2025', 'Summer 2025', 'Fall 2025'];
  
  // Helper function to get schedules for a specific day and time
  const getSchedulesForSlot = (day, timeSlot) => {
    return schedules.filter(schedule => {
      if (schedule.day !== day || schedule.semester !== currentSemester) {
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
  const getDepartmentColorClass = (departmentName) => {
    const departmentColors = {
      'Computer Science': 'bg-blue-50 border-blue-200 text-blue-800',
      'Business Administration': 'bg-green-50 border-green-200 text-green-800',
      'Engineering': 'bg-purple-50 border-purple-200 text-purple-800',
      'Arts & Humanities': 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };
    
    return departmentColors[departmentName] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-semibold mb-3 sm:mb-0">Weekly Schedule</h2>
        
        <div className="flex items-center space-x-2">
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
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
          
          <span className="text-sm font-medium">{currentSemester}</span>
          
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
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
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              {daysOfWeek.map(day => (
                <th key={day} className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td key={`${day}-${timeSlot}`} className="border border-gray-100 px-2 py-2"></td>
                    );
                  }
                  
                  // For classes that start at this time slot
                  return (
                    <td key={`${day}-${timeSlot}`} className="border border-gray-100 px-0 py-0">
                      {schedulesForSlot.map(schedule => {
                        if (isClassStart(schedule, timeSlot)) {
                          const rowSpan = calculateTimeSlotSpan(schedule.startTime, schedule.endTime);
                          const colorClass = getDepartmentColorClass(schedule.departmentName);
                          
                          return (
                            <div 
                              key={schedule.id}
                              className={`p-2 h-full border rounded-md ${colorClass}`}
                              style={{ height: `${rowSpan * 100}%` }}
                            >
                              <div className="text-xs font-medium">{schedule.courseCode}</div>
                              <div className="text-xs truncate">{schedule.roomName}</div>
                              <div className="text-xs truncate">{schedule.teacherName}</div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;