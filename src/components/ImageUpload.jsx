import React, { useContext, useRef, useState } from "react";
import Img from "../img/img.png";
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

const ImageUpload = () => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!data.chatId || data.chatId === "null") {
      setError("Please select a chat first");
      return;
    }
    setUploading(true);
    setError(null);
    try {
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
      // Upload image
      const imageUrl = await uploadToCloudinary(file);
      const messageData = {
        id: uuid(),
        text: "",
        senderId: currentUser.uid,
        date: Timestamp.now(),
        img: imageUrl
      };
      await updateDoc(chatRef, {
        messages: arrayUnion(messageData)
      });
      // Update user chats for both users
      const lastMessage = {
        text: "[Image]",
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
    } catch (error) {
      setError("Failed to send image. Please try again.");
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        disabled={uploading}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        disabled={uploading}
        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
        title="Attach an image"
      >
        <img src={Img} alt="Attach file" style={{ width: 24, height: 24 }} />
      </button>
      {uploading && (
        <span style={{ marginLeft: 8, color: '#666', fontSize: 14 }}>Uploading...</span>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ImageUpload; 