// components/admin/schedule/DepartmentSelector.jsx
import React from 'react';
import { Building } from 'lucide-react';

const DepartmentSelector = ({ departments, selectedDepartment, onDepartmentChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Building size={20} className="mr-2 text-blue-600" />
        Select Department
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {departments.map(dept => (
          <button
            key={dept.id}
            onClick={() => onDepartmentChange(dept.name)}
            className={`p-3 rounded-md border text-center transition-colors ${
              selectedDepartment === dept.name
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="block font-medium">{dept.name}</span>
            <span className="text-xs text-gray-500">{dept.courseCount || 0} Courses</span>
          </button>
        ))}
        <button
          onClick={() => onDepartmentChange('')}
          className={`p-3 rounded-md border text-center transition-colors ${
            !selectedDepartment
              ? 'bg-blue-100 border-blue-300 text-blue-800'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="block font-medium">All Departments</span>
          <span className="text-xs text-gray-500">View All Schedules</span>
        </button>
      </div>
    </div>
  );
};

export default DepartmentSelector;