import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
    profileImage: user.profileImage || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user.profileImage || '');
  const [uploading, setUploading] = useState(false);

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
      profileImage: user.profileImage || '',
    });
    setImagePreview(user.profileImage || '');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      
      const userId = user._id || user.id;
      const baseURL = 'http://localhost:3000'; // <-- Set your base URL here
      let apiUrl = '';
      let profileImageUrl = formData.profileImage;
      
      // Determine the base API endpoint based on user role
      if (formData.role === 'Student') {
        apiUrl = `${baseURL}/api/students`;
      } else if (formData.role === 'Teacher') {
        apiUrl = `${baseURL}/api/teachers`;
      } else if (formData.role === 'Admin') {
        apiUrl = `${baseURL}/api/admins`;
      }
      
      // If there's a new image, upload it first using the specific profile image endpoint
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', imageFile);
        
        try {
          const imageResponse = await axios.put(
            `${apiUrl}/${userId}/profile-image`, 
            imageFormData, 
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          if (imageResponse.data && imageResponse.data.success) {
            // If image upload is successful, update the profileImage URL
            profileImageUrl = imageResponse.data.data?.profileImage || imageResponse.data.profileImage;
            toast.success('Profile image updated successfully');
          }
        } catch (imageError) {
          console.error('Failed to update profile image:', imageError);
          toast.error('Failed to update profile image');
        }
      }
      
      // Update the user data with the new or existing profile image URL
      const updatedUserData = {
        ...formData,
        profileImage: profileImageUrl
      };
      
      // Make the regular update API call
      const updateResponse = await axios.put(
        `${apiUrl}/${userId}`, 
        updatedUserData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUploading(false);
      
      if (updateResponse.data) {
        toast.success('User details updated successfully');
        onSave(updateResponse.data.data || updateResponse.data); 
        onClose();
      } else {
        toast.error('Failed to update user details');
      }
    } catch (err) {
      setUploading(false);
      console.error('Error updating user:', err);
      toast.error('Failed to update user');
    }
  };

  // Render common details form inputs
  const renderCommonDetails = () => (
    <>
      {/* Profile Image Upload */}
      <div className="mb-4">
        <label className="text-sm text-gray-500">Profile Image</label>
        <div className="flex items-center space-x-3 mt-1">
          <div className="w-16 h-16 border rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-400">No image</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs w-full border rounded p-1"
            />
          </div>
        </div>
      </div>

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
