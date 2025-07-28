import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import StudentSideBar from '../../components/student/Common/Sidebar';
import AssignmentCard from '../../components/student/assignments/AssignmentCard';
import AssignmentFilters from '../../components/student/assignments/AssignmentFilters';
import AssignmentDetailModal from '../../components/student/assignments/AssignmentDetailModal';
import SubmissionModal from '../../components/student/assignments/SubmissionModal';
import Pagination from '../../components/common/Pagination';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { RootState } from '../../redux/store';
import { Course } from '../../types';
import { Assignment } from '../../types/features/assignment-management';

// Add interfaces at the top
interface Attachment {
  name: string;
  url: string;
}

interface Submission {
  _id: string;
  studentId?: string;
  submittedAt: string;
  isLate?: boolean;
  grade?: number;
  feedback?: string;
  attachments?: Attachment[];
}

interface Teacher {
  _id: string;
  name?: string;
  username?: string;
}

// interface Assignment {
//   _id: string;
//   id?: string; // Added for AssignmentCard
//   title: string;
//   description: string;
//   instructions?: string;
//   dueDate: string;
//   createdAt?: string;
//   maxMarks: number;
//   submissions?: Submission[];
//   courseName?: string;
//   departmentName?: string;
//   teacherId?: Teacher;
//   submissionFormat?: string;
//   attachments?: Attachment[];
//   allowLateSubmission?: boolean;
//   isActive: boolean; // Added for AssignmentCard
//   hasSubmitted?: boolean;
//   courseId?: { _id: string; name?: string };
//   departmentId?: { _id: string };
//   [key: string]: any;
// }

const StudentAssignmentsPage: React.FC = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [studentSchedules, setStudentSchedules] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    course: 'all',
    department: 'all',
    status: 'all',
    sortBy: 'dueDate',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const studentId = authState?.user?.id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  // Fetch student's schedules for course/department options
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      if (!studentId || !accessToken) return;

      try {
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;
          if (student.departmentId) {
            const schedulesResponse = await axios.get(
              `/api/schedules/department/${student.departmentId}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (schedulesResponse.data.success) {
              setStudentSchedules(schedulesResponse.data.data);
            }
          }
        }
      } catch (error: any) {
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
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (studentResponse.data.success) {
          const student = studentResponse.data.data;

          if (student.departmentId) {
            const assignmentsResponse = await axios.get(
              `/api/assignments/department/${student.departmentId}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (assignmentsResponse.data.success) {
              // Map assignments to include hasSubmitted and isActive
              const updatedAssignments = assignmentsResponse.data.data.map(
                (assignment: Assignment) => ({
                  ...assignment,
                  id: assignment._id, // Map _id to id for AssignmentCard
                  hasSubmitted:
                    assignment.submissions?.some(
                      (submission) => submission.studentId === studentId
                    ) || false,
                  submissions:
                    assignment.submissions?.filter(
                      (submission) => submission.studentId === studentId
                    ) || [],
                  isActive: assignment.dueDate ? new Date(assignment.dueDate) >= new Date() : false,
                })
              );
              setAssignments(updatedAssignments);
            } else {
              toast.error('Failed to load assignments');
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching assignments:', error);
        toast.error(error.response?.data?.message || 'Failed to load assignments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [studentId, accessToken]);

  // Handle assignment submission
  const handleSubmitAssignment = async (assignmentId: string, submissionData: any) => {
    try {
      const formData = new FormData();
      formData.append('studentId', studentId || '');
      formData.append(
        'studentName',
        `${authState.user?.firstname || ''} ${authState.user?.lastname || ''}`.trim() || 'Unknown'
      );
      formData.append(
        'hasSubmissionText',
        String(!!submissionData.submissionText?.trim())
      );
      formData.append('fileCount', String(submissionData.files?.length || 0));

      if (submissionData.submissionText?.trim()) {
        formData.append('submissionText', submissionData.submissionText.trim());
      }

      if (submissionData.files?.length > 0) {
        formData.append(
          'fileNames',
          JSON.stringify(submissionData.files.map((f: any) => f.name))
        );
        submissionData.files.forEach((file: any) => {
          formData.append('files', file);
        });
      }

      const response = await axios.post(
        `/api/assignments/${assignmentId}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment._id === assignmentId
              ? {
                  ...assignment,
                  hasSubmitted: true,
                  submissions: [
                    response.data.data,
                    ...(assignment.submissions || []),
                  ],
                }
              : assignment
          )
        );
        setIsSubmissionModalOpen(false);
        setSelectedAssignment(null);
        toast.success('Assignment submitted successfully!');
      } else {
        toast.error(response.data.message || 'Failed to submit assignment');
      }
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    }
  };

  // Handle opening assignment detail
  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  // Handle opening submission modal
  const handleStartSubmission = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionModalOpen(true);
  };

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter((assignment) => {
      if (filters.course !== 'all' && assignment.courseId?._id !== filters.course)
        return false;
      if (
        filters.department !== 'all' &&
        assignment.departmentId?._id !== filters.department
      )
        return false;
      if (filters.status !== 'all') {
        const now = new Date();
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

        switch (filters.status) {
          case 'pending':
            return (
              (!assignment.submissions || assignment.submissions.length === 0) &&
              dueDate &&
              dueDate >= now
            );
          case 'submitted':
            return assignment.submissions && assignment.submissions.length > 0;
          case 'overdue':
            return (
              (!assignment.submissions || assignment.submissions.length === 0) &&
              dueDate &&
              dueDate < now
            );
          case 'upcoming':
            return (
              (!assignment.submissions || assignment.submissions.length === 0) &&
              dueDate &&
              dueDate >= now
            );
          default:
            return true;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'dueDate':
          return a.dueDate && b.dueDate
            ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            : 0;
        case 'createdAt':
          return a.createdAt && b.createdAt
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : 0;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Calculate pagination
  const totalItems = filteredAssignments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  // Reset to first page when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Get unique courses and departments from schedules
  const uniqueCourses = [
    ...new Set(
      studentSchedules
        .map((s: any) => s.courseId)
        .filter((courseId): courseId is { _id: string; name?: string } => !!courseId)
    ),
  ];
  const uniqueDepartments = [
    ...new Set(
      studentSchedules
        .map((s: any) => s.departmentId)
        .filter((departmentId): departmentId is { _id: string } => !!departmentId)
    ),
  ];

  // Calculate statistics
  const pendingAssignments = assignments.filter(
    (a) =>
      (!a.submissions || a.submissions.length === 0) &&
      a.dueDate &&
      new Date(a.dueDate) >= new Date()
  ).length;
  const submittedAssignments = assignments.filter(
    (a) => a.submissions && a.submissions.length > 0
  ).length;
  const overdueAssignments = assignments.filter(
    (a) =>
      (!a.submissions || a.submissions.length === 0) &&
      a.dueDate &&
      new Date(a.dueDate) < new Date()
  ).length;
  const upcomingDeadlines = assignments.filter((a) => {
    if (!a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return (
      (!a.submissions || a.submissions.length === 0) &&
      dueDate <= threeDaysFromNow &&
      dueDate >= new Date()
    );
  }).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header role="student" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Assignments
                  </h1>
                  <p className="text-gray-600">
                    View and submit your course assignments
                  </p>
                </div>
              </div>
            </div>
            <AssignmentFilters
              filters={filters}
              setFilters={setFilters}
              courses={uniqueCourses}
              departments={uniqueDepartments}
              isStudent={true}
              
            />

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md animate-pulse h-48"></div>
                ))}
              </div>
            ) : filteredAssignments.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {currentAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment._id}
                      assignment={assignment}
                      onView={() => handleViewAssignment(assignment)}
                      onStartSubmission={() => handleStartSubmission(assignment)}
                      className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                      showActions={true}  
                      compact={false} onSubmit={ (assignment) => handleStartSubmission(assignment) }
                    />
                  ))}
                </div>
                <Pagination
                totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No assignments found.</h2>
                <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
              </div>
            )}
          </div>
        </main>
        {selectedAssignment && (
          <AssignmentDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            assignment={selectedAssignment}
            onStartSubmission={() => handleStartSubmission(selectedAssignment)}
          />
        )}

        {selectedAssignment && (
          <SubmissionModal
            isOpen={isSubmissionModalOpen}
            onClose={() => setIsSubmissionModalOpen(false)}
            assignment={selectedAssignment}
            onSubmit={handleSubmitAssignment}
          />
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;