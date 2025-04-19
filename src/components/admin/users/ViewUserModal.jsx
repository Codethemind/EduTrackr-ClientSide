import React from 'react';

const ViewUserModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">User Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="ti ti-x text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">{user.username}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium">{user.role}</p>
          </div>
          
          {user.firstName && (
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-medium">{user.firstName}</p>
            </div>
          )}
          
          {user.lastName && (
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-medium">{user.lastName}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">
              {user.isActive !== undefined ? (user.isActive ? 'Active' : 'Inactive') : 'N/A'}
            </p>
          </div>
          
          {user.lastLogin && (
            <div>
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="font-medium">{new Date(user.lastLogin).toLocaleString()}</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;