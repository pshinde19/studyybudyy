// New file: HistoricalMessage.jsx
import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import style from './Allmessage.module.css'

const Allmessage = memo(({ msg }) => {
   console.log(msg)
  return (
    <div key={`msgbox_parent${msg.messageId}`}>
      {msg.chat.user?.map((chunk) => {
        switch (chunk.key) {
          case 'question':
            return <div key={`q_${msg.messageId}`} className={`${style['userquestion']}`}>{chunk.content}</div>;
          default: return null;
        }
      })}
      {msg.chat.bot?.map((chunk) => {
        switch (chunk.key) {
          case 'introduction':
            return <div key={`intro_${msg.messageId}`}>{chunk.content}</div>;
          case 'thinking':
            return <div key={`think_${msg.messageId}`}><ReactMarkdown>{chunk.content}</ReactMarkdown></div>;
          case 'retrive_document':
            return <div key={`doc_${msg.messageId}`}>{JSON.parse(chunk.content).answer}</div>;
          case 'websearch':
            return <div key={`web_${msg.messageId}`}>{JSON.parse(chunk.content).answer}</div>;
          case 'suggest_questions':
            return <div key={`sug_${msg.messageId}`}>{JSON.parse(chunk.content).questions?.join(', ')}</div>;
            default: return null;
        }
      })}
    </div>
  );
});

export default Allmessage;