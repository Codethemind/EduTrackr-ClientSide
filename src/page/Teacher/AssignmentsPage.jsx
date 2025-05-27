import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import CreateAssignmentModal from '../../components/teacher/assignments/CreateAssignmentModal';
import AssignmentCard from '../../components/teacher/assignments/AssignmentCard';
import AssignmentFilters from '../../components/teacher/assignments/AssignmentFilters';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const AssignmentsPage = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [teacherSchedules, setTeacherSchedules] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    course: 'all',
    department: 'all',
    status: 'all',
    sortBy: 'dueDate'
  });

  const teacherId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  // Fetch teacher's schedules for course/department options
  useEffect(() => {
    const fetchTeacherSchedules = async () => {
      if (!teacherId || !accessToken) return;

      try {
        const response = await axios.get(`/api/schedules/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (response.data.success) {
          setTeacherSchedules(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching teacher schedules:', error);
      }
    };

    fetchTeacherSchedules();
  }, [teacherId, accessToken]);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!teacherId || !accessToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`/api/assignments/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (response.data.success) {
          console.log('Raw Assignments:', JSON.stringify(response.data.data, null, 2)); // Debug log
          setAssignments(response.data.data);
        } else {
          toast.error('Failed to load assignments');
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to load assignments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [teacherId, accessToken]);

  // Handle assignment creation
  const handleCreateAssignment = async (assignmentData) => {
    try {
      const response = await axios.post('/api/assignments', {
        ...assignmentData,
        teacherId: teacherId
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.data.success) {
        setAssignments(prev => [response.data.data, ...prev]);
        setIsCreateModalOpen(false);
        toast.success('Assignment created successfully!');
      } else {
        toast.error('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  // Handle assignment update
  const handleUpdateAssignment = async (assignmentId, updatedData) => {
    try {
      const response = await axios.put(`/api/assignments/${assignmentId}`, updatedData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.data.success) {
        setAssignments(prev => 
          prev.map(assignment => 
            assignment._id === assignmentId ? response.data.data : assignment
          )
        );
        toast.success('Assignment updated successfully!');
      } else {
        toast.error('Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  // Handle assignment deletion
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await axios.delete(`/api/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.data.success) {
        setAssignments(prev => prev.filter(assignment => assignment._id !== assignmentId));
        toast.success('Assignment deleted successfully!');
      } else {
        toast.error('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  // Create maps for course and department names
  const courseNameMap = new Map(teacherSchedules.map(s => [s.courseId?._id, s.courseId?.name]));
  const departmentNameMap = new Map(teacherSchedules.map(s => [s.departmentId?._id, s.departmentId?.name]));

  // Get unique courses and departments from schedules
  const uniqueCourses = teacherSchedules.length
    ? [...new Set(teacherSchedules.map(s => s.courseId?._id).filter(Boolean))]
    : [];
  const uniqueDepartments = teacherSchedules.length
    ? [...new Set(teacherSchedules.map(s => s.departmentId?._id).filter(Boolean))]
    : [];

  // Debug unique courses and departments
  console.log('Unique Courses:', uniqueCourses);
  console.log('Unique Departments:', uniqueDepartments);

  // Filter and sort assignments
  const filteredAssignments = assignments.filter(assignment => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    // Course filter
    if (filters.course !== 'all') {
      const assignmentCourseId = typeof assignment.courseId === 'object' ? assignment.courseId?._id : assignment.courseId;
      if (assignmentCourseId !== filters.course) {
        return false;
      }
    }

    // Department filter
    if (filters.department !== 'all') {
      const assignmentDepartmentId = typeof assignment.departmentId === 'object' ? assignment.departmentId?._id : assignment.departmentId;
      if (assignmentDepartmentId !== filters.department) {
        return false;
      }
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active' && dueDate < now) {
        return false;
      }
      if (filters.status === 'expired' && dueDate >= now) {
        return false;
      }
      if (filters.status === 'due-soon' && (daysUntilDue > 3 || daysUntilDue < 0)) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'dueDate':
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'submissions':
        return (b.submissions?.length || 0) - (a.submissions?.length || 0);
      case 'maxMarks':
        return b.maxMarks - a.maxMarks;
      default:
        return 0;
    }
  });

  // Debug filters
  useEffect(() => {
    console.log('Filters:', filters);
  }, [filters]);

  // Calculate statistics
  const activeAssignments = assignments.filter(a => new Date(a.dueDate) >= new Date()).length;
  const expiredAssignments = assignments.filter(a => new Date(a.dueDate) < new Date()).length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignment Management</h1>
                  <p className="text-gray-600">Create and manage assignments for your courses</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span>Create Assignment</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{activeAssignments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Expired Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{expiredAssignments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <AssignmentFilters
              filters={filters}
              setFilters={setFilters}
              courses={uniqueCourses}
              departments={uniqueDepartments}
              courseNameMap={courseNameMap}
              departmentNameMap={departmentNameMap}
            />

            {/* Assignments List */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-lg text-gray-600">Loading assignments...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Found</h3>
                <p className="text-gray-600 mb-6">
                  {assignments.length === 0 
                    ? "You haven't created any assignments yet. Create your first assignment to get started."
                    : "No assignments match your current filters. Try adjusting your search criteria."
                  }
                </p>
                {assignments.length === 0 && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Create Your First Assignment
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    onUpdate={handleUpdateAssignment}
                    onDelete={handleDeleteAssignment}
                    courseNameMap={courseNameMap}
                    departmentNameMap={departmentNameMap}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <CreateAssignmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAssignment}
          teacherSchedules={teacherSchedules}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;