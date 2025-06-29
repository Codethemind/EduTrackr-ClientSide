import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { MdAssignment } from 'react-icons/md';

const UpcomingAssignments = ({ onView }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authState = useSelector((state) => state.auth);
  const studentId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!studentId || !accessToken) {
        setLoading(false);
        setError('Authentication required');
        return;
      }

      try {
        setLoading(true);
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
              const formattedAssignments = assignmentsResponse.data.data
                .map((item) => ({
                  _id: item._id,
                  title: item.title,
                  course: item.courseId?.name || 'Course Not Available',
                  courseName: item.courseId?.name || 'Course Not Available', // For AssignmentDetailModal
                  departmentName: student.departmentName || 'Unknown Department', // For AssignmentDetailModal
                  dueDate: item.dueDate,
                  description: item.description,
                  instructions: item.instructions,
                  maxMarks: item.maxMarks,
                  teacherId: item.teacherId,
                  submissionFormat: item.submissionFormat,
                  attachments: item.attachments,
                  submissions: item.submissions?.filter((s) => s.studentId === studentId) || [],
                  status: item.submissions?.some((s) => s.studentId === studentId)
                    ? 'Submitted'
                    : new Date(item.dueDate) < new Date()
                    ? 'Overdue'
                    : 'Pending',
                  grade: item.submissions?.find((s) => s.studentId === studentId)?.grade,
                }))
                .filter((item) => item.status !== 'Submitted')
                .slice(0, 5);
              setAssignments(formattedAssignments);
            } else {
              throw new Error('Failed to load assignments');
            }
          } else {
            throw new Error('Student department not found');
          }
        } else {
          throw new Error('Failed to load student information');
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load assignments';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [studentId, accessToken]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Due Today';
      if (diffDays === 1) return 'Due Tomorrow';
      if (diffDays < 0) return 'Overdue';
      return `Due in ${diffDays} days`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
        <a href="/student/assignments" className="text-sm text-blue-600 hover:text-blue-700">
          View All
        </a>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No upcoming assignments
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{assignment.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <MdAssignment className="mr-1" /> {assignment.course}
                  </span>
                  <span>📅 {formatDate(assignment.dueDate)}</span>
                  {assignment.grade && <span>📊 Grade: {assignment.grade}</span>}
                </div>
                {assignment.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  onClick={() => onView(assignment)}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingAssignments;