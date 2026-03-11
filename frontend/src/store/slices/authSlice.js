import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  isInitializing: true,
  userId: null,
  phone: null,
  profile: null,
  onboardingCompleted: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.userId = action.payload.userId || null;
      state.phone = action.payload.phone || null;
      state.profile = action.payload.profile || null;
      state.error = null;
    },
    setOnboardingCompleted: (state, action) => {
      state.onboardingCompleted = action.payload;
      if (state.profile) {
        state.profile.onboardingCompleted = action.payload;
      }
    },
    setProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.phone = null;
      state.profile = null;
      state.onboardingCompleted = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitializing = false;
    },
  },
});

export const {
  setLoading,
  setAuthenticated,
  setOnboardingCompleted,
  setProfile,
  setError,
  logout,
  clearError,
  setInitialized,
} = authSlice.actions;

export default authSlice.reducer;
