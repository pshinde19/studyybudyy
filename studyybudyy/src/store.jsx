import { configureStore } from '@reduxjs/toolkit';
import mainSlice from './features/MainSlice'
import chatSlice from './features/chatSlice'
export const store = configureStore({
  reducer: {
    metadata: mainSlice,
    chat: chatSlice
  },
});

