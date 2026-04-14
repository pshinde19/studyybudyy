// New file: LastMessage.jsx
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';

const LastMessage = () => {
  const lastMsg = useSelector((state) => {
    const msgs = state.chat.messages;
    return msgs[msgs.length - 1] ?? null;
  });

  if (!lastMsg) return null;

  return (
    <div key={`msgbox_parent${lastMsg.messageId}`}>
      {lastMsg.chat.user?.map((chunk) => {
        switch (chunk.key) {
          case 'question':
            return <div key={`q_${lastMsg.messageId}`} className="userquestion">{chunk.content}</div>;
          default: return null;
        }
      })}

      {lastMsg.chat.bot?.map((chunk) => {
        switch (chunk.key) {
          case 'introduction':
            return <div key={`intro_${lastMsg.messageId}`}>{chunk.content}</div>;
          case 'thinking':
            return <div key={`think_${lastMsg.messageId}`}><ReactMarkdown>{chunk.data.content}</ReactMarkdown></div>;
          case 'retrive_document':
            return <div key={`doc_${lastMsg.messageId}`}>{JSON.parse(chunk.data.content).answer}</div>;
          case 'websearch':
            return <div key={`web_${lastMsg.messageId}`}>{JSON.parse(chunk.data.content).answer}</div>;
          case 'suggest_questions':
            return <div key={`sug_${lastMsg.messageId}`}>{JSON.parse(chunk.data.content).questions?.join(', ')}</div>;
          default: return null;
        }
      })}
    </div>
  );
};

export default LastMessage;