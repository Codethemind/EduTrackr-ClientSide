import React from 'react';

const ScheduleFilters = ({ 
  selectedSemester, 
  setSelectedSemester, 
  selectedDepartment, 
  setSelectedDepartment,
  semesters,
  departments 
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="w-64">
        <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
          Semester
        </label>
        <select
          id="semester"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {semesters.map(semester => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </div>
      <div className="w-64">
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <select
          id="department"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {departments.map(dept => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ScheduleFilters; 