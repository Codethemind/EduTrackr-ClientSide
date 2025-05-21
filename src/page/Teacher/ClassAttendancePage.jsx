import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';

const ClassAttendancePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // State for class details
  const [classDetails, setClassDetails] = useState({
    id: classId,
    name: 'Introduction to Computer Science',
    department: 'Computer Science',
    semester: 'Spring 2025',
    schedule: 'Monday, Wednesday 10:00 AM - 11:30 AM',
    room: 'Room 301'
  });

  // State for attendance history
  const [attendanceHistory, setAttendanceHistory] = useState([
    {
      id: 1,
      date: '2025-05-15',
      presentCount: 26,
      absentCount: 2,
      status: 'completed'
    },
    {
      id: 2,
      date: '2025-05-13',
      presentCount: 24,
      absentCount: 4,
      status: 'completed'
    },
    {
      id: 3,
      date: '2025-05-08',
      presentCount: 25,
      absentCount: 3,
      status: 'completed'
    }
  ]);

  // State for students
  const [students, setStudents] = useState([
    { id: 1, name: 'Alex Johnson', studentId: 'S1001', attendance: [] },
    { id: 2, name: 'Jamie Smith', studentId: 'S1002', attendance: [] },
    { id: 3, name: 'Taylor Wilson', studentId: 'S1003', attendance: [] },
    { id: 4, name: 'Casey Brown', studentId: 'S1004', attendance: [] },
    { id: 5, name: 'Jordan Lee', studentId: 'S1005', attendance: [] },
    { id: 6, name: 'Morgan Davis', studentId: 'S1006', attendance: [] },
    { id: 7, name: 'Riley Martin', studentId: 'S1007', attendance: [] },
    { id: 8, name: 'Quinn Thompson', studentId: 'S1008', attendance: [] },
    { id: 9, name: 'Avery Martinez', studentId: 'S1009', attendance: [] },
    { id: 10, name: 'Drew Rodriguez', studentId: 'S1010', attendance: [] }
  ]);

  // State for current attendance session
  const [currentAttendance, setCurrentAttendance] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    attendance: {}
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState('take');

  useEffect(() => {
    // Initialize attendance for all students
    const initialAttendance = {};
    students.forEach(student => {
      initialAttendance[student.id] = 'present'; // Default all students to present
    });
    setCurrentAttendance(prev => ({
      ...prev,
      attendance: initialAttendance
    }));

    // TODO: Fetch class details, attendance history, and students from API
    // fetchClassDetails(classId);
    // fetchAttendanceHistory(classId);
    // fetchStudents(classId);
  }, [classId]);

  const handleAttendanceChange = (studentId, status) => {
    setCurrentAttendance(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [studentId]: status
      }
    }));
  };

  const saveAttendance = () => {
    // Count present and absent students
    let presentCount = 0;
    let absentCount = 0;
    
    Object.values(currentAttendance.attendance).forEach(status => {
      if (status === 'present') presentCount++;
      else absentCount++;
    });
    
    // Create new attendance record
    const newAttendanceRecord = {
      id: attendanceHistory.length + 1,
      date: currentAttendance.date,
      presentCount,
      absentCount,
      status: 'completed'
    };
    
    // Update attendance history
    setAttendanceHistory([newAttendanceRecord, ...attendanceHistory]);
    
    // Reset current attendance
    setCurrentAttendance({
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      attendance: {}
    });
    
    // Switch to history tab
    setActiveTab('history');
    
    // TODO: Send attendance data to backend
    // saveAttendanceData(classId, currentAttendance);
  };

  const getAttendanceRate = (present, total) => {
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <div className="flex items-center">
                  <button 
                    onClick={() => navigate('/teacher/my-classes')}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <h1 className="text-2xl font-semibold text-gray-900">Attendance: {classDetails.name}</h1>
                </div>
                <p className="text-gray-600 mt-1">
                  {classDetails.department} • {classDetails.semester} • {classDetails.room}
                </p>
                <p className="text-gray-600">
                  Schedule: {classDetails.schedule}
                </p>
              </div>
              <Link
                to={`/teacher/my-classes/${classId}`}
                className="mt-4 md:mt-0 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back to Class
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'take'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('take')}
              >
                Take Attendance
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'history'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('history')}
              >
                Attendance History
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'stats'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                Statistics
              </button>
            </div>

            {/* Take Attendance Tab */}
            {activeTab === 'take' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Take Attendance</h2>
                      <p className="text-gray-600">Mark attendance for today's class</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                      <label htmlFor="attendance-date" className="block text-sm font-medium text-gray-700 mr-4">
                        Date:
                      </label>
                      <input
                        type="date"
                        id="attendance-date"
                        value={currentAttendance.date}
                        onChange={(e) => setCurrentAttendance(prev => ({ ...prev, date: e.target.value }))}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <input
                                  id={`present-${student.id}`}
                                  name={`attendance-${student.id}`}
                                  type="radio"
                                  value="present"
                                  checked={currentAttendance.attendance[student.id] === 'present'}
                                  onChange={() => handleAttendanceChange(student.id, 'present')}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <label htmlFor={`present-${student.id}`} className="ml-2 block text-sm text-gray-700">
                                  Present
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id={`absent-${student.id}`}
                                  name={`attendance-${student.id}`}
                                  type="radio"
                                  value="absent"
                                  checked={currentAttendance.attendance[student.id] === 'absent'}
                                  onChange={() => handleAttendanceChange(student.id, 'absent')}
                                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                />
                                <label htmlFor={`absent-${student.id}`} className="ml-2 block text-sm text-gray-700">
                                  Absent
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id={`late-${student.id}`}
                                  name={`attendance-${student.id}`}
                                  type="radio"
                                  value="late"
                                  checked={currentAttendance.attendance[student.id] === 'late'}
                                  onChange={() => handleAttendanceChange(student.id, 'late')}
                                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                                />
                                <label htmlFor={`late-${student.id}`} className="ml-2 block text-sm text-gray-700">
                                  Late
                                </label>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                  <button
                    type="button"
                    onClick={saveAttendance}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Attendance
                  </button>
                </div>
              </div>
            )}

            {/* Attendance History Tab */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Attendance History</h2>
                  <p className="text-gray-600">View past attendance records</p>
                </div>
                {attendanceHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Present
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Absent
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendance Rate
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceHistory.map((record) => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.presentCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.absentCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900 mr-2">
                                  {getAttendanceRate(record.presentCount, record.presentCount + record.absentCount)}%
                                </span>
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${getAttendanceRate(record.presentCount, record.presentCount + record.absentCount)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link 
                                to={`/teacher/my-classes/${classId}/attendance/${record.id}`} 
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View Details
                              </Link>
                              <button 
                                className="text-gray-600 hover:text-gray-900"
                                onClick={() => {
                                  // TODO: Add edit functionality
                                  console.log('Edit attendance record:', record.id);
                                }}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-600">No attendance records found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Attendance Statistics</h2>
                  <p className="text-gray-600">Overview of attendance patterns</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Attendance</h3>
                      {attendanceHistory.length > 0 ? (
                        <>
                          <div className="text-3xl font-bold text-gray-900 mb-2">
                            {getAttendanceRate(
                              attendanceHistory.reduce((sum, record) => sum + record.presentCount, 0),
                              attendanceHistory.reduce((sum, record) => sum + record.presentCount + record.absentCount, 0)
                            )}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div 
                              className="bg-green-600 h-4 rounded-full" 
                              style={{ 
                                width: `${getAttendanceRate(
                                  attendanceHistory.reduce((sum, record) => sum + record.presentCount, 0),
                                  attendanceHistory.reduce((sum, record) => sum + record.presentCount + record.absentCount, 0)
                                )}%` 
                              }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Based on {attendanceHistory.length} class sessions
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-600">No data available</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Trend</h3>
                      {attendanceHistory.length > 0 ? (
                        <div className="h-40 flex items-end justify-between">
                          {attendanceHistory.slice(0, 5).reverse().map((record, index) => (
                            <div key={record.id} className="flex flex-col items-center">
                              <div className="text-xs text-gray-500 mb-1">
                                {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                              </div>
                              <div 
                                className="w-8 bg-blue-500" 
                                style={{ 
                                  height: `${getAttendanceRate(record.presentCount, record.presentCount + record.absentCount)}%` 
                                }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No data available</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Stats</h3>
                      {attendanceHistory.length > 0 ? (
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Classes conducted:</span>
                            <span className="font-medium">{attendanceHistory.length}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Total students:</span>
                            <span className="font-medium">{students.length}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Perfect attendance:</span>
                            <span className="font-medium">3 students</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Low attendance:</span>
                            <span className="font-medium">1 student</span>
                          </li>
                        </ul>
                      ) : (
                        <p className="text-gray-600">No data available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Student Attendance Overview</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attendance Rate
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Present
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Absent
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Late
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student, index) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.studentId}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-900 mr-2">
                                    {90 - index * 5}%
                                  </span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-green-600 h-2.5 rounded-full" 
                                      style={{ width: `${90 - index * 5}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {3 - Math.floor(index / 4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {Math.floor(index / 4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {index % 2}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassAttendancePage;