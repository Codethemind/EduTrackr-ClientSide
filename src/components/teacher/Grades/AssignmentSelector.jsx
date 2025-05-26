import React from 'react';

const AssignmentSelector = ({ assignments, selectedAssignment, onSelect }) => {
  return (
    <div>
      <label htmlFor="assignment" className="block text-sm font-medium text-gray-700 mb-2">
        Select Assignment
      </label>
      <select
        id="assignment"
        value={selectedAssignment?._id || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select an assignment</option>
        {assignments.map((assignment) => (
          <option key={assignment._id} value={assignment._id}>
            {assignment.title} - {assignment.course?.name}
          </option>
        ))}
      </select>

      {selectedAssignment && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Course:</span> {selectedAssignment.course?.name}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Due Date:</span>{' '}
            {new Date(selectedAssignment.dueDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentSelector; 