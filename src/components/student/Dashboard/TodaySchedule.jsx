import React from 'react';
import PropTypes from 'prop-types';
import { MdLocationOn, MdAccessTime } from 'react-icons/md';

const TodaySchedule = ({ schedule }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
        <a href="/student/calendar" className="text-sm text-blue-600 hover:text-blue-700">Full Calendar</a>
      </div>

      <div className="space-y-6">
        {schedule.map((item, index) => (
          <div key={index} className="flex">
            {/* Time Column */}
            <div className="w-24 flex-shrink-0">
              <div className="text-sm text-gray-600">{item.time}</div>
              <div className="text-xs text-gray-500">{item.duration}</div>
            </div>

            {/* Content Column */}
            <div className="flex-grow border-l-2 border-gray-100 pl-4 ml-4 pb-6 relative">
              {/* Timeline Dot */}
              <div className="absolute w-2 h-2 bg-blue-600 rounded-full -left-1 top-1.5"></div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                
                {/* Location */}
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <MdLocationOn className="w-4 h-4 mr-1" />
                  <span>{item.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

TodaySchedule.propTypes = {
  schedule: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      duration: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default TodaySchedule; 