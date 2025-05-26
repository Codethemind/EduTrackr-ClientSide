import React from 'react';

const AssignmentDetailModal = ({ isOpen, onClose, assignment, onStartSubmission }) => {
  if (!isOpen || !assignment) return null;
console.log(assignment)
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now && !assignment.submissions?.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
            <p className="text-gray-600 mt-1">
              {assignment.courseName} • {assignment.departmentName}
            </p>
          </div>
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Assignment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Assignment Details</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span className="text-gray-700">
                      {assignment.teacherId?.username || 'Unknown Teacher'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-7 0h8m-8 0l-1 1m9-1l1 1m-5 7v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6m4-4V8a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0V8a1 1 0 00-1-1H9a1 1 0 00-1 1v1"></path>
                    </svg>
                    <span className="text-gray-700">Assignment</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8.414V17a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-5"></path>
                    </svg>
                    <span className="text-gray-700">{assignment.maxMarks} points</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Timeline</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-gray-700">
                      Created: {new Date(assignment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-7 0h8m-8 0l-1 1m9-1l1 1m-1 5h-8M12 16v6"></path>
                    </svg>
                    <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                      Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
          </div>

          {/* Instructions */}
          {assignment.instructions && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            </div>
          )}

          {/* Attachments */}
          {assignment.attachments?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {assignment.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                    </svg>
                    <span className="text-gray-700 flex-1">{attachment.name}</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Status */}
          {assignment.submissions?.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Submission</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-green-800 font-medium">Submitted</span>
                </div>
                <p className="text-green-700 text-sm">
                  Submitted on {new Date(assignment.submissions[0].submittedAt).toLocaleDateString()} at{' '}
                  {new Date(assignment.submissions[0].submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {assignment.submissions[0].grade !== undefined && (
                  <div className="mt-2 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-700">
                      Grade: {assignment.submissions[0].grade}/{assignment.maxMarks}
                    </p>
                    {assignment.submissions[0].feedback && (
                      <p className="text-sm text-gray-600 mt-1">
                        Feedback: {assignment.submissions[0].feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Submission Status</h3>
              <div className={`border rounded-lg p-4 ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center">
                  <svg className={`w-5 h-5 mr-2 ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className={`font-medium ${isOverdue ? 'text-red-800' : 'text-yellow-800'}`}>
                    {isOverdue ? 'Overdue - Not Submitted' : 'Not Submitted Yet'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          {assignment.submissions?.length === 0 && (assignment.allowLateSubmission || !isOverdue) && (
            <button
              onClick={() => {
                onClose();
                onStartSubmission(assignment);
              }}
              className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                isOverdue 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isOverdue ? 'Submit Late' : 'Submit Assignment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailModal;