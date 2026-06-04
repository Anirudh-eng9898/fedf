import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityService } from '../services/services';

export const fetchActivities = createAsyncThunk('activity/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await activityService.getAll(params);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createActivity = createAsyncThunk('activity/create', async (data, { rejectWithValue }) => {
  try {
    const res = await activityService.create(data);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateActivity = createAsyncThunk('activity/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await activityService.update(id, data);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const removeActivity = createAsyncThunk('activity/delete', async (id, { rejectWithValue }) => {
  try {
    await activityService.delete(id);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const activitySlice = createSlice({
  name: 'activity',
  initialState: { items: [], pagination: null, loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchActivities.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.activities; state.pagination = action.payload.pagination; })
      .addCase(fetchActivities.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createActivity.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateActivity.fulfilled, (state, action) => { const i = state.items.findIndex(a => a.id === action.payload.id); if (i !== -1) state.items[i] = action.payload; })
      .addCase(removeActivity.fulfilled, (state, action) => { state.items = state.items.filter(a => a.id !== action.payload); });
  }
});

export const { clearError } = activitySlice.actions;
export default activitySlice.reducer;
