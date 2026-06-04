import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wellnessService } from '../services/services';

export const fetchWellnessScore = createAsyncThunk('wellness/fetchScore', async (_, { rejectWithValue }) => {
  try { const res = await wellnessService.getScore(); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const fetchWellnessHistory = createAsyncThunk('wellness/fetchHistory', async (params, { rejectWithValue }) => {
  try { const res = await wellnessService.getHistory(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const wellnessSlice = createSlice({
  name: 'wellness',
  initialState: { score: null, breakdown: null, history: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWellnessScore.pending, (s) => { s.loading = true; })
      .addCase(fetchWellnessScore.fulfilled, (s, a) => { s.loading = false; s.score = a.payload.totalScore; s.breakdown = a.payload.breakdown; })
      .addCase(fetchWellnessScore.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchWellnessHistory.fulfilled, (s, a) => { s.history = a.payload; });
  }
});

export default wellnessSlice.reducer;
