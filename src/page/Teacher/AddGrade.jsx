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
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/assignments/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.data.success) {
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

  // Handle assignment selection
  const handleAssignmentSelect = async (assignmentId) => {
    if (!assignmentId) {
      setSelectedAssignment(null);
      setStudents([]);
      setGrades({});
      return;
    }

    setIsLoadingStudents(true);
    const assignment = assignments.find(a => a._id === assignmentId);
    setSelectedAssignment(assignment);

    try {
      // Fetch students for the selected assignment
      const response = await axios.get(`/api/assignments/${assignmentId}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.data.success) {
        setStudents(response.data.data);
        // Initialize grades object with student IDs
        const initialGrades = {};
        response.data.data.forEach(student => {
          initialGrades[student._id] = student.grade || '';
        });
        setGrades(initialGrades);
      } else {
        toast.error('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Handle grade change
  const handleGradeChange = (studentId, grade) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: grade
    }));
  };

  // Handle grade submission
  const handleSubmitGrades = async () => {
    if (!selectedAssignment) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/grades/teacher/${selectedAssignment._id}`,
        {
          grades: Object.entries(grades).map(([studentId, grade]) => ({
            studentId,
            grade: parseInt(grade) || 0
          }))
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      if (response.data.success) {
        toast.success('Grades submitted successfully');
        // Refresh the students list to show updated grades
        handleAssignmentSelect(selectedAssignment._id);
      } else {
        toast.error('Failed to submit grades');
      }
    } catch (error) {
      console.error('Error submitting grades:', error);
      toast.error('Failed to submit grades');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Grades</h1>
                  <p className="text-gray-600">Submit grades for your assignments</p>
                </div>
              </div>
            </div>

            {/* Assignment Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="ml-2 text-gray-600">Loading assignments...</span>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No assignments available for grading</p>
                </div>
              ) : (
                <AssignmentSelector
                  assignments={assignments}
                  selectedAssignment={selectedAssignment}
                  onSelect={handleAssignmentSelect}
                />
              )}
            </div>

            {/* Grade Entry Table */}
            {selectedAssignment && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedAssignment.title}
                  </h2>
                  <p className="text-gray-600">
                    Course: {selectedAssignment.course?.name}
                  </p>
                </div>

                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="ml-2 text-gray-600">Loading students...</span>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No students have submitted this assignment yet</p>
                  </div>
                ) : (
                  <>
                    <GradeEntryTable
                      students={students}
                      grades={grades}
                      onGradeChange={handleGradeChange}
                    />
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSubmitGrades}
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded-lg text-white font-medium ${
                          isSubmitting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Grades'}
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