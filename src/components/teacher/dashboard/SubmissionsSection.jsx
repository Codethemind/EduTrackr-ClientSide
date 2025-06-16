import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SubmissionsSection = ({ submissions = [] }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'graded'

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
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
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'pending'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'graded'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Graded
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No submissions found
          </div>
        ) : (
          filteredSubmissions.map((submission, index) => (
            <div
              key={index}
              className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {submission.assignmentTitle}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span>👤 {submission.studentName}</span>
                  <span>📅 {formatDate(submission.submittedAt)}</span>
                  {submission.grade && (
                    <span>📊 Grade: {submission.grade}</span>
                  )}
                </div>
                {submission.feedback && (
                  <p className="mt-2 text-sm text-gray-600">
                    {submission.feedback}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  onClick={() => window.open(submission.fileUrl, '_blank')}
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

SubmissionsSection.propTypes = {
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      assignmentTitle: PropTypes.string.isRequired,
      studentName: PropTypes.string.isRequired,
      submittedAt: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['pending', 'graded', 'late']).isRequired,
      grade: PropTypes.string,
      feedback: PropTypes.string,
      fileUrl: PropTypes.string.isRequired
    })
  )
};

export default SubmissionsSection; 