import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './slices/employeeSlice';

import referenceDataReducer from './slices/referenceDataSlice';
import gradingReducer from './slices/gradingSlice'; // Add this import

export const store = configureStore({
  reducer: {
    employees: employeeReducer,

    referenceData: referenceDataReducer,
    grading: gradingReducer,
   
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export const RootState = store.getState;
export const AppDispatch = store.dispatch;