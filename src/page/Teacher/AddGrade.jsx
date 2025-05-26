import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import AssignmentSelector from '../../components/teacher/Grades/AssignmentSelector';
import GradeEntryTable from '../../components/teacher/Grades/GradeEntryTable';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const AddGrade = () => {
  const authState = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const teacherId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  // Fetch teacher's assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!teacherId || !accessToken) {
        toast.error('Please log in to access assignments.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/assignments/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.success) {
          setAssignments(response.data.data);
        } else {
          toast.error(response.data.message || 'Failed to load assignments.');
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          'Unable to load assignments due to a server error.';
        toast.error(message);
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error('Unauthorized access. Please log in again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [teacherId, accessToken]);

  // Handle assignment selection
  const handleAssignmentSelect = (assignmentId) => {
    if (!assignmentId) {
      setSelectedAssignment(null);
      setStudents([]);
      setGrades({});
      return;
    }

    setIsLoadingStudents(true);
    const assignment = assignments.find((a) => a._id === assignmentId);
    setSelectedAssignment(assignment);

    // Derive students from submissions
    const submittedStudents = assignment.submissions.map((submission) => ({
      _id: submission.studentId,
      studentName: submission.studentName || 'Unknown',
      studentId: submission.studentId,
      submission: {
        content: submission.submissionContent?.text || '',
        files: submission.submissionContent?.files || [],
        submittedAt: submission.submittedAt || null,
      },
    }));

    setStudents(submittedStudents);

    // Initialize grades from submissions
    const initialGrades = {};
    submittedStudents.forEach((student) => {
      const submission = assignment.submissions.find(
        (sub) => sub.studentId === student._id
      );
      initialGrades[student._id] = submission?.grade?.toString() || '';
    });
    setGrades(initialGrades);

    setIsLoadingStudents(false);
  };

  // Handle grade change
  const handleGradeChange = (studentId, grade) => {
    const value = grade === '' ? '' : Math.max(0, Math.min(100, parseInt(grade) || 0));
    setGrades((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  // Handle grade submission
  const handleSubmitGrades = async () => {
    if (!selectedAssignment) {
      toast.error('Please select an assignment.');
      return;
    }

    // Validate grades
    const invalidGrades = Object.entries(grades).filter(
      ([_, grade]) => grade !== '' && (Number(grade) < 0 || Number(grade) > 100)
    );
    if (invalidGrades.length > 0) {
      toast.error('All grades must be between 0 and 100.');
      return;
    }

    const gradesToSubmit = Object.entries(grades)
      .filter(([_, grade]) => grade !== '')
      .map(([studentId, grade]) => ({
        studentId,
        grade: parseInt(grade),
      }));

    if (gradesToSubmit.length === 0) {
      toast.error('Please enter at least one grade to submit.');
      return;
    }

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit these grades? This action cannot be undone.'
    );
    if (!confirmSubmit) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/assignments/${selectedAssignment._id}/grade`,
        { grades: gradesToSubmit },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Grades submitted successfully!');
        // Refresh assignments to update submissions
        const responseAssignments = await axios.get(`/api/assignments/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (responseAssignments.data.success) {
          setAssignments(responseAssignments.data.data);
          handleAssignmentSelect(selectedAssignment._id); // Refresh students and grades
        }
      } else {
        toast.error(response.data.message || 'Failed to submit grades.');
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to submit grades due to a server error.';
      toast.error(message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Unauthorized access. Please log in again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Add Grades</h1>
              <p className="mt-2 text-gray-600 text-lg">
                Select an assignment and enter grades for students who have submitted.
              </p>
            </div>

            {/* Assignment Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600 text-lg">Loading assignments...</span>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-6">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500 text-lg">
                    No assignments available for grading.
                  </p>
                </div>
              ) : (
                <AssignmentSelector
                  assignments={assignments}
                  selectedAssignment={selectedAssignment}
                  onSelect={handleAssignmentSelect}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* Grade Entry Table */}
            {selectedAssignment && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedAssignment.title}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Course: {selectedAssignment.courseName}
                  </p>
                  <p className="text-gray-600 text-lg">
                    Submissions: {selectedAssignment.submissions?.length || 0} / {selectedAssignment.totalStudents || 0}
                  </p>
                </div>

                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3 text-gray-600 text-lg">Loading students...</span>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="mt-2 text-gray-500 text-lg">
                      No students have submitted this assignment yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <GradeEntryTable
                      students={students}
                      grades={grades}
                      onGradeChange={handleGradeChange}
                    />
                    <div className="mt-6 flex justify-end sticky bottom-0 bg-white py-4">
                      <button
                        onClick={handleSubmitGrades}
                        disabled={isSubmitting || !Object.values(grades).some((g) => g !== '')}
                        className={`px-6 py-3 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
                          isSubmitting || !Object.values(grades).some((g) => g !== '')
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        }`}
                        aria-label="Submit grades"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Submitting...
                          </span>
                        ) : (
                          'Submit Grades'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddGrade;