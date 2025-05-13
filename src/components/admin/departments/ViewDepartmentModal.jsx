import React from 'react';

const ViewDepartmentModal = ({ department, onClose }) => {
  if (!department) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Department Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-black"
          >
            ✖
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Department Name</p>
            <p className="font-medium">{department.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Department Code</p>
            <p className="font-medium">{department.code}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Established Date</p>
            <p className="font-medium">
              {new Date(department.establishedDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Head of Department</p>
            <p className="font-medium">{department.headOfDepartment}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Department Email</p>
            <p className="font-medium">{department.departmentEmail}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Department Phone</p>
            <p className="font-medium">{department.departmentPhone}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-medium ${department.active ? 'text-green-600' : 'text-red-600'}`}>
              {department.active ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium">
              {new Date(department.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-medium">
              {new Date(department.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDepartmentModal; 