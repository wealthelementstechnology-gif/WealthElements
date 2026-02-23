import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accountsService from '../../services/accounts.service';

// Async thunk — fetch accounts from backend
export const fetchAccounts = createAsyncThunk('networth/fetchAccounts', async (_, { rejectWithValue }) => {
  try {
    return await accountsService.getAccounts();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load accounts');
  }
});

const initialState = {
  totalNetWorth: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  assetAccounts: [],
  liabilityAccounts: [],
  trendData: [],
  lastUpdated: null,
  isLoading: false,
  error: null,
};

const networthSlice = createSlice({
  name: 'networth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setNetworthData: (state, action) => {
      const { assetAccounts, liabilityAccounts, trendData } = action.payload;
      state.assetAccounts = assetAccounts;
      state.liabilityAccounts = liabilityAccounts;
      state.trendData = trendData;

      // Calculate totals
      state.totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
      state.totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0);
      state.totalNetWorth = state.totalAssets - state.totalLiabilities;
      state.lastUpdated = new Date().toISOString();
      state.isLoading = false;
      state.error = null;
    },
    addAccount: (state, action) => {
      const account = action.payload;
      if (account.assetOrLiability === 'ASSET') {
        state.assetAccounts.push(account);
        state.totalAssets += account.balance;
      } else {
        state.liabilityAccounts.push(account);
        state.totalLiabilities += account.balance;
      }
      state.totalNetWorth = state.totalAssets - state.totalLiabilities;
    },
    updateAccount: (state, action) => {
      const account = action.payload;
      const isAsset = account.assetOrLiability === 'ASSET';
      const accounts = isAsset ? state.assetAccounts : state.liabilityAccounts;
      const index = accounts.findIndex(acc => acc.accountId === account.accountId);

      if (index !== -1) {
        const oldBalance = accounts[index].balance;
        const balanceDiff = account.balance - oldBalance;
        accounts[index] = account;

        if (isAsset) {
          state.totalAssets += balanceDiff;
        } else {
          state.totalLiabilities += balanceDiff;
        }
        state.totalNetWorth = state.totalAssets - state.totalLiabilities;
      }
    },
    removeAccount: (state, action) => {
      const { accountId, assetOrLiability } = action.payload;
      if (assetOrLiability === 'ASSET') {
        const account = state.assetAccounts.find(acc => acc.accountId === accountId);
        if (account) {
          state.totalAssets -= account.balance;
          state.assetAccounts = state.assetAccounts.filter(acc => acc.accountId !== accountId);
        }
      } else {
        const account = state.liabilityAccounts.find(acc => acc.accountId === accountId);
        if (account) {
          state.totalLiabilities -= account.balance;
          state.liabilityAccounts = state.liabilityAccounts.filter(acc => acc.accountId !== accountId);
        }
      }
      state.totalNetWorth = state.totalAssets - state.totalLiabilities;
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
      .addCase(fetchAccounts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        const { accounts, summary, trendData } = action.payload;
        state.assetAccounts = accounts.filter(a => a.assetOrLiability === 'ASSET');
        state.liabilityAccounts = accounts.filter(a => a.assetOrLiability === 'LIABILITY');
        state.totalAssets = summary.totalAssets;
        state.totalLiabilities = summary.totalLiabilities;
        state.totalNetWorth = summary.netWorth;
        state.trendData = trendData || [];
        state.lastUpdated = new Date().toISOString();
        state.isLoading = false;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const {
  setLoading,
  setNetworthData,
  addAccount,
  updateAccount,
  removeAccount,
  setError,
  clearError,
} = networthSlice.actions;

export default networthSlice.reducer;
