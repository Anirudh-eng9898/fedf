import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hydrationService } from '../services/services';

export const fetchHydration = createAsyncThunk('hydration/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await hydrationService.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const createHydration = createAsyncThunk('hydration/create', async (data, { rejectWithValue }) => {
  try { const res = await hydrationService.create(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const removeHydration = createAsyncThunk('hydration/delete', async (id, { rejectWithValue }) => {
  try { await hydrationService.delete(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const hydrationSlice = createSlice({
  name: 'hydration',
  initialState: { entries: [], dailyTotals: {}, loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHydration.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchHydration.fulfilled, (s, a) => { s.loading = false; s.entries = a.payload.entries; s.dailyTotals = a.payload.dailyTotals; })
      .addCase(fetchHydration.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createHydration.fulfilled, (s, a) => { s.entries.unshift(a.payload.entry); })
      .addCase(removeHydration.fulfilled, (s, a) => { s.entries = s.entries.filter(e => e.id !== a.payload); });
  }
});

export const { clearError } = hydrationSlice.actions;
export default hydrationSlice.reducer;
