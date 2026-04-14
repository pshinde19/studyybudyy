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
              },
              {
                "messageId":"1234",
                "chat":{
                  "user":[
                    {  "key":"question",
                        "content":"what is react?"
                    }
                  ],
                  "bot":[
    {
        "key": "validate",
        "data": {
            "is_valid": true,
            "messageId": "1234"
        }
    },
    {
        "key": "thinking",
        "data": {
            "content": "### RAG Planning Protocol\nTo answer **What is the significance of keys in React?**, follow these steps:\n1. **Analyze & Query**: Identify key concepts.\n2. **Retrieve**: Perform semantic search.\n3. **Augment & Generate**: Combine context and synthesize answer.",
            "used_tokens": 60,
            "prompt_tokens": 549,
            "total_tokens": 609,
            "messageid": "1234"
        }
    },
    {
        "key": "retrive_document",
        "data": {
            "content": "{\n    \"answer\": \"Keys are used to uniquely identify and differentiate between components in React, helping React identify which items have changed, added, or removed, and efficiently update the DOM when the list changes.\",\n    \"citations\": [\"reactaa.pdf, Page 2\", \"reactaa.pdf, Page 5\"]\n}",
            "used_tokens": 67,
            "prompt_tokens": 479,
            "total_tokens": 546,
            "messageid": "1234"
        }
    },
    {
        "key": "websearch",
        "data": {
            "content": "{\n    \"answer\": \"React offers better performance, simplicity, and flexibility than Angular JS.\",\n    \"citations\": [\"https://www.geeksforgeeks.org/\", \"https://www.freecodecamp.org/\"]\n}",
            "used_tokens": 100,
            "prompt_tokens": 95,
            "total_tokens": 195,
            "messageid": "1234"
        }
    },
    {
        "key": "suggest_questions",
        "data": {
            "content": "{\n    \"questions\":[\n        \"How do keys in React help with rendering performance?\",\n        \"What happens when you don't assign a unique key to each element in a list in React?\",\n        \"Can you use the index of an array as a key in React, and what are the potential drawbacks of doing so?\"\n    ]\n}",
            "used_tokens": 69,
            "prompt_tokens": 76,
            "total_tokens": 145,
            "messageid": "1234"
        }
    }
                       ]          
                }
              }
            ],
  lastUpdated: null   // 👈 ADD THIS
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    
    updateNodeData: (state, action) => {
      const { messageId,key, payload } = action.payload;
      console.log('updateNodeDatas -messageId',messageId );
      console.log('updateNodeDatas -key',key  );
      console.log('updateNodeDatas -payload',payload );
    
      const msg = state.messages.find(m => m.messageId === messageId);
      if (!msg) {
        state.messages.push({
             "messageId":messageId,
             "chat":{
              "user":[payload],
              "bot":[]
             }
        })
        return 
      };
      msg['chat'][key] =[...msg['chat'][key],payload] ;
      // 👇 TRACK ONLY LAST CHANGE
      state.lastMessageId = messageId;  // ADD THIS LINE
    },

  }
});

export const {
  updateNodeData,
} = chatSlice.actions;

export default chatSlice.reducer;