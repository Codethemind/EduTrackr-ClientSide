import React, { useState, useEffect } from 'react';

const AddUserModal = ({ onClose, onSave }) => {
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'Student', // Default to Student
    password: '',
    firstName: '',
    lastName: '',
    isActive: true,
    // Student-specific fields
    class: '',
    department: '',
    courses: []
  });
  
  const [errors, setErrors] = useState({});
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Mock data - in a real application, these would come from API calls
  useEffect(() => {
    // Simulating API data fetch
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

  // Filter courses based on selected department
  const filteredCourses = newUser.department 
    ? availableCourses.filter(course => course.department === newUser.department)
    : availableCourses;

  const validateForm = () => {
    const validationErrors = {};
    
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

    // Validate student-specific fields if role is Student
    if (newUser.role === 'Student') {
      if (!newUser.department) {
        validationErrors.department = 'Department is required';
      }
      if (!newUser.class) {
        validationErrors.class = 'Class is required';
      }
      if (!selectedCourses.length) {
        validationErrors.courses = 'At least one course must be selected';
      }
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add selected courses to the user data
    const userData = {
      ...newUser,
      courses: selectedCourses
    };
    
    if (validateForm()) {
      onSave(userData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset courses when department changes
    if (name === 'department') {
      setSelectedCourses([]);
    }
    
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  const handleCourseSelection = (courseId) => {
    const course = availableCourses.find(c => c.id === parseInt(courseId));
    
    if (!course) return;
    
    // Check if course is already selected
    if (selectedCourses.some(c => c.id === course.id)) {
      // Remove course
      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    } else {
      // Add course
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-md md:max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">Add New User</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="ti ti-x text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-1">
          {/* Basic Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-700 mb-3">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name*</label>
                <input
                  type="text"
                  name="firstName"
                  value={newUser.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md border-gray-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last Name*</label>
                <input
                  type="text"
                  name="lastName"
                  value={newUser.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md border-gray-300"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Username*</label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password*</label>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Role*</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md border-gray-300"
                required
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          
          {/* Student Information Section - Only shown when role is Student */}
          {newUser.role === 'Student' && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Student Information</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Department*</label>
                <select
                  name="department"
                  value={newUser.department}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Department</option>
                  {availableDepartments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Class*</label>
                <select
                  name="class"
                  value={newUser.class}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.class ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Class</option>
                  {availableClasses.map((cls, index) => (
                    <option key={index} value={cls}>{cls}</option>
                  ))}
                </select>
                {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
              </div>
              
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Courses*</label>
                {newUser.department ? (
                  <>
                    <div className="max-h-48 overflow-y-auto border rounded-md border-gray-300 p-2">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                          <div key={course.id} className="flex items-center mb-2">
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
                        <p className="text-gray-500 text-sm py-2">No courses available for selected department</p>
                      )}
                    </div>
                    {errors.courses && <p className="text-red-500 text-xs mt-1">{errors.courses}</p>}
                    
                    {selectedCourses.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Selected Courses:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedCourses.map(course => (
                            <span 
                              key={course.id} 
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                            >
                              {course.code}
                              <button 
                                type="button"
                                onClick={() => handleCourseSelection(course.id)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <i className="ti ti-x"></i>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Please select a department first</p>
                )}
              </div>
            </div>
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
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;