import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DeadlinesSection = ({ deadlines = [] }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'overdue'

  const filteredDeadlines = deadlines.filter(deadline => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return deadline.status === 'upcoming';
    if (filter === 'overdue') return deadline.status === 'overdue';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    const deadlineDate = new Date(date);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  const getTimeLeft = (date) => {
    const deadlineDate = new Date(date);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffTime < 0) return 'Overdue';
    if (diffHours < 24) {
      return `${diffHours}h ${diffMinutes}m left`;
    }
    return `${Math.floor(diffHours / 24)}d ${diffHours % 24}h left`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'upcoming'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'overdue'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDeadlines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No deadlines found
          </div>
        ) : (
          filteredDeadlines.map((deadline, index) => (
            <div
              key={index}
              className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {deadline.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(deadline.status)}`}>
                    {deadline.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span>📚 {deadline.course}</span>
                  <span>📅 {formatDate(deadline.dueDate)}</span>
                  <span>⏰ {getTimeLeft(deadline.dueDate)}</span>
                </div>
                {deadline.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {deadline.description}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  onClick={() => window.location.href = deadline.link}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

DeadlinesSection.propTypes = {
  deadlines: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      course: PropTypes.string.isRequired,
      dueDate: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['upcoming', 'overdue', 'completed']).isRequired,
      description: PropTypes.string,
      link: PropTypes.string.isRequired
    })
  )
};

export default DeadlinesSection; 