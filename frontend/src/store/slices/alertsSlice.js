import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import alertsService from '../../services/alerts.service';

export const fetchAlerts = createAsyncThunk('alerts/fetchAlerts', async (status = 'PENDING') => {
  const data = await alertsService.getAlerts(status);
  return data;
});

export const fetchAlertSummary = createAsyncThunk('alerts/fetchSummary', async () => {
  const data = await alertsService.getAlertSummary();
  return data;
});

export const dismissAlert = createAsyncThunk('alerts/dismiss', async (id) => {
  await alertsService.dismissAlert(id);
  return id;
});

export const actOnAlert = createAsyncThunk('alerts/act', async (id) => {
  await alertsService.actOnAlert(id);
  return id;
});

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    alerts: [],
    pendingCount: 0,
    hasHighUrgency: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.alerts || [];
        state.pendingCount = action.payload.pendingCount || 0;
        state.hasHighUrgency = action.payload.hasHighUrgency || false;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAlertSummary.fulfilled, (state, action) => {
        state.pendingCount = action.payload.pendingCount || 0;
        state.hasHighUrgency = action.payload.hasHighUrgency || false;
      })
      .addCase(dismissAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter((a) => a._id !== action.payload);
        state.pendingCount = Math.max(0, state.pendingCount - 1);
        if (state.pendingCount === 0) state.hasHighUrgency = false;
      })
      .addCase(actOnAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter((a) => a._id !== action.payload);
        state.pendingCount = Math.max(0, state.pendingCount - 1);
        if (state.pendingCount === 0) state.hasHighUrgency = false;
      });
  },
});

export default alertsSlice.reducer;
