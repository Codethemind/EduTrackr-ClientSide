import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: localStorage.getItem('accessToken') || null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { accessToken, user } = action.payload;
      state.accessToken = accessToken;
      state.user = user || null;
      localStorage.setItem('accessToken', accessToken); // ✅ Store accessToken on login
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem('accessToken'); // ✅ Clear localStorage when logging out
    },
    refreshTokenSuccess: (state, action) => {  // ✅ NEW: handle only token refresh
      const accessToken = action.payload;
      state.accessToken = accessToken;
      localStorage.setItem('accessToken', accessToken); // ✅ Update localStorage too
    },
  },
});

export const { loginSuccess, logout, refreshTokenSuccess } = authSlice.actions;
export default authSlice.reducer;
