import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../socket/socket";
import {
  addMessage,
  appendToken,
  updateNodeData,
  setLoading
} from "../redux/chatSlice";

const ChatComponent = () => {
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages);

  const [input, setInput] = useState("");

  // 🔌 Socket listeners
  useEffect(() => {
    socket.on("stream_token", (data) => {
      dispatch(appendToken(data));
    });

    socket.on("node_update", (data) => {
      dispatch(updateNodeData(data));
    });

    socket.on("done", (data) => {
      dispatch(setLoading({ messageId: data.messageId, loading: false }));
    });

    return () => {
      socket.off("stream_token");
      socket.off("node_update");
      socket.off("done");
    };
  }, [dispatch]);

  // 🚀 Send message
  const sendMessage = () => {
    if (!input.trim()) return;

    const messageId = Date.now().toString();

    dispatch(addMessage({
      messageId,
      question: input,
      answer: "",
      loading: true,
      thinking: "",
      documentSources: [],
      web_search: "",
      llm_knowledge: "",
      followUpQuestions: []
    }));

    socket.emit("chat", {
      query: input,
      filename: "reactaa.pdf",
      messageId
    });

    setInput("");
  };

  // ⌨️ Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Chat Section */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {messages.map((msg) => (
          <div key={msg.messageId} style={{ marginBottom: "20px" }}>

            {/* Question */}
            <div style={{ fontWeight: "bold" }}>
              🧑 {msg.question}
            </div>

            {/* Answer */}
            <div style={{ marginTop: "5px", whiteSpace: "pre-wrap" }}>
              🤖 {msg.answer}
            </div>

            {/* Loading */}
            {msg.loading && (
              <div style={{ color: "gray", fontSize: "12px" }}>
                typing...
              </div>
            )}

            {/* Thinking */}
            {msg.thinking && (
              <div style={{ marginTop: "5px", fontSize: "12px", color: "#888" }}>
                🧠 {msg.thinking}
              </div>
            )}

            {/* Sources */}
            {msg.documentSources?.length > 0 && (
              <div style={{ fontSize: "12px" }}>
                📄 Sources:
                {msg.documentSources.map((s, i) => (
                  <div key={i}>
                    {s.filename} (pg {s.page})
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Input Box */}
      <div style={{
        display: "flex",
        padding: "10px",
        borderTop: "1px solid #ccc"
      }}>
        <input
          style={{ flex: 1, padding: "10px" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
        />

        <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;