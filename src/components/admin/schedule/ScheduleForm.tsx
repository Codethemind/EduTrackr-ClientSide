import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BookOpen, Users, Building } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewSchedule, clearScheduleError } from '../../../redux/slices/scheduleSlice';
import axios from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

// Define interfaces for data structures
interface Department {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  code: string;
  name: string;
  departmentId: string;
  semester: string;
}

interface Teacher {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  department: string;
}

interface FormData {
  department: string;
  course: string;
  teacher: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduleState {
  loading: boolean;
  error: string | null;
}

// Define days of week as a const array for type safety
const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

const ScheduleForm: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector((state: { schedule: ScheduleState }) => state.schedule);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    department: '',
    course: '',
    teacher: '',
    day: '',
    startTime: '',
    endTime: '',
  });

  // Fetch initial data (departments)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/departments');
        console.log('Departments response:', response.data);
        // Access the nested data array and validate
        setDepartments(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error: any) {
        console.error('Error loading departments:', error);
        toast.error(error.message || 'Failed to load departments');
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
        // Validate departmentId format
        if (!/^[0-9a-fA-F]{24}$/.test(formData.department)) {
          toast.error('Invalid department ID format');
          setCourses([]);
          setTeachers([]);
          setFormError('Invalid department ID format');
          return;
        }

        setIsLoading(true);
        try {
          const [coursesRes, teachersRes] = await Promise.all([
            axios.get('/api/courses'),
            axios.get('/api/teachers'),
          ]);

          console.log('Courses API Response:', coursesRes.data);
          console.log('Teachers API Response:', teachersRes.data);

          // Handle courses data
          if (coursesRes.data.success && Array.isArray(coursesRes.data.data)) {
            const departmentCourses = coursesRes.data.data.filter(
              (course: Course) => course.departmentId === formData.department
            );
            setCourses(departmentCourses);
          } else {
            setCourses([]);
            toast.error('No courses found for this department');
          }

          // Handle teachers data
          if (teachersRes.data.success && Array.isArray(teachersRes.data.data)) {
            console.log('All teachers:', teachersRes.data.data);
            const departmentTeachers = teachersRes.data.data.filter((teacher: Teacher) => {
              console.log('Checking teacher:', teacher);
              return teacher
              // return teacher.department === formData.department;
            });
            console.log('Filtered teachers:', departmentTeachers);
            setTeachers(departmentTeachers);
          } else {
            console.log('No teachers data found or invalid format');
            setTeachers([]);
            toast.error('No teachers found for this department');
          }
        } catch (error: any) {
          console.error('Error loading department data:', error);
          toast.error(error.message || 'Failed to load department data');
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to:`, value);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'department' && { course: '', teacher: '' }),
    }));
    setFormError(null);
    dispatch(clearScheduleError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.department ||
      !formData.course ||
      !formData.teacher ||
      !formData.day ||
      !formData.startTime ||
      !formData.endTime
    ) {
      const errorMessage = 'Please fill all required fields';
      toast.error(errorMessage);
      setFormError(errorMessage);
      return;
    }

    // Validate IDs format
    if (!/^[0-9a-fA-F]{24}$/.test(formData.department)) {
      const errorMessage = 'Invalid department ID format';
      toast.error(errorMessage);
      setFormError(errorMessage);
      return;
    }

    if (!/^[0-9a-fA-F]{24}$/.test(formData.course)) {
      const errorMessage = 'Invalid course ID format';
      toast.error(errorMessage);
      setFormError(errorMessage);
      return;
    }

    if (!/^[0-9a-fA-F]{24}$/.test(formData.teacher)) {
      const errorMessage = 'Invalid teacher ID format';
      toast.error(errorMessage);
      setFormError(errorMessage);
      return;
    }

    try {
      const selectedCourse = courses.find((course) => course._id === formData.course);
      console.log('Selected course:', selectedCourse);

      const selectedTeacher = teachers.find((teacher) => teacher.id === formData.teacher);
      console.log('Selected teacher:', selectedTeacher);

      const scheduleData = {
        departmentId: formData.department,
        courseId: formData.course,
        teacherId: formData.teacher,
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        semester: selectedCourse?.semester || 'Spring 2025',
      };

      console.log('Submitting schedule data:', scheduleData);

      const result = await dispatch(createNewSchedule(scheduleData)).unwrap();

      if (result.success) {
        setFormData({
          department: '',
          course: '',
          teacher: '',
          day: '',
          startTime: '',
          endTime: '',
        });
        setFormError(null);
        toast.success('Schedule created successfully');
      } else {
        const errorMessage = result.message || 'Failed to create schedule';
        toast.error(errorMessage);
        setFormError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to create schedule';
      toast.error(errorMessage);
      setFormError(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Schedule</h2>
      {formError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {formError}
        </div>
      )}
      {reduxError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {reduxError}
        </div>
      )}
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
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
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
                {courses.map((course) => (
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
                {teachers.map((teacher) => (
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
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
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
              loading || isLoading ? 'opacity-50 cursor-not-allowed' : ''
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