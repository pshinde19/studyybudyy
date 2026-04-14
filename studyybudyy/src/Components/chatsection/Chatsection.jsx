import React, { useEffect, useState, useRef } from 'react';
import style from './Chatsection.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Mic, Send, Square } from 'lucide-react';
import { connectSocket, disconnectSocket } from '../../socket';
import ReactMarkdown from 'react-markdown';
import { updateNodeData } from '../../features/chatSlice';
import LastMessage from '../lastmessage/LastMessage';
import Allmessage from '../allmessage/Allmessage';

const Chatsection = () => {
  console.log('Chatsection Component rendered');
  const [chatList, setChatList] = useState([]);
  const dispatch=useDispatch()
  
  const currentSelectedcollection = useSelector(
    (state) => state.metadata.currentSelectedcollection
  );
  // With these two:
  const historicalMessages = useSelector(
    (state) => state.chat.messages.slice(0, -1), // all except last
    // Prevents re-render when only last message changes
    (prev, next) => prev.length === next.length
  );

  const lastMessageId = useSelector((state) => state.chat.lastMessageId);
  
  
  const socketRef = useRef(null);
  const inputRef = useRef(null); // Ref for the textarea to avoid re-renders
  const heartbeatRef = useRef(null); // Use ref for timer to avoid closure issues

  const [status, setStatus] = useState("idle"); // idle | sending | streaming | completed | error
 

  const handleFailure = (reason) => {
    console.log(`⚠️ Failure: ${reason}`);
    setStatus("error");
    if (heartbeatRef.current) clearTimeout(heartbeatRef.current);
    disconnectSocket();
  };

  const resetHeartbeat = (timeoutMs) => {
    if (heartbeatRef.current) clearTimeout(heartbeatRef.current);
    heartbeatRef.current = setTimeout(() => {
      handleFailure(timeoutMs === 20000 ? "Initial connection timeout" : "Stream stalled");
    }, timeoutMs);
  };

  
  useEffect(() => {
    
    // if (status !== "sending") return;
    
    socketRef.current = connectSocket();
    const s = socketRef.current;

    // ⏱ Start initial timeout
    resetHeartbeat(20000);

    s.on("connect", () => {
      let messageId=crypto.randomUUID();
      let currentVal=inputRef.current.value;
      let data={
      "messageId":messageId,
      "key":"user",
      "payload": { "key":"question",
                 "content":currentVal
              }
    }
    dispatch(updateNodeData(data))
    let inputObj={
        "query": currentVal,
        "filename": "reactaa.pdf",
        "messageId": messageId,
        "user_id":  "21a1ff59-f04b-450e-bf46-322617dae796",
        "user_name": "pranay",
        "description": "this pdf is about react javascript framework"
    }
    s.emit("start_stream", inputObj);
    });

    s.on("chunks", (chunk) => {
      console.log(chunk);
      console.log(chunk.output.messageId);
      
      let data={
          "messageId":chunk.output.messageId,
          "key":"bot",
          "payload": chunk.output
        }
      console.log('updating bot response');
      dispatch(updateNodeData(data))
      resetHeartbeat(10000); // Reset "stalled" timer
      setStatus("streaming");
    });

    s.on("response_end", (chunk) => {
      console.log('response_end', chunk);
      console.log("✅ Stream finished");
      if (heartbeatRef.current) clearTimeout(heartbeatRef.current);
      setStatus("completed");
      disconnectSocket();
    });

    s.on("connect_error", (err) => {
      handleFailure(err.message);
    });

    s.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        handleFailure(reason);
      }
    });

    // Clean up listeners on unmount or if status changes away from sending/streaming
    return () => {
      if (heartbeatRef.current) clearTimeout(heartbeatRef.current);
      s.off("connect");
      s.off("chunks");
      s.off("response_end");
      s.off("connect_error");
      s.off("disconnect");
    };
  }, [status === "sending"]); //  

  const sendMessage = (e) => {
    // Handle Enter key logic
    if (e.type === 'keydown') {
      if (e.key !== 'Enter' || e.shiftKey) return;
      e.preventDefault(); // Stop new line in textarea
    }

    const currentVal = inputRef.current.value;
    if (!currentVal.trim() || status === "sending" || status === "streaming") return;
  
    console.log('Sending message:', currentVal);
    setStatus("sending");
    inputRef.current.value = ""; // Clear the UI manually
  };

  const stopStream = () => {
    console.log("🛑 Stopping stream...");
    disconnectSocket();
    if (heartbeatRef.current) clearTimeout(heartbeatRef.current);
    setStatus("idle");
  };

  return (
    <div className={style.chatsection_parent}>
      {/* 📄 Selected Collection */}
      <div className={style['currentselected-collection']}>
        <FileText size={20} color="hsl(184, 87%, 49%)" strokeWidth={2} />
        <p>{currentSelectedcollection || "No collection selected"}</p>
      </div>

      {/* 💬 Message Section */}
      <div className={style['messageBoxParent']}>
        {historicalMessages.map((msg) => (
          <Allmessage key={msg.messageId} msg={msg} />
        ))}
        <LastMessage />   {/* Only this re-renders on every chunk */}
      </div>

      {/* 📝 Input Section */}
      <div className={style['userinputbox']}>
        <div className={style['usertextareabox']}>
          <textarea ref={inputRef} onKeyDown={sendMessage} rows={2} className={style['textarea']} placeholder="Type your message..." />
        </div>
        <div className={style['micbox']}>
          <Mic size={20} color="#f90101" strokeWidth={2} />
        </div>
        <div className={style['actionbtns']}>
          {status === "streaming" ? (
            <Square size={20} color="#fff" fill="#fff" strokeWidth={2} onClick={stopStream} />
          ) : (
            <Send onClick={sendMessage} size={20} color="#fff" strokeWidth={2} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatsection;