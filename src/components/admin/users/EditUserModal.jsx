import React, { useState, useEffect } from 'react';

const EditUserModal = ({ user, onClose, onSave }) => {
  if (!user) return null; // Safety check to ensure user data exists before rendering

  // Local state to handle the form data
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    role: user.role,
    department: user.department || '',
    class: user.class || '',
    courses: user.courses || [],
    isBlock: user.isBlock,
  });

  useEffect(() => {
    // Initialize formData with user details when modal is opened
    setFormData({
      username: user.username,
      email: user.email,
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      role: user.role,
      department: user.department || '',
      class: user.class || '',
      courses: user.courses || [],
      isBlock: user.isBlock,
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSave = async () => {
    try {
      const userId = user._id || user.id;
      const baseURL = 'http://localhost:3000'; // <-- Set your base URL here
      let apiUrl = '';
  
      console.log('Inside EditUserModal:', user.id);
  
      if (formData.role === 'Student') {
        apiUrl = `${baseURL}/api/students/${userId}`;
      } else if (formData.role === 'Teacher') {
        apiUrl = `${baseURL}/api/teachers/${userId}`;
      } else if (formData.role === 'Admin') {
        apiUrl = `${baseURL}/api/admins/${userId}`;
      }
  
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
  
      const updatedUser = await response.json();
      onSave(updatedUser); // Send updated user to parent
      onClose(); // Close modal
    } catch (err) {
      console.error(err.message);
    }
  };
  

  // Render common details form inputs
  const renderCommonDetails = () => (
    <>
      <div>
        <label className="text-sm text-gray-500">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="mt-1 p-2 w-full border rounded-md"
        />
      </div>

      <div>
        <label className="text-sm text-gray-500">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 p-2 w-full border rounded-md"
        />
      </div>

      <div>
        <label className="text-sm text-gray-500">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="mt-1 p-2 w-full border rounded-md"
        >
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {formData.firstname && (
        <div>
          <label className="text-sm text-gray-500">First Name</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
      )}

      {formData.lastname && (
        <div>
          <label className="text-sm text-gray-500">Last Name</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleInputChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
      )}
    </>
  );

  // Render student-specific form inputs
  const renderStudentDetails = () => (
    <>
      <div>
        <label className="text-sm text-gray-500">Department</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          className="mt-1 p-2 w-full border rounded-md"
        />
      </div>

      <div>
        <label className="text-sm text-gray-500">Class</label>
        <input
          type="text"
          name="class"
          value={formData.class}
          onChange={handleInputChange}
          className="mt-1 p-2 w-full border rounded-md"
        />
      </div>

      <div>
        <label className="text-sm text-gray-500">Courses</label>
        <input
          type="text"
          name="courses"
          value={formData.courses.join(', ')}
          onChange={(e) => {
            const courses = e.target.value.split(',').map((course) => course.trim());
            setFormData({ ...formData, courses });
          }}
          className="mt-1 p-2 w-full border rounded-md"
        />
      </div>

      <div>
        <label className="text-sm text-gray-500">Blocked Status</label>
        <input
          type="checkbox"
          name="isBlock"
          checked={formData.isBlock}
          onChange={handleCheckboxChange}
          className="mt-1"
        />
      </div>
    </>
  );

  // Render teacher-specific form inputs
  const renderTeacherDetails = () => (
    <div>
      <label className="text-sm text-gray-500">Department</label>
      <input
        type="text"
        name="department"
        value={formData.department}
        onChange={handleInputChange}
        className="mt-1 p-2 w-full border rounded-md"
      />
    </div>
  );

  // Render admin-specific form inputs
  const renderAdminDetails = () => (
    <>
      <div>
        <label className="text-sm text-gray-500">Admin Access Level</label>
        <input
          type="text"
          name="adminLevel"
          value={formData.adminLevel || ''}
          onChange={handleInputChange}
          className="mt-1 p-2 w-full border rounded-md"
        />
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Edit User Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="ti ti-x text-xl"></i>
          </button>
        </div>

        <div className="space-y-4">
          {/* Render common details for all users */}
          {renderCommonDetails()}

          {/* Render role-specific details */}
          {formData.role === 'Student' && renderStudentDetails()}
          {formData.role === 'Teacher' && renderTeacherDetails()}
          {formData.role === 'Admin' && renderAdminDetails()}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 ml-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
