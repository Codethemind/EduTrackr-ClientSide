import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';

const ClassesPage = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [selectedSemester, setSelectedSemester] = useState('Spring 2025');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  
  // Mock data for demonstration
  const [classes, setClasses] = useState([
    {
      id: 1,
      name: 'Introduction to Computer Science',
      description: 'Foundational concepts in computer science',
      schedule: 'Monday, Wednesday 10:00 AM - 11:30 AM',
      semester: 'Spring 2025',
      department: 'Computer Science',
      room: 'Room 301',
      students: 28,
      capacity: 30,
      nextClass: '2025-05-22T10:00:00',
      attendance: {
        total: 14,
        present: 12,
        absent: 2
      }
    },
    {
      id: 2,
      name: 'Data Structures and Algorithms',
      description: 'Advanced programming concepts',
      schedule: 'Tuesday, Thursday 1:00 PM - 2:30 PM',
      semester: 'Spring 2025',
      department: 'Computer Science',
      room: 'Room 205',
      students: 25,
      capacity: 30,
      nextClass: '2025-05-23T13:00:00',
      attendance: {
        total: 13,
        present: 11,
        absent: 2
      }
    },
    {
      id: 3,
      name: 'Calculus I',
      description: 'Introduction to differential calculus',
      schedule: 'Monday, Wednesday, Friday 9:00 AM - 10:00 AM',
      semester: 'Fall 2024',
      department: 'Mathematics',
      room: 'Room 102',
      students: 35,
      capacity: 40,
      nextClass: null,
      attendance: {
        total: 28,
        present: 24,
        absent: 4
      }
    }
  ]);

  // Filter classes based on selected tab and filters
  const filteredClasses = classes.filter(cls => {
    if (activeTab === 'current' && cls.semester !== 'Spring 2025') return false;
    if (activeTab === 'past' && cls.semester === 'Spring 2025') return false;
    if (selectedDepartment !== 'All' && cls.department !== selectedDepartment) return false;
    if (activeTab === 'current' && selectedSemester !== cls.semester) return false;
    return true;
  });

  // Available semesters
  const semesters = ['Spring 2025', 'Fall 2024', 'Spring 2024'];
  
  // Available departments
  const departments = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];

  // Format date for next class
  const formatNextClass = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header role="teacher" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">My Classes</h1>
              <Link
                to="/teacher/my-classes/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Class
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'current'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('current')}
              >
                Current Semester
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'past'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('past')}
              >
                Past Semesters
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              {activeTab === 'current' && (
                <div className="w-64">
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="w-64">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Classes list */}
            <div className="bg-white rounded-lg shadow">
              {filteredClasses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Schedule
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semester
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Next Class
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredClasses.map((cls) => (
                        <tr key={cls.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                            <div className="text-sm text-gray-500">{cls.room}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cls.schedule}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cls.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cls.semester}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cls.students}/{cls.capacity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatNextClass(cls.nextClass)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Last: {cls.attendance.present}/{cls.attendance.total} Present
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${(cls.attendance.present / cls.attendance.total) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              to={`/teacher/my-classes/${cls.id}`} 
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View
                            </Link>
                            <Link 
                              to={`/teacher/my-classes/${cls.id}/attendance`} 
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Attendance
                            </Link>
                            <Link 
                              to={`/teacher/my-classes/${cls.id}/edit`} 
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600">No classes found matching your criteria.</p>
                  <Link
                    to="/teacher/my-classes/create"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Your First Class
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassesPage;