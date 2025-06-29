// components/admin/schedule/ScheduleForm.jsx
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BookOpen, Users, Building } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewSchedule } from '../../../redux/slices/scheduleSlice';
import axios from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const ScheduleForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.schedule);
  
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    department: '',
    course: '',
    teacher: '',
    day: '',
    startTime: '',
    endTime: ''
  });

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/departments');
        console.log('Departments response:', response.data);
        // Access the nested data array
        setDepartments(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error loading departments:', error);
        toast.error('Failed to load departments');
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Load courses and teachers based on selected department
  useEffect(() => {
    const fetchDepartmentData = async () => {
      if (formData.department) {
        setIsLoading(true);
        try {
          const [coursesRes, teachersRes] = await Promise.all([
            axios.get(`/api/courses`),
            axios.get(`/api/teachers`)
          ]);
          
          console.log('Teachers API Response:', teachersRes.data);
          
          // Handle courses data
          if (coursesRes.data.success && Array.isArray(coursesRes.data.data)) {
            const departmentCourses = coursesRes.data.data.filter(course => 
              course.departmentId === formData.department
            );
            setCourses(departmentCourses);
          } else {
            setCourses([]);
          }

          // Handle teachers data
          if (teachersRes.data.success && Array.isArray(teachersRes.data.data)) {
            console.log('All teachers:', teachersRes.data.data);
            const departmentTeachers = teachersRes.data.data.filter(teacher => {
              console.log('Checking teacher:', teacher);
              return teacher.department === formData.department;
            });
            console.log('Filtered teachers:', departmentTeachers);
            setTeachers(departmentTeachers);
          } else {
            console.log('No teachers data found or invalid format');
            setTeachers([]);
          }
        } catch (error) {
          console.error('Error loading department data:', error);
          toast.error('Failed to load department data');
          setCourses([]);
          setTeachers([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCourses([]);
        setTeachers([]);
      }
    };

    fetchDepartmentData();
  }, [formData.department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to:`, value);
    
    setFormData(prev => ({
  ...prev,
  [name]: value,
  ...(name === 'department' && { course: '', teacher: '' })
}));

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.department || !formData.course || !formData.teacher || 
        !formData.day || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate teacher ID format (should be a MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(formData.teacher)) {
      toast.error('Invalid teacher ID format');
      return;
    }
    
    try {
      // Get selected course to get semester
      const selectedCourse = courses.find(course => course._id === formData.course);
      console.log('Selected course:', selectedCourse);
      
      // Get selected teacher
      const selectedTeacher = teachers.find(teacher => teacher.id === formData.teacher);
      console.log('Selected teacher:', selectedTeacher);
      
      // Create schedule object
      const scheduleData = {
        departmentId: formData.department,
        courseId: formData.course,
        teacherId: formData.teacher,    
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        semester: selectedCourse?.semester || 'Spring 2025'
      };
      
      console.log('Submitting schedule data:', scheduleData);
      
      // Dispatch the create schedule action
      const result = await dispatch(createNewSchedule(scheduleData)).unwrap();
      
      if (result.success) {
        // Reset form
        setFormData({
          department: '',
          course: '',
          teacher: '',
          day: '',
          startTime: '',
          endTime: ''
        });
        
        toast.success('Schedule created successfully');
      } else {
        toast.error(result.message || 'Failed to create schedule');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      // Handle error response object
      const errorMessage = error.message || (error.response?.data?.message) || 'Failed to create schedule';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Schedule</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Department Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building size={18} className="text-gray-400" />
              </div>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
                disabled={isLoading}
              >
                <option value="">Select Department</option>
                {Array.isArray(departments) && departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Course <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen size={18} className="text-gray-400" />
              </div>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                disabled={!formData.department || isLoading}
                required
              >
                <option value="">Select Course</option>
                {Array.isArray(courses) && courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name} ({course.semester})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Teacher <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users size={18} className="text-gray-400" />
              </div>
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                disabled={!formData.department || isLoading}
                required
              >
                <option value="">Select Teacher</option>
                {Array.isArray(teachers) && teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstname} {teacher.lastname} ({teacher.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Day <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
                disabled={isLoading}
              >
                <option value="">Select Day</option>
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock size={18} className="text-gray-400" />
              </div>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              End Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock size={18} className="text-gray-400" />
              </div>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || isLoading}
            className={`w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              (loading || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading || isLoading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;