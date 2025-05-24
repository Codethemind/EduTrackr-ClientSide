// components/admin/schedule/EditScheduleModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateExistingSchedule } from '../../../redux/slices/scheduleSlice';
import axios from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

const EditScheduleModal = ({ schedule, isOpen, onClose, onSuccess, departments }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    courseId: '',
    teacherId: '',
    departmentId: '',
    day: '',
    startTime: '',
    endTime: '',
    semester: '',
    room: ''
  });
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Initialize form data when schedule changes
  useEffect(() => {
    if (schedule) {
      console.log('Schedule data received:', schedule); // Debug log
      setFormData({
        courseId: schedule.courseId?._id || schedule.courseId || '',
        teacherId: schedule.teacherId?._id || schedule.teacherId?.id || schedule.teacherId || '',
        departmentId: schedule.departmentId?._id || schedule.departmentId || '',
        day: schedule.day || '',
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        semester: schedule.semester || '',
        room: schedule.room || ''
      });
    }
  }, [schedule]);

  // Fetch courses and teachers when department changes
  useEffect(() => {
    const fetchDepartmentData = async () => {
      if (!formData.departmentId) {
        setCourses([]);
        setTeachers([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          axios.get(`/api/courses`),
          axios.get(`/api/teachers`)
        ]);
        
        console.log('Courses API Response:', coursesRes.data);
        console.log('Teachers API Response:', teachersRes.data);
        
        // Handle courses data
        if (coursesRes.data.success && Array.isArray(coursesRes.data.data)) {
          const departmentCourses = coursesRes.data.data.filter(course => 
            course.departmentId === formData.departmentId
          );
          setCourses(departmentCourses);
        } else {
          setCourses([]);
        }

        // Handle teachers data
        if (teachersRes.data.success && Array.isArray(teachersRes.data.data)) {
          const departmentTeachers = teachersRes.data.data.filter(teacher => 
            teacher.department === formData.departmentId
          );
          setTeachers(departmentTeachers);
        } else {
          setTeachers([]);
        }
      } catch (error) {
        console.error('Error loading department data:', error);
        toast.error('Failed to load courses and teachers');
        setCourses([]);
        setTeachers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
  }, [formData.departmentId]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset course and teacher when department changes
      ...(name === 'departmentId' && { courseId: '', teacherId: '' }),
      // Auto-set semester when course is selected
      ...(name === 'courseId' && { 
        semester: courses.find(c => c._id === value)?.semester || prev.semester 
      })
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if schedule ID exists
    const scheduleId = schedule?._id || schedule?.id;
    if (!scheduleId) {
      console.error('Schedule ID is missing:', schedule);
      toast.error('Schedule ID is missing. Cannot update schedule.');
      return;
    }

    // Validate required fields
    const requiredFields = ['courseId', 'teacherId', 'departmentId', 'day', 'startTime', 'endTime', 'semester'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate time format
    if (formData.startTime >= formData.endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    // Validate teacher ID format (should be a MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(formData.teacherId)) {
      toast.error('Invalid teacher ID format');
      return;
    }

    console.log('Submitting update for schedule ID:', scheduleId); // Debug log
    console.log('Form data:', formData); // Debug log

    setIsSubmitting(true);
    try {
      const result = await dispatch(updateExistingSchedule({
        scheduleId: scheduleId,
        scheduleData: formData
      })).unwrap();
      
      console.log('Update result:', result); // Debug log
      toast.success('Schedule updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating schedule:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to update schedule';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                required
                disabled={!formData.departmentId || isLoading || isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teacher <span className="text-red-500">*</span>
              </label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
                disabled={!formData.departmentId || isLoading || isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id || teacher._id} value={teacher.id || teacher._id}>
                    {teacher.firstname} {teacher.lastname}
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day <span className="text-red-500">*</span>
              </label>
              <select
                name="day"
                value={formData.day}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select Day</option>
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select Semester</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room
              </label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="Enter room number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Debug Information (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
              <strong>Debug Info:</strong>
              <br />Schedule ID: {schedule?._id || schedule?.id || 'MISSING'}
              <br />Department: {formData.departmentId}
              <br />Course: {formData.courseId}
              <br />Teacher: {formData.teacherId}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update Schedule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduleModal;