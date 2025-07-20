import React from 'react';

interface User {
  _id: string;
  username: string;
  role: 'Student' | 'teacher' | 'admin';
}

interface Concern {
  _id: string;
  title: string;
  description: string;
  type: 'Academic' | 'Administrative';
  createdBy: User; // Now populated with user object
  createdByRole: 'Student' | 'Teacher' | 'Admin';
  status: 'Pending' | 'In Progress' | 'Solved' | 'Rejected';
  feedback?: string;
  createdAt: string;
}

interface ViewConcernModalProps {
  concern: Concern;
  onClose: () => void;
}

const ViewConcernModal: React.FC<ViewConcernModalProps> = ({ concern, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Concern Details</h2>
        <div className="space-y-3">
          <div className="flex">
            <span className="font-medium text-gray-700 w-24">Title:</span>
            <span className="text-gray-900">{concern.title}</span>
          </div>
          {/* <div className="flex">
            <span className="font-medium text-gray-700 w-24">Type:</span>
            <span className="text-gray-900">{concern.type}</span>
          </div> */}
          <div className="flex">
            <span className="font-medium text-gray-700 w-24">Status:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              concern.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              concern.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
              concern.status === 'Solved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {concern.status}
            </span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-700 w-24">Feedback:</span>
            <span className="text-gray-900">{concern.feedback || '-'}</span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-700 w-24">Raised By:</span>
            <span className="text-gray-900">{concern.createdBy?.username || 'Unknown'}</span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-700 w-24">Role:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              concern.createdBy?.role === 'student' ? 'bg-blue-100 text-blue-800' :
              concern.createdBy?.role === 'teacher' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {concern.createdBy?.role || concern.createdByRole || 'Unknown'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-700 mb-1">Description:</span>
            <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded">{concern.description}</p>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-700 w-24">Created At:</span>
            <span className="text-gray-900">{new Date(concern.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewConcernModal;