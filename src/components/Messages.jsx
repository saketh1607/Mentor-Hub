import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import Message from "./Message";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    if (!data.chatId || data.chatId === "null") {
      setMessages([]);
      return;
    }

    try {
      const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
        if (doc.exists()) {
          setMessages(doc.data().messages || []);
        } else {
          setMessages([]);
        }
      }, (error) => {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages");
      });

      return () => {
        unSub();
      };
    } catch (error) {
      console.error("Error setting up message listener:", error);
      setError("Failed to initialize chat");
    }
  }, [data.chatId]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="messages">
      {messages.map((m) => (
        <Message message={m} key={m.id} />
      ))}
    </div>
  );
};

export default Messages;
