import React, { useState, useEffect, useMemo } from 'react';
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

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user.profileImage || '');
  const [uploading, setUploading] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableClasses] = useState(['First Sem', 'Second Sem', 'Third Sem', 'Fourth Sem', 'Fifth Sem', 'Sixth Sem']);
  const [selectedCourses, setSelectedCourses] = useState(user.courses || []);
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
        toast.error('Failed to load departments and courses');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentsAndCourses();
  }, []);

  // Initialize formData with user details when modal is opened
  useEffect(() => {
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
    setSelectedCourses(user.courses || []);
    setImagePreview(user.profileImage || '');
  }, [user]);

  // Helper function to convert semester name to numeric value
  const getSemesterNumber = (semesterName) => {
    const semesterMap = {
      'First Sem': 1,
      'Second Sem': 2,
      'Third Sem': 3,
      'Fourth Sem': 4,
      'Fifth Sem': 5,
      'Sixth Sem': 6
    };
    return semesterMap[semesterName];
  };

  // Filter courses based on selected department AND semester
  const filteredCourses = useMemo(() => {
    if (!formData.department || !formData.class) {
      return [];
    }
    
    const semesterNumber = getSemesterNumber(formData.class);
    
    return availableCourses.filter(
      course => course.departmentId === formData.department && course.semester === semesterNumber
    );
  }, [formData.department, formData.class, availableCourses]);

  const validateForm = () => {
    const validationErrors = {};
    
    if (!formData.username.trim()) {
      validationErrors.username = 'Username is required';
    }
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'Email is invalid';
    }
    if (!formData.firstname.trim()) {
      validationErrors.firstname = 'First name is required';
    }
    if (!formData.lastname.trim()) {
      validationErrors.lastname = 'Last name is required';
    }
    
    if (formData.role === 'Student') {
      if (!formData.department) {
        validationErrors.department = 'Department is required';
      }
      if (!formData.class) {
        validationErrors.class = 'Semester is required';
      }
      if (selectedCourses.length === 0) {
        validationErrors.courses = 'At least one course must be selected';
      }
    } else if (formData.role === 'Teacher' && !formData.department) {
      validationErrors.department = 'Department is required for teachers';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'role') {
      // Reset department, semester, and courses when role changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        department: '',
        class: '',
        courses: []
      }));
      setSelectedCourses([]);
    } else if (name === 'department') {
      // Reset semester and courses when department changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        class: '',
        courses: []
      }));
      setSelectedCourses([]);
    } else if (name === 'class') {
      // Reset courses when semester changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        courses: []
      }));
      setSelectedCourses([]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error for the field being changed
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleCourseSelection = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
    
    // Clear course-related errors
    if (errors.courses) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.courses;
        return updated;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should not exceed 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setUploading(true);
      
      const userId = user._id || user.id;
      const baseURL = 'http://localhost:3000';
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
        profileImage: profileImageUrl,
        courses: selectedCourses
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
        console.log('edit user', updateResponse.data);
        onSave(updateResponse.data.data); 
        onClose();
      } else {
        toast.error('Failed to update user details');
      }
    } catch (error) {
      setUploading(false);
      console.error('Error updating user:', error);
    
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'An error occurred';
    
        if (status === 400) {
          toast.error(errorMessage); // shows "Email already exists", "Invalid role", etc.
        } else if (status === 409 || errorMessage.includes('already exists')) {
          toast.error(errorMessage);
        } else if (status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(errorMessage);
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'An unexpected error occurred');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit User Details</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-500 hover:text-black"
          >
            ✖
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <form className="space-y-4 overflow-y-auto max-h-[70vh] px-1">
            {/* Profile Image Upload */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Profile Image</label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 border rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload a profile picture (max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">First Name*</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className={`border rounded-md w-full p-2 ${errors.firstname ? 'border-red-500' : ''}`}
                  required
                />
                {errors.firstname && <p className="text-xs text-red-500">{errors.firstname}</p>}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Last Name*</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className={`border rounded-md w-full p-2 ${errors.lastname ? 'border-red-500' : ''}`}
                  required
                />
                {errors.lastname && <p className="text-xs text-red-500">{errors.lastname}</p>}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Username*</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`border rounded-md w-full p-2 ${errors.username ? 'border-red-500' : ''}`}
                required
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`border rounded-md w-full p-2 ${errors.email ? 'border-red-500' : ''}`}
                required
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Role*</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="border rounded-md w-full p-2"
                required
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Student Info */}
            {formData.role === 'Student' && (
              <>
                <div>
                  <label className="block mb-1 text-sm font-medium">Department*</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`border rounded-md w-full p-2 ${errors.department ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Semester*</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className={`border rounded-md w-full p-2 ${errors.class ? 'border-red-500' : ''}`}
                    disabled={!formData.department} // Disable if department is not selected
                  >
                    <option value="">Select Semester</option>
                    {availableClasses.map((cls, index) => (
                      <option key={index} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  {errors.class && <p className="text-xs text-red-500">{errors.class}</p>}
                  {!formData.department && (
                    <p className="text-xs text-blue-500">Please select a department first</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Courses*</label>
                  <div className={`border rounded-md p-2 max-h-40 overflow-y-auto ${!formData.class ? 'bg-gray-100' : ''}`}>
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <div key={course._id} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={course._id}
                            checked={selectedCourses.includes(course._id)}
                            onChange={() => handleCourseSelection(course._id)}
                            className="mr-2"
                            disabled={!formData.class} // Disable if semester is not selected
                          />
                          <label htmlFor={course._id} className={`text-sm ${!formData.class ? 'text-gray-400' : ''}`}>
                            {course.name} ({course.code})
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        {!formData.department
                          ? 'Please select a department first'
                          : !formData.class
                          ? 'Please select a semester first'
                          : 'No courses available for this department and semester'}
                      </p>
                    )}
                  </div>
                  {errors.courses && <p className="text-xs text-red-500">{errors.courses}</p>}
                </div>
              </>
            )}
            
            {/* Teacher Information Section */}
            {formData.role === 'Teacher' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Teacher Information</h4>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Department*</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                </div>
              </div>
            )}

            {/* Block/Unblock User */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBlock"
                name="isBlock"
                checked={formData.isBlock}
                onChange={(e) => handleInputChange({
                  target: {
                    name: 'isBlock',
                    checked: e.target.checked,
                    type: 'checkbox'
                  }
                })}
                className="mr-2"
              />
              <label htmlFor="isBlock" className="text-sm font-medium">
                Block User
              </label>
            </div>

            {/* Submit button */}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={uploading}
                className={`bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {uploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUserModal;