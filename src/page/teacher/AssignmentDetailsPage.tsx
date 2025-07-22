""// components/teacher/assignments/AssignmentDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';

// TypeScript Interfaces
interface FileEntry {
  name: string;
  url: string;
}

interface Submission {
  _id: string;
  studentId?: string;
  studentName?: string;
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  submissionContent: {
    text: string;
    files: (string | FileEntry)[];
  };
  assignmentId?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  createdAt: string;
  maxMarks: number;
  submissions?: Submission[];
  courseId: string;
  departmentId: string;
  teacherId?: string;
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number;
  submissionFormat: string;
  isGroupAssignment: boolean;
  maxGroupSize: number;
  attachments?: { name: string; url: string }[];
  totalStudents?: number;
  courseName: string;
  departmentName: string;
  teacherName?: string;
}

interface AuthState {
  user?: { _id?: string; id?: string };
  accessToken?: string;
}

const AssignmentDetailsPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const authState = useSelector((state: { auth: AuthState }) => state.auth);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [grades, setGrades] = useState<{ [studentId: string]: string }>({});
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);

  const teacherId = authState?.user?._id || authState?.user?.id;
  const accessToken = authState?.accessToken;

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!teacherId || !accessToken || !assignmentId) {
        toast.error('Please log in to view assignment details');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success) {
          const fetchedAssignment = response.data.data;
          setAssignment(fetchedAssignment);
          const initialGrades: { [studentId: string]: string } = {};
          fetchedAssignment.submissions?.forEach((submission: Submission) => {
            initialGrades[submission.studentId || submission._id] = submission.grade?.toString() || '';
          });
          setGrades(initialGrades);
        } else {
          toast.error('Failed to load assignment details');
        }
      } catch (error) {
        toast.error('Failed to load assignment details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId, teacherId, accessToken]);

  const normalizeFileEntry = (files: (string | FileEntry)[]): FileEntry | null => {
    if (!files || files.length === 0) return null;
    const preferredFile = files.find((file) => typeof file === 'string' && file.startsWith('http')) || files[0];
    if (!preferredFile) return null;
    if (typeof preferredFile === 'string') {
      const fileName = preferredFile.split('/').pop()?.split('?')[0] || `attachment-${Date.now()}.pdf`;
      const fileUrl = preferredFile.startsWith('http')
        ? preferredFile
        : `https://res.cloudinary.com/djpom2k7h/image/upload/v1751429768/${preferredFile}.pdf`;
      return { name: fileName, url: fileUrl };
    }
    return {
      name: preferredFile.name || `attachment-${Date.now()}.pdf`,
      url: preferredFile.url,
    };
  };

  const handleGradeChange = (studentId: string, grade: string) => {
    const value = grade === '' ? '' : Math.max(0, Math.min(assignment?.maxMarks || 100, parseInt(grade) || 0)).toString();
    setGrades((prev) => ({ ...prev, [studentId]: value }));
  };

  const submitGrades = async (gradesToSubmit: { studentId: string; grade: number }[]) => {
    if (!assignmentId) {
      toast.error('Invalid assignment ID');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/assignments/${assignmentId}/grade`,
        { grades: gradesToSubmit },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
    } finally {
      setIsSubmitting(false);
      setGradingSubmissionId(null);
    }
  };

  const handleSubmitGrade = (submissionId: string, grade: string) => {
    if (!assignment || !submissionId || !grade) {
      toast.error('Please enter a valid grade');
      return;
    }
    const gradeValue = parseInt(grade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > (assignment.maxMarks || 100)) {
      toast.error(`Grade must be between 0 and ${assignment.maxMarks || 100}`);
      return;
    }
    const studentId = assignment.submissions?.find((sub) => sub._id === submissionId)?.studentId || submissionId;
    const gradesToSubmit = [{ studentId, grade: gradeValue }];
    submitGrades(gradesToSubmit);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!assignment) {
    return <div className="text-center py-8">Assignment not found.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 md:ml-64">
          <button
              onClick={() => navigate('/teacher/assignments')}
              className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Assignments
            </button>
          <div className="container mx-auto px-6 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-sm text-gray-600">{assignment.description}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-2 border">Student</th>
                    <th className="px-4 py-2 border">Submitted At</th>
                    <th className="px-4 py-2 border">Late</th>
                    <th className="px-4 py-2 border">Grade</th>
                    <th className="px-4 py-2 border">Content</th>
                    <th className="px-4 py-2 border">Attachment</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignment.submissions?.map((submission) => {
                    const normalizedFile = normalizeFileEntry(submission.submissionContent.files);
                    const studentId = submission.studentId || submission._id;
                    return (
                      <tr key={submission._id} className="border-t">
                        <td className="px-4 py-2 border">{submission.studentName || 'Unknown'}</td>
                        <td className="px-4 py-2 border">{new Date(submission.submittedAt).toLocaleString()}</td>
                        <td className="px-4 py-2 border">{submission.isLate ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 border">{submission.grade ?? 'Not graded'}</td>
                        <td className="px-4 py-2 border">{submission.submissionContent.text}</td>
                        <td className="px-4 py-2 border">
                          {normalizedFile ? (
                            <a
                              href={normalizedFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleFileClick(normalizedFile.url, normalizedFile.name)}
                              className="text-blue-600 hover:underline"
                            >
                              {normalizedFile.name}
                            </a>
                          ) : (
                            'No file'
                          )}
                        </td>
                        <td className="px-4 py-2 border">
                          {gradingSubmissionId === submission._id ? (
                            <div className="flex flex-col space-y-2">
                              <input
                                type="number"
                                value={grades[studentId] || ''}
                                onChange={(e) => handleGradeChange(studentId, e.target.value)}
                                placeholder="Grade"
                                className="border px-2 py-1 rounded"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSubmitGrade(submission._id, grades[studentId])}
                                  className="bg-green-500 text-white px-3 py-1 rounded"
                                >
                                  Submit
                                </button>
                                <button
                                  onClick={() => setGradingSubmissionId(null)}
                                  className="bg-gray-500 text-white px-3 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setGradingSubmissionId(submission._id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                              {submission.grade !== undefined ? 'Edit Grade' : 'Grade'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssignmentDetailsPage;