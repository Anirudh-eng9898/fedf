import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sleepService } from '../services/services';

export const fetchSleep = createAsyncThunk('sleep/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await sleepService.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const createSleep = createAsyncThunk('sleep/create', async (data, { rejectWithValue }) => {
  try { const res = await sleepService.create(data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const updateSleep = createAsyncThunk('sleep/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await sleepService.update(id, data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const removeSleep = createAsyncThunk('sleep/delete', async (id, { rejectWithValue }) => {
  try { await sleepService.delete(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const sleepSlice = createSlice({
  name: 'sleep',
  initialState: { items: [], pagination: null, loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSleep.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSleep.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.entries; s.pagination = a.payload.pagination; })
      .addCase(fetchSleep.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createSleep.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateSleep.fulfilled, (s, a) => { const i = s.items.findIndex(x => x.id === a.payload.id); if (i !== -1) s.items[i] = a.payload; })
      .addCase(removeSleep.fulfilled, (s, a) => { s.items = s.items.filter(x => x.id !== a.payload); });
  }
});

export const { clearError } = sleepSlice.actions;
export default sleepSlice.reducer;
