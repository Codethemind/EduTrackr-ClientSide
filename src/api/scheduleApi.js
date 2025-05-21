import axiosInstance from './axiosInstance';

// Get all schedules
export const getAllSchedules = async () => {
  try {
    const response = await axiosInstance.get('/api/schedules');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get schedules by department
export const getSchedulesByDepartment = async (departmentId) => {
  try {
    const response = await axiosInstance.get(`/api/schedules/department/${departmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new schedule
export const createSchedule = async (scheduleData) => {
  try {
    const response = await axiosInstance.post('/api/schedules/create', scheduleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a schedule
export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    const response = await axiosInstance.put(`/api/schedules/${scheduleId}`, scheduleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a schedule
export const deleteSchedule = async (scheduleId) => {
  try {
    const response = await axiosInstance.delete(`/api/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all teachers
export const getAllTeachers = async () => {
  try {
    const response = await axiosInstance.get('/api/teachers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get teachers by department
export const getTeachersByDepartment = async (departmentId) => {
  try {
    const response = await axiosInstance.get(`/api/teachers/department/${departmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all departments
export const getAllDepartments = async () => {
  try {
    const response = await axiosInstance.get('/api/departments');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all courses
export const getAllCourses = async () => {
  try {
    const response = await axiosInstance.get('/api/courses');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get courses by department
export const getCoursesByDepartment = async (departmentId) => {
  try {
    const response = await axiosInstance.get(`/api/courses/department/${departmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// // Get all rooms
// export const getAllRooms = async () => {
//   try {
//     const response = await axiosInstance.get('/api/rooms');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// Get schedule by ID
export const getScheduleById = async (scheduleId) => {
  try {
    const response = await axiosInstance.get(`/api/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get weekly schedule
export const getWeeklySchedule = async (departmentId, weekStart) => {
  try {
    const response = await axiosInstance.get(`/api/schedules/weekly`, {
      params: {
        departmentId,
        weekStart
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 