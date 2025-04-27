import React, { useState, useEffect } from 'react';
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
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAvailableDepartments(['Computer Science', 'Engineering', 'Business', 'Arts', 'Medicine']);
    setAvailableClasses(['First Year', 'Second Year', 'Third Year', 'Fourth Year']);
    setAvailableCourses([
      { id: 1, name: 'Introduction to Programming', code: 'CS101', department: 'Computer Science' },
      { id: 2, name: 'Data Structures', code: 'CS201', department: 'Computer Science' },
      { id: 3, name: 'Database Systems', code: 'CS301', department: 'Computer Science' },
      { id: 4, name: 'Engineering Mathematics', code: 'ENG101', department: 'Engineering' },
      { id: 5, name: 'Circuit Theory', code: 'ENG201', department: 'Engineering' },
      { id: 6, name: 'Marketing Principles', code: 'BUS101', department: 'Business' },
      { id: 7, name: 'Financial Accounting', code: 'BUS201', department: 'Business' },
      { id: 8, name: 'Art History', code: 'ART101', department: 'Arts' },
      { id: 9, name: 'Human Anatomy', code: 'MED101', department: 'Medicine' }
    ]);
  }, []);

  const filteredCourses = newUser.department
    ? availableCourses.filter(course => course.department === newUser.department)
    : availableCourses;

  const validateForm = () => {
    const validationErrors = {};

    if (!newUser.firstName.trim()) {
      validationErrors.firstName = 'First name is required';
    }
    if (!newUser.lastName.trim()) {
      validationErrors.lastName = 'Last name is required';
    }
    if (!newUser.username.trim()) {
      validationErrors.username = 'Username is required';
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
        validationErrors.class = 'Class is required';
      }
      if (selectedCourses.length === 0) {
        validationErrors.courses = 'At least one course must be selected';
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission triggered");
    
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData object to send to backend
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
        // Add courses data
        formData.append('courses', JSON.stringify(selectedCourses));
      } else if (newUser.role === 'Teacher') {
        formData.append('department', newUser.department);
      }
      
      // Add profile image if available
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }
      
      // Determine the API endpoint based on user role
      const baseURL = 'http://localhost:3000'; // Adjust to your API base URL
      let endpoint = '';
      
      switch (newUser.role) {
        case 'Student':
          endpoint = `${baseURL}/api/students/create`; // Use the base students endpoint
          break;
        case 'Teacher':
          endpoint = `${baseURL}/api/teachers/create`; // Use the base teachers endpoint 
          break;
        case 'Admin':
          endpoint = `${baseURL}/api/admins/create`;
          break;
        default:
          throw new Error('Invalid role selected');
      }
      
      console.log('Sending request to:', endpoint);
      
      // Log form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Send request to backend
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploading(false);
      
      if (response.data && response.data.success) {
        toast.success('User added successfully!');
        onSave(response.data.data);
        onClose();
      } else {
        toast.error(response.data?.message || 'Failed to add user');
      }
    } catch (error) {
      setUploading(false);
      console.error('Error adding user:', error);
      console.log('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to add user. Please check console for details.');
    }
  };

  // Direct button click handler as a backup
  const handleSaveClick = (e) => {
    console.log("Save button clicked directly");
    e.preventDefault();
    handleSubmit(e);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'department') {
      setSelectedCourses([]);
    }

    setNewUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCourseSelection = (courseId) => {
    const course = availableCourses.find(c => c.id === parseInt(courseId));

    if (!course) return;

    if (selectedCourses.some(c => c.id === course.id)) {
      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Last Name*</label>
                <input
                  type="text"
                  name="lastName"
                  value={newUser.lastName}
                  onChange={handleChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Username*</label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleChange}
                className={`border rounded-md w-full p-2 ${errors.username && 'border-red-500'}`}
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
                className={`border rounded-md w-full p-2 ${errors.email && 'border-red-500'}`}
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
                className={`border rounded-md w-full p-2 ${errors.password && 'border-red-500'}`}
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
                    className={`border rounded-md w-full p-2 ${errors.department && 'border-red-500'}`}
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Class*</label>
                  <select
                    name="class"
                    value={newUser.class}
                    onChange={handleChange}
                    className={`border rounded-md w-full p-2 ${errors.class && 'border-red-500'}`}
                  >
                    <option value="">Select Class</option>
                    {availableClasses.map((cls, index) => (
                      <option key={index} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  {errors.class && <p className="text-xs text-red-500">{errors.class}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Courses*</label>
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                    {filteredCourses.length ? (
                      filteredCourses.map((course) => (
                        <div key={course.id} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`course-${course.id}`}
                            checked={selectedCourses.some(c => c.id === course.id)}
                            onChange={() => handleCourseSelection(course.id)}
                            className="mr-2"
                          />
                          <label htmlFor={`course-${course.id}`} className="text-sm">
                            {course.code}: {course.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No courses available</p>
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
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select
                    name="department"
                    value={newUser.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300"
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </select>
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
