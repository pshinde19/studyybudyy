import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [{
                "messageId":"1",
                "chat":{
                  "user":[],
                  "bot":[
                          {  "key":"introduction",
                            "content":"hello,i am your chatbot. what can i help you"
                          }
                        ]
                 
                }
              }
            ],
  lastMessageId: null   // 👈 ADD THIS
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    
    updateNodeData: (state, action) => {
      const { messageId,key, payload } = action.payload;
      console.log('updateNodeDatas',messageId ,key ,payload)
      const msg = state.messages.find(m => m.messageId === messageId);
      if (!msg) {
        console.log('new message');
        state.messages.push({
             "messageId":messageId,
             "chat":{
              "user":[payload],
              "bot":[]
             }
        })
        return 
      };
      console.log("msg['chat']",msg['chat']);
      
      msg['chat'][key] =[...msg['chat'][key],payload] ;
      // 👇 TRACK ONLY LAST CHANGE
      state.lastMessageId = messageId;  // ADD THIS LINE
      console.log('state.messages',state.messages);
      
    },

  }
});

export const {
  updateNodeData,
} = chatSlice.actions;

export default chatSlice.reducer;