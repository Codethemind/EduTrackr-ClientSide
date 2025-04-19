import React from 'react';
import PropTypes from 'prop-types';

const RecentAnnouncements = ({ announcements }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Announcements</h2>
        <a href="/student/announcements" className="text-sm text-blue-600 hover:text-blue-700">View All</a>
      </div>

      <div className="space-y-6">
        {announcements.map((announcement, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-medium text-gray-900">{announcement.course}</h3>
              <span className="text-xs text-gray-500">{announcement.time}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{announcement.title}</p>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                {announcement.instructor.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-xs text-gray-500 ml-2">{announcement.instructor}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

RecentAnnouncements.propTypes = {
  announcements: PropTypes.arrayOf(
    PropTypes.shape({
      course: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      instructor: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default RecentAnnouncements; 