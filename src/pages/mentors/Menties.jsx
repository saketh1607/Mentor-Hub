import React, { useState, useEffect, useContext } from "react";
import { ref, onValue, set, get, update } from 'firebase/database';
import { Link, useNavigate } from "react-router-dom";
import Modal from 'react-modal';
import NavBar from "./Navbar";
import { realtime } from "../../firebase";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

Modal.setAppElement('#root');

function Menties() {
  const [menties, setMenties] = useState([]);
  const [selectedMenty, setSelectedMenty] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [followButton, setFollow] = useState("Follow");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { dispatch } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      setError("No user logged in");
      setLoading(false);
      return;
    }

    try {
      // Get mentees who have followed this mentor
      const mentorFollowersRef = ref(realtime, `mentor_followers/${currentUser.uid}`);

      const unsubscribe = onValue(mentorFollowersRef, (snapshot) => {
        try {
          const mentiesData = [];
          if (snapshot.exists()) {
            // Get all mentee data directly from the snapshot
            const followers = snapshot.val();
            Object.values(followers).forEach(menty => {
              mentiesData.push(menty);
            });
          }
          setMenties(mentiesData);
          setLoading(false);
        } catch (err) {
          console.error("Error processing menty data:", err);
          setError("Error loading menty data");
          setLoading(false);
        }
      }, (error) => {
        console.error("Error fetching menties:", error);
        setError("Error connecting to database");
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error("Error setting up menty listener:", err);
      setError("Error initializing menty list");
      setLoading(false);
    }
  }, [currentUser]);

  // Check if a menty is being followed when selected
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (selectedMenty && currentUser) {
        try {
          const followRef = ref(realtime, `mentor_followers/${currentUser.uid}/${selectedMenty.uid}`);
          const snapshot = await get(followRef);
          setFollow(snapshot.exists() ? "Following" : "Follow");
        } catch (err) {
          console.error("Error checking follow status:", err);
        }
      }
    };

    checkFollowStatus();
  }, [selectedMenty, currentUser]);

  const handleMentyClick = (menty) => {
    setSelectedMenty(menty);
    setModalIsOpen(true);
  };

  const handleClose = () => {
    setModalIsOpen(false);
  };

  const handleFollowToggle = async () => {
    if (selectedMenty && currentUser) {
      try {
        const mentorFollowersRef = ref(realtime, `mentor_followers/${currentUser.uid}/${selectedMenty.uid}`);
        const mentyFollowingRef = ref(realtime, `menty_following/${selectedMenty.uid}/${currentUser.uid}`);
        const snapshot = await get(mentorFollowersRef);
        
        if (snapshot.exists()) {
          // Unfollow
          await set(mentorFollowersRef, null);
          await set(mentyFollowingRef, null);
          setFollow("Follow");
        } else {
          // Follow
          const timestamp = new Date().toISOString();
          const mentorData = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            followedAt: timestamp
          };
          const mentyData = {
            uid: selectedMenty.uid,
            displayName: selectedMenty.displayName,
            email: selectedMenty.email,
            photoURL: selectedMenty.photoURL,
            followedAt: timestamp
          };

          // Update both sides of the relationship
          await set(mentorFollowersRef, mentyData);
          await set(mentyFollowingRef, mentorData);
          setFollow("Following");
        }
      } catch (err) {
        console.error("Error toggling follow status:", err);
        setError("Failed to update follow status");
      }
    }
  };

  const handleStartChat = async () => {
    if (selectedMenty && currentUser) {
      try {
        // Create a unique chat ID
        const combinedId = currentUser.uid > selectedMenty.uid
          ? currentUser.uid + selectedMenty.uid
          : selectedMenty.uid + currentUser.uid;

        // Initialize userChats documents if they don't exist
        const currentUserChatsRef = doc(db, "userChats", currentUser.uid);
        const selectedUserChatsRef = doc(db, "userChats", selectedMenty.uid);

        // Check if userChats documents exist
        const currentUserChatsDoc = await getDoc(currentUserChatsRef);
        const selectedUserChatsDoc = await getDoc(selectedUserChatsRef);

        // Create userChats documents if they don't exist
        if (!currentUserChatsDoc.exists()) {
          await setDoc(currentUserChatsRef, {});
        }
        if (!selectedUserChatsDoc.exists()) {
          await setDoc(selectedUserChatsRef, {});
        }

        // Check if chat exists
        const chatRef = doc(db, "chats", combinedId);
        const chatDoc = await getDoc(chatRef);

        if (!chatDoc.exists()) {
          // Create chat document with initial empty messages array
          await setDoc(chatRef, { messages: [] });
        }

        // Update user chats for current user
        await updateDoc(currentUserChatsRef, {
          [combinedId + ".userInfo"]: {
            uid: selectedMenty.uid,
            displayName: selectedMenty.displayName,
            photoURL: selectedMenty.photoURL,
            email: selectedMenty.email
          },
          [combinedId + ".date"]: serverTimestamp(),
          [combinedId + ".lastMessage"]: {
            text: "",
            date: serverTimestamp()
          }
        });

        // Update user chats for selected menty
        await updateDoc(selectedUserChatsRef, {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            email: currentUser.email
          },
          [combinedId + ".date"]: serverTimestamp(),
          [combinedId + ".lastMessage"]: {
            text: "",
            date: serverTimestamp()
          }
        });

        // Update chat context
        dispatch({
          type: "CHANGE_USER",
          payload: {
            uid: selectedMenty.uid,
            displayName: selectedMenty.displayName,
            photoURL: selectedMenty.photoURL,
            email: selectedMenty.email
          }
        });

        // Close modal and navigate to chat
        setModalIsOpen(false);
        navigate("/mentors/chatbox");
      } catch (error) {
        console.error("Error initializing chat:", error);
        setError("Failed to start chat. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="loading-container">
          <div>Loading menties...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="menty-list-container">
        <h2>Your Mentees</h2>
        {menties.length === 0 ? (
          <div className="no-menties">
            <p>No mentees found. They will appear here when they follow you.</p>
          </div>
        ) : (
          <div className="menty-list">
            {menties.map((menty, index) => (
              <div className="infodiv" key={index} onClick={() => handleMentyClick(menty)}>
                <img 
                  src={menty.photoURL} 
                  alt={menty.displayName} 
                  style={{ height: '50px', width: '50px', borderRadius: '50%' }} 
                />
                <div className="menty-info">
                  <p className="menty-name">{menty.displayName}</p>
                  <p className="menty-email">{menty.email}</p>
                </div>
                <i className="bi bi-info-square"></i>
              </div>
            ))}
          </div>
        )}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleClose}
          contentLabel="Selected Menty Details"
          style={{
            content: {
              height: '300px',
              width: '300px',
              margin: 'auto',
              background: '#f9f9f9',
              borderRadius: '8px',
              padding: '20px'
            }
          }} 
        >
          {selectedMenty && (
            <div className="menty-details">
              <i className="bi bi-x-lg clear-icon" onClick={handleClose}></i>
              <img 
                src={selectedMenty.photoURL} 
                alt={selectedMenty.displayName} 
                style={{ 
                  height: '50px', 
                  width: '50px',
                  borderRadius: '50%',
                  marginBottom: '10px'
                }} 
              />
              <p><strong>Name:</strong> {selectedMenty.displayName}</p>
              <p><strong>Email:</strong> {selectedMenty.email}</p>
              <p><strong>Phone Number:</strong> {selectedMenty.phoneNumber}</p>
              <div className="special">
                <button onClick={handleFollowToggle}>{followButton}</button>
                <button onClick={handleStartChat}>Message</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}

export default Menties;
