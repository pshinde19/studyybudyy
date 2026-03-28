import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: []
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    appendToken: (state, action) => {
      const { messageId, token } = action.payload;

      const msg = state.messages.find(m => m.messageId === messageId);
      if (msg) {
        msg.answer += token;
      }
    },

    updateNodeData: (state, action) => {
      const { messageId, node, data } = action.payload;

      const msg = state.messages.find(m => m.messageId === messageId);
      if (!msg) return;

      msg[node] = data;
    },

    setLoading: (state, action) => {
      const { messageId, loading } = action.payload;

      const msg = state.messages.find(m => m.messageId === messageId);
      if (msg) {
        msg.loading = loading;
      }
    }
  }
});

export const {
  addMessage,
  appendToken,
  updateNodeData,
  setLoading
} = chatSlice.actions;

export default chatSlice.reducer;