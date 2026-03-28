import { configureStore } from '@reduxjs/toolkit';
import mainSlice from './features/MainSlice'
export const store = configureStore({
  reducer: {
    metadata: mainSlice,
    // chat: chatReducer
  },
});

