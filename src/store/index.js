import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './slices/employeeSlice';
import filterReducer from './slices/filterSlice';
import referenceDataReducer from './slices/referenceDataSlice';

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    filters: filterReducer,
    referenceData: referenceDataReducer,
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