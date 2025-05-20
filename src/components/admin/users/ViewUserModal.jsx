import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewUserModal = ({ user, onClose }) => {
  if (!user) return null; // safety check

  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const departmentsResponse = await axios.get('http://localhost:3000/api/departments');
        setAvailableDepartments(departmentsResponse.data.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const getDepartmentName = (departmentId) => {
    const department = availableDepartments.find(dept => dept._id === departmentId);
    return department ? department.name : departmentId;
  };

  const renderCourses = () => {
    if (!user.courses || !Array.isArray(user.courses) || user.courses.length === 0) {
      return <p className="text-sm text-gray-500">No courses assigned</p>;
    }

    if (user.courses[0] && (user.courses[0].name || user.courses[0].courseId)) {
      return (
        <ul className="list-disc ml-5">
          {user.courses.map((course, index) => (
            <li key={index}>
              {course.name || course.courseName || 'Unnamed Course'} 
              ({course.code || course.courseCode || 'N/A'})
            </li>
          ))}
        </ul>
      );
    }

    return <p className="text-sm text-gray-500">Course information format not recognized</p>;
  };

  // A reusable component for each label-value pair, formatted for grid layout
  const DetailItem = ({ label, children }) => (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium break-words">{children}</span>
    </div>
  );

  const renderCommonDetails = () => (
    <>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <DetailItem label="Username">{user.username}</DetailItem>
        <DetailItem label="Email">{user.email}</DetailItem>
        <DetailItem label="Role">{user.role}</DetailItem>
        {user.firstname && <DetailItem label="First Name">{user.firstname}</DetailItem>}
        {user.lastname && <DetailItem label="Last Name">{user.lastname}</DetailItem>}
      </div>
    </>
  );

  const renderStudentDetails = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
      <DetailItem label="Department">{loading ? 'Loading...' : getDepartmentName(user.department)}</DetailItem>
      <DetailItem label="Class">{user.class}</DetailItem>
      <div className="md:col-span-2">
        <p className="text-sm text-gray-500 mb-1">Courses</p>
        {loading ? (
          <p>Loading courses...</p>
        ) : (
          renderCourses()
        )}
      </div>
      <DetailItem label="Status">{user.isBlock ? 'Blocked' : 'Active'}</DetailItem>
    </div>
  );

  const renderTeacherDetails = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
      <DetailItem label="Department">{loading ? 'Loading...' : getDepartmentName(user.department)}</DetailItem>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 px-4">
      <div className="relative max-w-md w-full p-6 border shadow-lg rounded-md bg-white">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            ✖
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {renderCommonDetails()}

            {user.role === 'Student' && renderStudentDetails()}
            {user.role === 'Teacher' && renderTeacherDetails()}
            {/* Admin only has common details */}
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
 