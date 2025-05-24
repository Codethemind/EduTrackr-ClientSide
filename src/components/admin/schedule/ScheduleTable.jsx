// components/admin/schedule/ScheduleTable.jsx
import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Filter } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSchedules, deleteExistingSchedule } from '../../../redux/slices/scheduleSlice';
import axios from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import EditScheduleModal from './EditScheduleModal';

const ScheduleTable = () => {
  const dispatch = useDispatch();
  const { schedules = [], loading, error } = useSelector((state) => state.schedule);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    day: '',
    semester: ''
  });
  const [departments, setDepartments] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  
  const semesters = ['Spring 2025', 'Fall 2025', 'Summer 2025'];

  // Fetch schedules and departments
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch schedules
        const response = await dispatch(fetchAllSchedules()).unwrap();
        console.log('Schedules response:', response);
        
        // Fetch departments
        const deptResponse = await axios.get('/api/departments');
        console.log('Departments response:', deptResponse.data);
        if (deptResponse.data.success) {
          setDepartments(deptResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Handle schedule deletion
  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await dispatch(deleteExistingSchedule(id)).unwrap();
        toast.success('Schedule deleted successfully');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Failed to delete schedule');
      }
    }
  };

  // Handle edit schedule
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setIsEditModalOpen(true);
  };

  // Handle edit modal close
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingSchedule(null);
  };

  // Handle successful edit
  const handleEditSuccess = () => {
    handleEditModalClose();
    // Refresh schedules
    dispatch(fetchAllSchedules());
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      department: '',
      day: '',
      semester: ''
    });
    setSearchTerm('');
  };

  // Apply filters and search
  useEffect(() => {
    if (!Array.isArray(schedules)) return;

    let result = [...schedules];
    console.log('result', result);

    // Department filter
    if (filters.department) {
      result = result.filter(s => s.departmentId?._id === filters.department);
    }

    // Day filter
    if (filters.day) {
      result = result.filter(s => s.day === filters.day);
    }

    // Semester filter
    if (filters.semester) {
      result = result.filter(s => s.semester === filters.semester);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.courseId?.name?.toLowerCase().includes(term) ||
        s.courseId?.code?.toLowerCase().includes(term) ||
        `${s.teacherId?.firstname} ${s.teacherId?.lastname}`.toLowerCase().includes(term)
      );
    }

    setFilteredSchedules(result);
  }, [schedules, filters, searchTerm]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold">Class Schedules</h2>
            
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              {/* Search */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search schedules..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                <Filter size={18} className="mr-2" />
                Filters
              </button>
            </div>
          </div>
          
          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Day Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day
                  </label>
                  <select
                    name="day"
                    value={filters.day}
                    onChange={handleFilterChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Days</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                {/* Semester Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={filters.semester}
                    onChange={handleFilterChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Semesters</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                
                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 mt-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Teacher</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Day</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Time</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{schedule.courseId?.name || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{schedule.departmentId?.name || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {schedule.teacherId?.firstname} {schedule.teacherId?.lastname}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{schedule.day}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{schedule.startTime} - {schedule.endTime}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        title="Edit Schedule"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule._id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        title="Delete Schedule"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No schedules found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Schedule Modal */}
      {isEditModalOpen && (
        <EditScheduleModal
          schedule={editingSchedule}
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSuccess={handleEditSuccess}
          departments={departments}
        />
      )}
    </>
  );
};

export default ScheduleTable;