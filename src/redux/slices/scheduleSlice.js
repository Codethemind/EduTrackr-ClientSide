import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as scheduleApi from '../../api/scheduleApi';

// Async thunks
export const fetchAllSchedules = createAsyncThunk(
  'schedule/fetchAllSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getAllSchedules();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSchedulesByDepartment = createAsyncThunk(
  'schedule/fetchSchedulesByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getSchedulesByDepartment(departmentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createNewSchedule = createAsyncThunk(
  'schedule/createNewSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.createSchedule(scheduleData);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to create schedule');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateExistingSchedule = createAsyncThunk(
  'schedule/updateExistingSchedule',
  async ({ scheduleId, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.updateSchedule(scheduleId, scheduleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  } 
);

export const deleteExistingSchedule = createAsyncThunk(
  'schedule/deleteExistingSchedule',
  async (scheduleId, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.deleteSchedule(scheduleId);
      return { scheduleId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWeeklySchedule = createAsyncThunk(
  'schedule/fetchWeeklySchedule',
  async ({ departmentId, weekStart }, { rejectWithValue }) => {
    try {
      const response = await scheduleApi.getWeeklySchedule(departmentId, weekStart);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  schedules: [],
  weeklySchedule: [],
  selectedDepartment: null,
  loading: false,
  error: null,
  success: false,
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
    clearScheduleError: (state) => {
      state.error = null;
    },
    clearScheduleSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all schedules
      .addCase(fetchAllSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSchedules.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && Array.isArray(action.payload.data)) {
          state.schedules = action.payload.data;
        } else {
          state.schedules = [];
        }
        state.success = true;
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.schedules = [];
      })
      // Fetch schedules by department
      .addCase(fetchSchedulesByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedulesByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
        state.success = true;
      })
      .addCase(fetchSchedulesByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create new schedule
      .addCase(createNewSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewSchedule.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.schedules = Array.isArray(state.schedules) ? [...state.schedules, action.payload.data] : [action.payload.data];
        }
        state.success = true;
      })
      .addCase(createNewSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update schedule
      .addCase(updateExistingSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.schedules.findIndex(schedule => schedule.id === action.payload.id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateExistingSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete schedule
      .addCase(deleteExistingSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingSchedule.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.schedules = state.schedules.filter(schedule => schedule._id !== action.payload.scheduleId);
        }
        state.success = true;
      })
      .addCase(deleteExistingSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch weekly schedule
      .addCase(fetchWeeklySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklySchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklySchedule = action.payload;
        state.success = true;
      })
      .addCase(fetchWeeklySchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedDepartment, clearScheduleError, clearScheduleSuccess } = scheduleSlice.actions;

export default scheduleSlice.reducer; 