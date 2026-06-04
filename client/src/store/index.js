import { configureStore } from '@reduxjs/toolkit';
import activityReducer from './activitySlice';
import sleepReducer from './sleepSlice';
import hydrationReducer from './hydrationSlice';
import wellnessReducer from './wellnessSlice';

const store = configureStore({
  reducer: {
    activity: activityReducer,
    sleep: sleepReducer,
    hydration: hydrationReducer,
    wellness: wellnessReducer
  }
});

export default store;
