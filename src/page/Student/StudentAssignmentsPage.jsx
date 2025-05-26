import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/Common/Sidebar';
import AssignmentCard from '../../components/student/assignments/AssignmentCard';
import AssignmentFilters from '../../components/student/assignments/AssignmentFilters';
import AssignmentDetailModal from '../../components/student/assignments/AssignmentDetailModal';
import SubmissionModal from '../../components/student/assignments/SubmissionModal';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const StudentAssignmentsPage = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [studentSchedules, setStudentSchedules] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    course: 'all',
    department: 'all',
    status: 'all',
    sortBy: 'dueDate'
  });

  const studentId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  // Fetch student's schedules for course/department options
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      if (!studentId || !accessToken) return;

      try {
        // First, get student's department information
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;
          
          // Then fetch schedules for student's department
          if (student.departmentId) {
            const schedulesResponse = await axios.get(`/api/schedules/department/${student.departmentId}`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            if (schedulesResponse.data.success) {
              setStudentSchedules(schedulesResponse.data.data);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching student schedules:', error);
      }
    };

    fetchStudentSchedules();
  }, [studentId, accessToken]);

  // Fetch assignments for student
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!studentId || !accessToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // First, get student's department information
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;
          
          // Then fetch assignments for student's department
          if (student.departmentId) {
            const assignmentsResponse = await axios.get(`/api/assignments/department/${student.departmentId}`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            if (assignmentsResponse.data.success) {
              setAssignments(assignmentsResponse.data.data);
            } else {
              toast.error('Failed to load assignments');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to load assignments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [studentId, accessToken]);

  // Handle assignment submission
  const handleSubmitAssignment = async (assignmentId, submissionData) => {
    try {
      const formData = new FormData();
      
      // Basic required fields
      formData.append('studentId', studentId);
      formData.append('studentName', `${authState.user.firstname} ${authState.user.lastname}`.trim());
      
      // Validation fields
      formData.append('hasSubmissionText', String(!!submissionData.submissionText?.trim()));
      formData.append('fileCount', String(submissionData.files?.length || 0));

      // Handle text submission
      if (submissionData.submissionText?.trim()) {
        formData.append('submissionText', submissionData.submissionText.trim());
      }

      // Handle files
      if (submissionData.files?.length > 0) {
        // Append file names as a JSON array
        formData.append('fileNames', JSON.stringify(submissionData.files.map(f => f.name)));
        
        // Append each file
        submissionData.files.forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await axios.post(
        `/api/assignments/${assignmentId}/submit`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Update the assignment in the local state to reflect the new submission
        setAssignments(prev => 
          prev.map(assignment => 
            assignment._id === assignmentId 
              ? { ...assignment, hasSubmitted: true, submission: response.data.data }
              : assignment
          )
        );
        setIsSubmissionModalOpen(false);
        setSelectedAssignment(null);
        toast.success('Assignment submitted successfully!');
      } else {
        console.error('Server returned error:', response.data);
        toast.error(response.data.message || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        toast.error(error.response.data.message || 'Failed to submit assignment');
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error('No response from server. Please try again.');
      } else {
        console.error('Error message:', error.message);
        toast.error('Failed to submit assignment');
      }
    }
  };

  // Handle opening assignment detail
  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  // Handle opening submission modal
  const handleStartSubmission = (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionModalOpen(true);
  };

  // Filter and sort assignments
  const filteredAssignments = assignments.filter(assignment => {
    if (filters.course !== 'all' && assignment.courseId?._id !== filters.course) return false;
    if (filters.department !== 'all' && assignment.departmentId?._id !== filters.department) return false;
    if (filters.status !== 'all') {
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      
      switch (filters.status) {
        case 'pending':
          return !assignment.hasSubmitted && dueDate >= now;
        case 'submitted':
          return assignment.hasSubmitted;
        case 'overdue':
          return !assignment.hasSubmitted && dueDate < now;
        case 'upcoming':
          return !assignment.hasSubmitted && dueDate >= now;
        default:
          return true;
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
      case 'status':
        // Sort by submission status
        if (a.hasSubmitted && !b.hasSubmitted) return 1;
        if (!a.hasSubmitted && b.hasSubmitted) return -1;
        return 0;
      default:
        return 0;
    }
  });

  // Get unique courses and departments from schedules
  const uniqueCourses = [...new Set(studentSchedules.map(s => s.courseId?.name).filter(Boolean))];
  const uniqueDepartments = [...new Set(studentSchedules.map(s => s.departmentId?.name).filter(Boolean))];

  // Calculate statistics
  const pendingAssignments = assignments.filter(a => !a.hasSubmitted && new Date(a.dueDate) >= new Date()).length;
  const submittedAssignments = assignments.filter(a => a.hasSubmitted).length;
  const overdueAssignments = assignments.filter(a => !a.hasSubmitted && new Date(a.dueDate) < new Date()).length;
  const upcomingDeadlines = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return !a.hasSubmitted && dueDate <= threeDaysFromNow && dueDate >= new Date();
  }).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="student" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 ml-64">
          <div className="container mx-auto px-6 py-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
                  <p className="text-gray-600">View and submit your course assignments</p>
                </div>
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
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingAssignments}</p>
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
                    <p className="text-sm font-medium text-gray-600">Submitted</p>
                    <p className="text-2xl font-bold text-gray-900">{submittedAssignments}</p>
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
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-gray-900">{overdueAssignments}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines Alert */}
            {upcomingDeadlines > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span className="text-yellow-800 font-medium">
                    You have {upcomingDeadlines} assignment{upcomingDeadlines > 1 ? 's' : ''} due within the next 3 days!
                  </span>
                </div>
              </div>
            )}

            {/* Filters */}
            <AssignmentFilters
              filters={filters}
              setFilters={setFilters}
              courses={uniqueCourses}
              departments={uniqueDepartments}
              isStudent={true}
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
                <p className="text-gray-600">
                  {assignments.length === 0 
                    ? "You don't have any assignments yet. Check back later or contact your teachers."
                    : "No assignments match your current filters. Try adjusting your search criteria."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    onView={handleViewAssignment}
                    onSubmit={handleStartSubmission}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Assignment Detail Modal */}
      {isDetailModalOpen && selectedAssignment && (
        <AssignmentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
          onStartSubmission={handleStartSubmission}
        />
      )}

      {/* Submission Modal */}
      {isSubmissionModalOpen && selectedAssignment && (
        <SubmissionModal
          isOpen={isSubmissionModalOpen}
          onClose={() => {
            setIsSubmissionModalOpen(false);
            setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
          onSubmit={handleSubmitAssignment}
        />
      )}
    </div>
  );
};

export default StudentAssignmentsPage;