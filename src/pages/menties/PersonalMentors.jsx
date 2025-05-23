// PersonalMentors.js
import React, { useState, useEffect, useContext } from "react";
import { ref, onValue, set, get, update } from 'firebase/database';
import NavBar from "./Navbar";
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { realtime } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";

Modal.setAppElement('#root');

function PersonalMentors() {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [followButton, setFollow] = useState("Follow");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    try {
      const mentorsRef = ref(realtime, "personal mentor");

      const unsubscribe = onValue(mentorsRef, (snapshot) => {
        try {
          const mentorData = [];
          snapshot.forEach(childSnapshot => {
            const mentor = childSnapshot.val();
            mentorData.push(mentor);
          });
          setMentors(mentorData);
          setLoading(false);
        } catch (err) {
          console.error("Error processing mentor data:", err);
          setError("Error loading mentor data");
          setLoading(false);
        }
      }, (error) => {
        console.error("Error fetching mentors:", error);
        setError("Error connecting to database");
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error("Error setting up mentor listener:", err);
      setError("Error initializing mentor list");
      setLoading(false);
    }
  }, []);

  // Check if a mentor is being followed when selected
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (selectedMentor && currentUser) {
        try {
          const followRef = ref(realtime, `menty_following/${currentUser.uid}/${selectedMentor.uid}`);
          const snapshot = await get(followRef);
          setFollow(snapshot.exists() ? "Following" : "Follow");
        } catch (err) {
          console.error("Error checking follow status:", err);
        }
      }
    };

    checkFollowStatus();
  }, [selectedMentor, currentUser]);

  const handleMentorClick = (mentor) => {
    setSelectedMentor(mentor);
    setModalIsOpen(true);
  };

  const handleClose = () => {
    setModalIsOpen(false);
  };

  const handleFollowToggle = async () => {
    if (selectedMentor && currentUser) {
      try {
        const mentyFollowingRef = ref(realtime, `menty_following/${currentUser.uid}/${selectedMentor.uid}`);
        const mentorFollowersRef = ref(realtime, `mentor_followers/${selectedMentor.uid}/${currentUser.uid}`);
        const snapshot = await get(mentyFollowingRef);
        
        if (snapshot.exists()) {
          // Unfollow
          await set(mentyFollowingRef, null);
          await set(mentorFollowersRef, null);
          setFollow("Follow");
        } else {
          // Follow
          const timestamp = new Date().toISOString();
          const mentyData = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            followedAt: timestamp
          };
          const mentorData = {
            uid: selectedMentor.uid,
            displayName: selectedMentor.displayName,
            email: selectedMentor.email,
            photoURL: selectedMentor.photoURL,
            followedAt: timestamp
          };

          // Update both sides of the relationship
          await set(mentyFollowingRef, mentorData);
          await set(mentorFollowersRef, mentyData);

          // Also update the menties node to ensure the mentee is properly registered
          const mentyRef = ref(realtime, `menties/${currentUser.uid}`);
          await set(mentyRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            updatedAt: timestamp
          });

          setFollow("Following");
        }
      } catch (err) {
        console.error("Error toggling follow status:", err);
        setError("Failed to update follow status");
      }
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="loading-container">
          <div>Loading mentors...</div>
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
      <div className="mentor-list-container">
        <h2>Personal Mentors</h2>
        {mentors.length === 0 ? (
          <div className="no-mentors">
            <p>No personal mentors found.</p>
          </div>
        ) : (
          <div className="mentor-list">
            {mentors.map((mentor, index) => (
              <div className="infodiv" key={index} onClick={() => handleMentorClick(mentor)}>
                <img 
                  src={mentor.photoURL} 
                  alt={mentor.displayName} 
                  style={{ height: '50px', width: '50px', borderRadius: '50%' }} 
                />
                <div className="mentor-info">
                  <p className="mentor-name">{mentor.displayName}</p>
                  <p className="mentor-email">{mentor.email}</p>
                </div>
                <i className="bi bi-info-square"></i>
              </div>
            ))}
          </div>
        )}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleClose}
          contentLabel="Selected Mentor Details"
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
          {selectedMentor && (
            <div className="mentor-details">
              <i className="bi bi-x-lg clear-icon" onClick={handleClose}></i>
              <img 
                src={selectedMentor.photoURL} 
                alt={selectedMentor.displayName} 
                style={{ 
                  height: '50px', 
                  width: '50px',
                  borderRadius: '50%',
                  marginBottom: '10px'
                }} 
              />
              <p><strong>Name:</strong> {selectedMentor.displayName}</p>
              <p><strong>Email:</strong> {selectedMentor.email}</p>
              <p><strong>Phone Number:</strong> {selectedMentor.phoneNumber}</p>
              <div className="special">
                <button onClick={handleFollowToggle}>{followButton}</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}

export default PersonalMentors;
