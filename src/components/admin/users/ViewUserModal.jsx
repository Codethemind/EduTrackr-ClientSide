import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewUserModal = ({ user, onClose }) => {
  if (!user) return null; // safety check

  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch departments and courses
  useEffect(() => {
    const fetchDepartmentsAndCourses = async () => {
      try {
        setLoading(true);
        const [departmentsResponse, coursesResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/departments'),
          axios.get('http://localhost:3000/api/courses')
        ]);

        setAvailableDepartments(departmentsResponse.data.data);
        setAvailableCourses(coursesResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentsAndCourses();
  }, []);

  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const department = availableDepartments.find(dept => dept._id === departmentId);
    return department ? department.name : departmentId;
  };

  // Get course details by ID
  const getUserCourses = () => {
    if (!user.courses || !user.courses.length) return [];

    return user.courses.map(courseId => {
      const course = availableCourses.find(c => c._id === courseId);
      return course || { name: "Unknown Course", code: "N/A" };
    });
  };

  const renderCommonDetails = () => (
    <>
      {/* Profile Image */}
      {user.profileImage && (
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
            <img 
              src={user.profileImage} 
              alt={`${user.firstname || ''} ${user.lastname || ''}`}
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      )}

      <div>
        <p className="text-sm text-gray-500">Username</p>
        <p className="font-medium">{user.username}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Email</p>
        <p className="font-medium">{user.email}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Role</p>
        <p className="font-medium">{user.role}</p>
      </div>

      {user.firstname && (
        <div>
          <p className="text-sm text-gray-500">First Name</p>
          <p className="font-medium">{user.firstname}</p>
        </div>
      )}

      {user.lastname && (
        <div>
          <p className="text-sm text-gray-500">Last Name</p>
          <p className="font-medium">{user.lastname}</p>
        </div>
      )}
    </>
  );

  const renderStudentDetails = () => (
    <>
      <div>
        <p className="text-sm text-gray-500">Department</p>
        <p className="font-medium">{loading ? 'Loading...' : getDepartmentName(user.department)}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Class</p>
        <p className="font-medium">{user.class}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Courses</p>
        {loading ? (
          <p>Loading courses...</p>
        ) : user.courses && user.courses.length > 0 ? (
          <ul className="list-disc ml-5">
            {getUserCourses().map((course, index) => (
              <li key={index}>
                {course.name} ({course.code})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No courses assigned</p>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-500">Blocked Status</p>
        <p className="font-medium">{user.isBlock ? 'Blocked' : 'Active'}</p>
      </div>
    </>
  );

  const renderTeacherDetails = () => (
    <div>
      <p className="text-sm text-gray-500">Department</p>
      <p className="font-medium">{loading ? 'Loading...' : getDepartmentName(user.department)}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="ti ti-x text-xl"></i>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {renderCommonDetails()}

            {user.role === 'Student' && renderStudentDetails()}
            {user.role === 'Teacher' && renderTeacherDetails()}
            {/* For Admin, no extra fields needed beyond common ones */}
          </div>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
 