import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ScheduleSection = ({ schedule = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaySchedule = () => {
    return schedule.filter(item => {
      const itemDate = new Date(item.startTime);
      return itemDate.toDateString() === selectedDate.toDateString();
    });
  };

  const getWeekSchedule = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return schedule.filter(item => {
      const itemDate = new Date(item.startTime);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });
  };

  const currentSchedule = viewMode === 'day' ? getDaySchedule() : getWeekSchedule();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === 'day'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === 'week'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {currentSchedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No classes scheduled for {viewMode === 'day' ? 'today' : 'this week'}
          </div>
        ) : (
          currentSchedule.map((item, index) => (
            <div
              key={index}
              className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {formatTime(item.startTime)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(item.endTime)}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.location}</p>
                {item.students && (
                  <p className="text-xs text-gray-500 mt-1">
                    {item.students} students enrolled
                  </p>
                )}
              </div>
              <div className="ml-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'upcoming'
                    ? 'bg-green-100 text-green-800'
                    : item.status === 'ongoing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

ScheduleSection.propTypes = {
  schedule: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['upcoming', 'ongoing', 'completed']).isRequired,
      students: PropTypes.number
    })
  )
};

export default ScheduleSection; 