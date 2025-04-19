import React from 'react';
import PropTypes from 'prop-types';
import { MdAssignment } from 'react-icons/md';

const UpcomingAssignments = ({ assignments }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
        <a href="/student/assignments" className="text-sm text-blue-600 hover:text-blue-700">View All</a>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MdAssignment className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{assignment.course}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  assignment.status === 'Started' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {assignment.status}
                </span>
              </div>

              <div className="flex items-center mt-2 text-xs text-gray-500">
                <span>Due: {assignment.dueDate}</span>
                <span className="mx-2">•</span>
                <span>Weight: {assignment.weight}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

UpcomingAssignments.propTypes = {
  assignments: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      course: PropTypes.string.isRequired,
      dueDate: PropTypes.string.isRequired,
      weight: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default UpcomingAssignments; 