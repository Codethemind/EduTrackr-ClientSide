import React, { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

const AddUserModal = ({ onClose, onSave }) => {
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'Student',
    password: '',
    firstName: '',
    lastName: '',
    isActive: true,
    class: '',
    department: '',
    courses: [],
    profileImage: ''
  });

  const [errors, setErrors] = useState({});
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableClasses] = useState(['First Sem', 'Second Sem', 'Third Sem', 'Fourth Sem', 'Fifth Sem', 'Sixth Sem']);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch departments and courses when component mounts
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
    if (!newUser.department || !newUser.class) {
      return [];
    }
    
    const semesterNumber = getSemesterNumber(newUser.class);
    
    return availableCourses.filter(
      course => course.departmentId === newUser.department && course.semester === semesterNumber
    );
  }, [newUser.department, newUser.class, availableCourses]);

  const validateForm = () => {
    const validationErrors = {};
    setServerError('');

    if (!newUser.firstName.trim()) {
      validationErrors.firstName = 'First name is required';
    }
    if (!newUser.lastName.trim()) {
      validationErrors.lastName = 'Last name is required';
    }
    if (!newUser.username.trim()) {
      validationErrors.username = 'Username is required';
    } else if (newUser.username.length < 3) {
      validationErrors.username = 'Username must be at least 3 characters';
    }
    if (!newUser.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      validationErrors.email = 'Email is invalid';
    }
    if (!newUser.password.trim()) {
      validationErrors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }
    if (newUser.role === 'Student') {
      if (!newUser.department) {
        validationErrors.department = 'Department is required';
      }
      if (!newUser.class) {
        validationErrors.class = 'Semester is required';
      }
      if (selectedCourses.length === 0) {
        validationErrors.courses = 'At least one course must be selected';
      }
    } else if (newUser.role === 'Teacher' && !newUser.department) {
      validationErrors.department = 'Department is required for teachers';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission triggered");
    
    // Reset errors
    setServerError('');
    
    if (!validateForm()) {
      console.log("Form validation failed");
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setUploading(true);
    
      const formData = new FormData();
      
      // Add user data
      formData.append('username', newUser.username);
      formData.append('email', newUser.email);
      formData.append('role', newUser.role);
      formData.append('password', newUser.password);
      formData.append('firstname', newUser.firstName);
      formData.append('lastname', newUser.lastName);
      formData.append('isActive', newUser.isActive.toString());
      
      if (newUser.role === 'Student') {
        formData.append('department', newUser.department);
        formData.append('class', newUser.class);
      
        formData.append('courses', JSON.stringify(selectedCourses));
      } else if (newUser.role === 'Teacher') {
        formData.append('department', newUser.department);
      }
      
    
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }
      
  
      const baseURL = 'http://localhost:3000'; 
      let endpoint = '';
      
      switch (newUser.role) {
        case 'Student':
          endpoint = `${baseURL}/api/students/create`; 
          break;
        case 'Teacher':
          endpoint = `${baseURL}/api/teachers/create`; 
          break;
        case 'Admin':
          endpoint = `${baseURL}/api/admins/create`;
          break;
        default:
          throw new Error('Invalid role selected');
      }
 
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploading(false);
      
      if (response.data && response.data.success) {
        toast.success('User added successfully!');
        console.log('adding user',response.data.data)
        onSave(response.data.data);
        onClose();
      } else {
        setServerError(response.data?.message || 'Failed to add user');
        toast.error(response.data?.message || 'Failed to add user');
      }
    } catch (error) {
      setUploading(false);
      console.error('Error adding user:', error);
   
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'An error occurred';
        
        console.log('Error details:', error.response.data);
        
        // Check for common error types
        if (status === 409 || errorMessage.includes('already exists') || 
            errorMessage.includes('duplicate') || errorMessage.includes('taken')) {
          // User already exists or duplicate entry
          if (errorMessage.includes('email')) {
            setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
            toast.error('This email is already registered');
          } else if (errorMessage.includes('username')) {
            setErrors(prev => ({ ...prev, username: 'This username is already taken' }));
            toast.error('This username is already taken');
          } else {
            setServerError(errorMessage);
            toast.error(errorMessage);
          }
        } else if (status === 400) {
          // Bad request - validation errors
          setServerError(errorMessage);
          toast.error(errorMessage);
        } else if (status === 500) {
          // Server error
          setServerError('Server error. Please try again later.');
          toast.error('Server error. Please try again later.');
        } else {
          // Other errors
          setServerError(errorMessage);
          toast.error(errorMessage);
        }
      } else if (error.request) {
        // Network error
        setServerError('Network error. Please check your connection.');
        toast.error('Network error. Please check your connection.');
      } else {
        // Other errors
        setServerError(error.message || 'An unexpected error occurred');
        toast.error(error.message || 'An unexpected error occurred');
      }
    }
  };

  // Direct button click handler as a backup
  const handleSaveClick = (e) => {
    console.log("Save button clicked directly");
    e.preventDefault();
    handleSubmit(e);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'role') {
      // Reset department, semester, and courses when role changes
      setNewUser(prev => ({
        ...prev,
        [name]: value,
        department: '',
        class: '',
        courses: []
      }));
      setSelectedCourses([]);
    } else if (name === 'department') {
      // Reset semester and courses when department changes
      setNewUser(prev => ({
        ...prev,
        [name]: value,
        class: '',
        courses: []
      }));
      setSelectedCourses([]);
    } else if (name === 'class') {
      // Reset courses when semester changes
      setNewUser(prev => ({
        ...prev,
        [name]: value,
        courses: []
      }));
      setSelectedCourses([]);
    } else {
      setNewUser(prev => ({
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

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Add New User</h2>
            <button 
              type="button"
              onClick={onClose} 
              className="text-gray-500 hover:text-black"
            >
              ✖
            </button>
          </div>

          {/* Display server-side error if any */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[70vh] px-1">
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
                  name="firstName"
                  value={newUser.firstName}
                  onChange={handleChange}
                  className={`border rounded-md w-full p-2 ${errors.firstName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Last Name*</label>
                <input
                  type="text"
                  name="lastName"
                  value={newUser.lastName}
                  onChange={handleChange}
                  className={`border rounded-md w-full p-2 ${errors.lastName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Username*</label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleChange}
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
                value={newUser.email}
                onChange={handleChange}
                className={`border rounded-md w-full p-2 ${errors.email ? 'border-red-500' : ''}`}
                required
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Password*</label>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleChange}
                className={`border rounded-md w-full p-2 ${errors.password ? 'border-red-500' : ''}`}
                required
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Role*</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleChange}
                className="border rounded-md w-full p-2"
                required
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Student Info */}
            {newUser.role === 'Student' && (
              <>
                <div>
                  <label className="block mb-1 text-sm font-medium">Department*</label>
                  <select
                    name="department"
                    value={newUser.department}
                    onChange={handleChange}
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
                    value={newUser.class}
                    onChange={handleChange}
                    className={`border rounded-md w-full p-2 ${errors.class ? 'border-red-500' : ''}`}
                    disabled={!newUser.department} // Disable if department is not selected
                  >
                    <option value="">Select Semester</option>
                    {availableClasses.map((cls, index) => (
                      <option key={index} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  {errors.class && <p className="text-xs text-red-500">{errors.class}</p>}
                  {!newUser.department && (
                    <p className="text-xs text-blue-500">Please select a department first</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Courses*</label>
                  <div className={`border rounded-md p-2 max-h-40 overflow-y-auto ${!newUser.class ? 'bg-gray-100' : ''}`}>
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <div key={course._id} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={course._id}
                            checked={selectedCourses.includes(course._id)}
                            onChange={() => handleCourseSelection(course._id)}
                            className="mr-2"
                            disabled={!newUser.class} // Disable if semester is not selected
                          />
                          <label htmlFor={course._id} className={`text-sm ${!newUser.class ? 'text-gray-400' : ''}`}>
                            {course.name} ({course.code})
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        {!newUser.department
                          ? 'Please select a department first'
                          : !newUser.class
                          ? 'Please select a semester first'
                          : 'No courses available for this department and semester'}
                      </p>
                    )}
                  </div>
                  {errors.courses && <p className="text-xs text-red-500">{errors.courses}</p>}
                </div>
              </>
            )}
            
            {/* Teacher Information Section - You can expand this if needed */}
            {newUser.role === 'Teacher' && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-700 mb-3">Teacher Information</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Department*</label>
                  <select
                    name="department"
                    value={newUser.department}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                </div>
                
                {/* Add more teacher-specific fields as needed */}
              </div>
            )}

            {/* Submit button */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                onClick={handleSaveClick}
                disabled={uploading}
                className={`bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {uploading ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddUserModal;