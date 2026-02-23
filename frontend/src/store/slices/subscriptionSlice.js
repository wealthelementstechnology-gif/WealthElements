import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import subscriptionsService from '../../services/subscriptions.service';

export const fetchSubscriptions = createAsyncThunk('subscriptions/fetchSubscriptions', async (_, { rejectWithValue }) => {
  try { return await subscriptionsService.getSubscriptions(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load subscriptions'); }
});

const initialState = {
  activeSubscriptions: [],
  detectedSubscriptions: [],
  inactiveSubscriptions: [],
  recurringPayments: [],
  isLoading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSubscriptions: (state, action) => {
      const { active, detected, inactive } = action.payload;
      state.activeSubscriptions = active || [];
      state.detectedSubscriptions = detected || [];
      state.inactiveSubscriptions = inactive || [];
      state.isLoading = false;
      state.error = null;
    },
    setRecurringPayments: (state, action) => {
      state.recurringPayments = action.payload;
    },
    confirmSubscription: (state, action) => {
      const subscriptionId = action.payload;
      const subscription = state.detectedSubscriptions.find(
        s => s.subscriptionId === subscriptionId
      );
      if (subscription) {
        subscription.isConfirmed = true;
        state.activeSubscriptions.push(subscription);
        state.detectedSubscriptions = state.detectedSubscriptions.filter(
          s => s.subscriptionId !== subscriptionId
        );
      }
    },
    cancelSubscription: (state, action) => {
      const subscriptionId = action.payload;
      const subscription = state.activeSubscriptions.find(
        s => s.subscriptionId === subscriptionId
      );
      if (subscription) {
        subscription.isActive = false;
        state.inactiveSubscriptions.push(subscription);
        state.activeSubscriptions = state.activeSubscriptions.filter(
          s => s.subscriptionId !== subscriptionId
        );
      }
    },
    addSubscription: (state, action) => {
      state.activeSubscriptions.push(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        const payload = action.payload || {};
        state.activeSubscriptions = payload.active || [];
        state.detectedSubscriptions = payload.detected || [];
        state.inactiveSubscriptions = payload.inactive || [];
        state.isLoading = false;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const {
  setLoading,
  setSubscriptions,
  setRecurringPayments,
  confirmSubscription,
  cancelSubscription,
  addSubscription,
  setError,
  clearError,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
