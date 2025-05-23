import React, { useContext } from "react";
import Cam from "../img/cam.png";
import Add from "../img/add.png";
import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import ImageUpload from "./ImageUpload";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { doc, updateDoc, arrayUnion, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";
import { VIDEO_CALL_URL } from "../config";

const Chat = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  const handleVideoCall = async () => {
    if (!data.chatId || data.chatId === "null") {
      return;
    }

    try {
      // Send a message in the chat about video call initiation
      const messageData = {
        id: uuid(),
        text: `${currentUser.displayName} wants to start a video call`,
        senderId: currentUser.uid,
        date: Timestamp.now(),
        type: 'video_call_request'
      };

      const chatRef = doc(db, "chats", data.chatId);
      await updateDoc(chatRef, {
        messages: arrayUnion(messageData)
      });

      // Open video call in a new window with username as URL parameter
      const videoCallUrl = `${VIDEO_CALL_URL}?username=${encodeURIComponent(currentUser.displayName)}&mode=caller`;
      window.open(videoCallUrl, '_blank', 'width=800,height=600');

      // Update last message in user chats
      const lastMessage = {
        text: "Wants to start a video call",
        date: serverTimestamp()
      };

      const currentUserChatsRef = doc(db, "userChats", currentUser.uid);
      const otherUserChatsRef = doc(db, "userChats", data.user.uid);

      await Promise.all([
        updateDoc(currentUserChatsRef, {
          [data.chatId + ".lastMessage"]: lastMessage,
          [data.chatId + ".date"]: serverTimestamp()
        }),
        updateDoc(otherUserChatsRef, {
          [data.chatId + ".lastMessage"]: lastMessage,
          [data.chatId + ".date"]: serverTimestamp()
        })
      ]);
    } catch (error) {
      console.error("Error initiating video call:", error);
    }
  };

  return (
    <div className="chat" style={{ marginTop: '0px' }}>
      <div className="chatInfo">
        <span>{data.user?.displayName}</span>
        <div className="chatIcons">
          <img src={Cam} alt="" onClick={handleVideoCall} style={{ cursor: 'pointer' }} />
          <img src={Add} alt="" />
          <img src={More} alt="" />
        </div>
      </div>
      <Messages />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ImageUpload />
        <Input />
      </div>
    </div>
  );
};

export default Chat;
