import React from 'react';

const AssignmentCard = ({ assignment, onView, onSubmit }) => {
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now && !assignment.submissions?.length;
  const isDueSoon =
    dueDate <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) &&
    dueDate > now &&
    !assignment.submissions?.length;

  // Calculate time remaining
  const timeRemaining = dueDate - now;
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  const getStatusBadge = () => {
    if (assignment.submissions?.length > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Submitted
        </span>
      );
    } else if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Overdue
        </span>
      );
    } else if (isDueSoon) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Due Soon
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Pending
        </span>
      );
    }
  };

  const getTimeRemainingText = () => {
    if (assignment.submissions?.length > 0) {
      return `Submitted on ${new Date(assignment.submissions[0]?.submittedAt).toLocaleDateString()}`;
    } else if (isOverdue) {
      const overdueDays = Math.abs(daysRemaining);
      return `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`;
    } else if (daysRemaining > 0) {
      return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
    } else if (hoursRemaining > 0) {
      return `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} left`;
    } else {
      return 'Due today';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {assignment.title}
          </h3>
          <p className="text-sm text-gray-600">
            {assignment.courseName} • {assignment.departmentName}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {assignment.description}
      </p>

      {/* Assignment Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {assignment.teacherId?.name || 'Unknown Teacher'}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-7 0h8m-8 0l-1 1m9-1l1 1m-5 7v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6m4-4V8a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0V8a1 1 0 00-1-1H9a1 1 0 00-1 1v1" />
          </svg>
          Assignment
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8.414V17a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-5" />
          </svg>
          {assignment.maxMarks} points
        </div>
      </div>

      {/* Due Date */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-7 0h8m-8 0l-1 1m9-1l1 1m-1 5h-8M12 16v6" />
          </svg>
          <span className="font-medium text-gray-700">Due: </span>
          <span className="text-gray-600 ml-1">
            {dueDate.toLocaleDateString()} at{' '}
            {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Time Remaining */}
      <div className="mb-4">
        <div
          className={`text-sm font-medium ${
            assignment.submissions?.length > 0
              ? 'text-green-600'
              : isOverdue
              ? 'text-red-600'
              : isDueSoon
              ? 'text-yellow-600'
              : 'text-blue-600'
          }`}
        >
          {getTimeRemainingText()}
        </div>
      </div>

      {/* Submission Info */}
      {assignment.submissions?.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-sm text-green-700">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Submitted</span>
          </div>
          {assignment.submissions[0]?.grade !== undefined && (
            <div className="mt-1 text-sm text-green-600">
              Grade: {assignment.submissions[0].grade}/{assignment.maxMarks}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(assignment)}
          aria-label="View assignment details"
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
          View Details
        </button>

        {assignment.submissions?.length === 0 && !isOverdue && (
          <button
            onClick={() => onSubmit(assignment)}
            aria-label="Submit assignment"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            Submit
          </button>
        )}

        {assignment.submissions?.length === 0 && isOverdue && assignment.allowLateSubmission && (
          <button
            onClick={() => onSubmit(assignment)}
            aria-label="Submit assignment late"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            Submit Late
          </button>
        )}

        {assignment.submissions?.length > 0 && (
          <button
            onClick={() => onView(assignment)}
            aria-label="View submission"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            View Submission
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;