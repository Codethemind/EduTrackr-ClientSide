import React from 'react';

const Filter = ({
  searchTerm,
  setSearchTerm,
  selectedClass,
  setSelectedClass,
  selectedRole,
  setSelectedRole,
  classOptions = ['All'],
  roleOptions = ['All'],
}) => {
  return (
    <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-md w-full max-w-lg">
      {/* Search by name */}
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Filter by class (only shown if selectedClass and setSelectedClass are provided) */}
      {selectedClass !== undefined && setSelectedClass && (
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Classes</option>
          {classOptions.filter(c => c !== 'All').map((className, idx) => (
            <option key={idx} value={className}>
              {className}
            </option>
          ))}
        </select>
      )}

      {/* Filter by role */}
      {selectedRole !== undefined && setSelectedRole && (
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Roles</option>
          {roleOptions.filter(r => r !== 'All').map((role, idx) => (
            <option key={idx} value={role}>
              {role}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default Filter;
