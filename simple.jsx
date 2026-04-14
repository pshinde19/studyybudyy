import React, { useState, useEffect, useRef } from 'react';
import style from './Chatsection.module.css';
import { useSelector } from 'react-redux';
import { FileText, Mic, Send, Square } from 'lucide-react';
import { io } from 'socket.io-client';

const Chatsection = () => {
  const currentSelectedcollection = useSelector(state => state.metadata.currentSelectedcollection);
  const [message, setMessage] = useState('');
  const socketRef = useRef(null);

  // 1. Initialize Socket Connection
  useEffect(() => {
    // Replace with your server URL
    socketRef.current = io('http://localhost:4000');

    socketRef.current.on('connect', () => {
      console.log('Connected to server:', socketRef.current.id);
    });

    // Handle incoming messages from server
    socketRef.current.on('receive_message', (data) => {
      console.log('Message from server:', data);
      // You can dispatch to Redux or update local state here
    });

    // Cleanup on component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 2. Send Message Function
  const handleSendMessage = (e) => {
    // Check if it's a click or an Enter key press (without Shift)
    if (e.type === 'keydown' && e.key !== 'Enter') return;
    if (e.key === 'Enter' && e.shiftKey) return; // Allow new lines with Shift+Enter
    
    e.preventDefault();

    if (message.trim() && socketRef.current) {
      const payload = {
        text: message,
        collection: currentSelectedcollection,
        timestamp: new Date().toISOString(),
      };

      // Emit event to server
      socketRef.current.emit('send_message', payload);
      
      // Clear input
      setMessage('');
    }
  };

  return (
    <div className={`${style.chatsection_parent}`}>
      <div className={`${style['currentselected-collection']}`}>
        <FileText size={20} color="hsl(184, 87%, 49%)" strokeWidth={2} />
        <p>{currentSelectedcollection}</p>
      </div>
      
      <div className={style.message_display}>
        {/* Map your messages here */}
        message section
      </div>

      <div className={`${style['userinputbox']}`}>
        <div className={`${style['usertextareabox']}`}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleSendMessage}
            rows={2}
            name="Userinput"
            id="Userinput"
            className={`${style['textarea']}`}
            placeholder="Type a message..."
          ></textarea>
        </div>
        <div className={`${style['micbox']}`}>
          <Mic size={20} color="#f90101" strokeWidth={2} />
        </div>
        <div className={`${style['actionbtns']}`}>
          <Send 
            onClick={handleSendMessage} 
            size={20} 
            color="#fff" 
            strokeWidth={2} 
            style={{ cursor: 'pointer' }}
          />
          <Square size={20} color="#fff" strokeWidth={2} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default Chatsection;