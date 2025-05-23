import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";

const Input = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    if (!data.chatId || data.chatId === "null") {
      setError("Please select a chat first");
      return;
    }
    if (!text.trim()) {
      setError("Please enter a message");
      return;
    }
    try {
      setError(null);
      setSending(true);
      // Initialize userChats documents if they don't exist
      const currentUserChatsRef = doc(db, "userChats", currentUser.uid);
      const otherUserChatsRef = doc(db, "userChats", data.user.uid);
      const [currentUserChatsDoc, otherUserChatsDoc] = await Promise.all([
        getDoc(currentUserChatsRef),
        getDoc(otherUserChatsRef)
      ]);
      if (!currentUserChatsDoc.exists()) {
        await setDoc(currentUserChatsRef, {});
      }
      if (!otherUserChatsDoc.exists()) {
        await setDoc(otherUserChatsRef, {});
      }
      // Initialize or get chat document
      const chatRef = doc(db, "chats", data.chatId);
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        await setDoc(chatRef, { messages: [] });
      }
      const messageData = {
        id: uuid(),
        text: text.trim(),
        senderId: currentUser.uid,
        date: Timestamp.now(),
      };
      await updateDoc(chatRef, {
        messages: arrayUnion(messageData)
      });
      // Update user chats for both users
      const lastMessage = {
        text: text.trim(),
        date: serverTimestamp()
      };
      const currentUserInfo = {
        uid: currentUser.uid,
        displayName: currentUser.displayName || '',
        photoURL: currentUser.photoURL || ''
      };
      const otherUserInfo = {
        uid: data.user.uid,
        displayName: data.user.displayName || '',
        photoURL: data.user.photoURL || ''
      };
      await Promise.all([
        updateDoc(currentUserChatsRef, {
          [data.chatId + ".userInfo"]: otherUserInfo,
          [data.chatId + ".lastMessage"]: lastMessage,
          [data.chatId + ".date"]: serverTimestamp()
        }),
        updateDoc(otherUserChatsRef, {
          [data.chatId + ".userInfo"]: currentUserInfo,
          [data.chatId + ".lastMessage"]: lastMessage,
          [data.chatId + ".date"]: serverTimestamp()
        })
      ]);
      setText("");
    } catch (error) {
      setError("Failed to send message. Please try again.");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="input">
      {error && <div className="error-message">{error}</div>}
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setText(e.target.value)}
        value={text}
        disabled={sending}
      />
      <div className="send">
        <button onClick={handleSend} disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Input;
