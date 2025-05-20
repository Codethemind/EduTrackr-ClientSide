import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch student data using id
    // For now, using dummy data
    setStudent({
      id: id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      class: 'Computer Science 101',
      grade: 'A',
      attendance: '95%',
      enrollmentDate: '2023-09-01',
      assignments: [
        {
          id: 1,
          title: 'Web Development Project',
          status: 'Submitted',
          grade: 'A',
          dueDate: '2024-03-15',
        },
        {
          id: 2,
          title: 'Database Design Assignment',
          status: 'Pending',
          grade: null,
          dueDate: '2024-03-20',
        },
      ],
      attendanceHistory: [
        { date: '2024-03-01', status: 'Present' },
        { date: '2024-02-28', status: 'Present' },
        { date: '2024-02-27', status: 'Absent' },
      ],
    });
    setLoading(false);
  }, [id]);

  if (loading || !student) {
    return (
      <div className="flex h-screen bg-gray-50">
        <TeacherSideBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header role="teacher" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="container mx-auto">
              <p className="text-gray-600">Loading...</p>
            </div>
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">
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
              {/* Student Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <div className="flex flex-col items-center">
                      <img
                        className="h-24 w-24 rounded-full"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0D8ABC&color=fff&size=256`}
                        alt=""
                      />
                      <h2 className="mt-4 text-xl font-semibold text-gray-900">{student.name}</h2>
                      <p className="text-gray-600">{student.email}</p>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-gray-900">{student.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Class</label>
                        <p className="mt-1 text-gray-900">{student.class}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Enrollment Date</label>
                        <p className="mt-1 text-gray-900">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments and Attendance */}
              <div className="lg:col-span-2 space-y-6">
                {/* Assignments */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Assignments</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Grade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Due Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {student.assignments.map((assignment) => (
                            <tr key={assignment.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {assignment.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  assignment.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {assignment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {assignment.grade || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Attendance History */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance History</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {student.attendanceHistory.map((record, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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