import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import scheduleReducer from './slices/scheduleSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    schedule: scheduleReducer,
    notification: notificationReducer,
    // Add other reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
