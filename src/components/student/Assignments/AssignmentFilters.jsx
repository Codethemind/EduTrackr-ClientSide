import React from 'react';
import PropTypes from 'prop-types';

const AssignmentFilters = ({
  filters,
  setFilters,
  courses = [],
  departments = [],
  isStudent = false,
}) => {
  console.log('AssignmentFilters props:', { filters, courses, departments, isStudent });

  const handleFilterChange = (filterType, value) => {
    console.log('Filter changed:', { filterType, value });
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const statusOptions = isStudent
    ? [
        { value: 'all', label: 'All Assignments' },
        { value: 'pending', label: 'Pending' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'upcoming', label: 'Upcoming' },
      ]
    : [
        { value: 'all', label: 'All Assignments' },
        { value: 'active', label: 'Active' },
        { value: 'expired', label: 'Expired' },
      ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'title', label: 'Title' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-wrap gap-4">
      

        {/* Status Filter */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Status
          </label>
          <select
            id="status-filter"
            aria-label="Filter by status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="sort-by"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sort By
          </label>
          <select
            id="sort-by"
            aria-label="Sort assignments"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={() =>
              setFilters({
                course: 'all',
                department: 'all',
                status: 'all',
                sortBy: 'dueDate',
              })
            }
            aria-label="Clear all filters"
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};

AssignmentFilters.propTypes = {
  filters: PropTypes.shape({
    course: PropTypes.string,
    department: PropTypes.string,
    status: PropTypes.string,
    sortBy: PropTypes.string,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  courses: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string
  })),
  departments: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string
  })),
  isStudent: PropTypes.bool,
};

export default AssignmentFilters;