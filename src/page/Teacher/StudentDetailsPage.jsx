import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance.jsx';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        // Fetch student details
        const response = await axios.get(`/api/students/${id}`);
        const studentData = response.data.data || response.data;
        
        setStudent(studentData);
        
        // You would also fetch assignments and attendance in separate API calls
        // Examples:
        try {
          const assignmentsResponse = await axios.get(`/api/assignments/student/${id}`);
          setAssignments(assignmentsResponse.data.data || []);
        } catch (error) {
          console.error('Error fetching assignments:', error);
          setAssignments([]);
        }
        
        try {
          const attendanceResponse = await axios.get(`/api/attendance/student/${id}`);
          setAttendanceHistory(attendanceResponse.data.data || []);
        } catch (error) {
          console.error('Error fetching attendance:', error);
          setAttendanceHistory([]);
        }
        
      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id]);

  if (loading || !student) {
    return (
      <div className="flex h-screen bg-gray-50">
        <TeacherSideBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header role="teacher" />
          <main className="flex-1 p-6">
            <div className="text-gray-600">Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Student Details</h1>
              <button
                onClick={() => navigate('/teacher/students')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Students
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col items-center">
                  <img
                    className="h-24 w-24 rounded-full"
                    src={student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstname + ' ' + student.lastname)}&background=0D8ABC&color=fff&size=256`}
                    alt={`${student.firstname} ${student.lastname}`}
                  />
                  <h2 className="mt-4 text-xl font-semibold">{student.firstname} {student.lastname}</h2>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{student.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <p className="text-gray-900">{student.departmentName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Class</label>
                    <p className="text-gray-900">{student.class || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enrollment Date</label>
                    <p className="text-gray-900">
                      {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignments and Attendance */}
              <div className="lg:col-span-2 space-y-6">
                {/* Assignments Table */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Assignments</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {assignments.length > 0 ? (
                          assignments.map((assignment) => (
                            <tr key={assignment._id}>
                              <td className="px-6 py-4 text-sm text-gray-900">{assignment.title}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                                  assignment.status === 'Submitted'
                                    ? 'bg-green-100 text-green-800'
                                    : assignment.status === 'Late'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {assignment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {assignment.grade || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                              No assignments found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium mb-4">Attendance History</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {attendanceHistory.length > 0 ? (
                          attendanceHistory.map((record, index) => (
                            <tr key={record._id || index}>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {record.date ? new Date(record.date).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                                  record.status === 'Present'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                              No attendance records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDetailsPage;