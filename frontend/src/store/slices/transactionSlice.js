import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionsService from '../../services/transactions.service';

export const fetchTransactions = createAsyncThunk('transactions/fetchTransactions', async (filters, { rejectWithValue }) => {
  try { return await transactionsService.getTransactions(filters); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load transactions'); }
});

export const fetchMonthlySummary = createAsyncThunk('transactions/fetchMonthlySummary', async ({ month, year } = {}, { rejectWithValue }) => {
  try { return await transactionsService.getMonthlySummary(month, year); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load summary'); }
});

const initialState = {
  transactions: [],
  monthlySummary: null,
  isLoading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setMonthlySummary: (state, action) => {
      state.monthlySummary = action.payload;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(
        t => t.transactionId === action.payload.transactionId
      );
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    updateTransactionCategory: (state, action) => {
      const { transactionId, category, isManualCategory } = action.payload;
      const transaction = state.transactions.find(t => t.transactionId === transactionId);
      if (transaction) {
        transaction.category = category;
        transaction.isManualCategory = isManualCategory;
      }
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
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.monthlySummary = action.payload;
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setLoading,
  setTransactions,
  setMonthlySummary,
  addTransaction,
  updateTransaction,
  updateTransactionCategory,
  setError,
  clearError,
} = transactionSlice.actions;

export default transactionSlice.reducer;
