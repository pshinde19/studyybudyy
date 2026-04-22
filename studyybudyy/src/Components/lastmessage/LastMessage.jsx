// New file: LastMessage.jsx
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';
import style from './LastMessage.module.css'

const LastMessage = () => {
  const lastMsg = useSelector((state) => {
    console.log('state.chat.lastMessageId',state.chat.lastMessageId);
    
    if(state.chat.lastMessageId){
        const msgs = state.chat.messages;
         return msgs[msgs.length - 1] 
    }else{
        return null
    }
    
  });
  console.log('lastMsg',lastMsg);
  // useEffect(() => {
  //     // if (status !== "sending") return;
  //     return () => {
        
  //     };
  //   }, [lastMsg]); //  
  if (!lastMsg) return null;
  console.log('last message returning');
  
  return (
    <div key={`msgbox_parent${lastMsg.messageId}`}>
      {lastMsg.chat.user?.map((chunk) => {
        console.log(chunk);
        
        switch (chunk.key) {
          case 'question':
            return <div key={`q_${lastMsg.messageId}`} className={`${style['userquestion']}`}>{chunk.content}</div>;
          default: return null;
        }
      })}

      {lastMsg.chat.bot?.map((chunk) => {
        console.log(chunk);
        switch (chunk.key) {
          case 'introduction':
            return <div key={`intro_${lastMsg.messageId}`}>{chunk.content}</div>;
          case 'thinking':
            return <div key={`think_${lastMsg.messageId}`}><ReactMarkdown>{chunk.content}</ReactMarkdown></div>;
          case 'retrive_document':
            return <div key={`doc_${lastMsg.messageId}`}>{JSON.parse(chunk.content).answer}</div>;
          case 'websearch':
            return <div key={`web_${lastMsg.messageId}`}>{JSON.parse(chunk.content).answer}</div>;
          case 'suggest_questions':
            return <div key={`sug_${lastMsg.messageId}`}>{JSON.parse(chunk.content).questions?.join(', ')}</div>;
          default: return null;
        }
      })}
    </div>
  );
};

export default LastMessage;