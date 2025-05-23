import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import NavBar from './Navbar';
import './style.scss'; 

function Profile() {
  const { currentUser } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    photoURL: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !currentUser.uid) {
        console.log('No current user found, redirecting to login...');
        navigate('/menties/login');
        return;
      }

      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setPhoneNumber(userData.phoneNumber);
          setFormData({
            displayName: userData.displayName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            bio: userData.bio || '',
            photoURL: userData.photoURL || ''
          });
        } else {
          console.log('No user document found');
          // Create a new user document if it doesn't exist
          try {
            await updateDoc(docRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || '',
              email: currentUser.email || '',
              phoneNumber: '',
              bio: '',
              photoURL: currentUser.photoURL || ''
            });
            console.log('Created new user document');
          } catch (error) {
            console.error('Error creating user document:', error);
          }
        }
      } catch (error) {
        console.error('Error getting user document:', error);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleEditProfile = () => {
    setEditProfileVisible(true);
  };

  const handleCancelEdit = () => {
    setEditProfileVisible(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!currentUser || !currentUser.uid) {
      console.error('No current user found');
      return;
    }

    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, formData);
      setEditProfileVisible(false);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className={`profile-container ${editProfileVisible ? 'hidden' : ''}`}>
        <img src={formData.photoURL} alt="Profile" className="profile-image" />
        <div className="profile-details">
          <h2>{formData.displayName}</h2>
          <p><b>Email:</b> {formData.email}</p>
          <p className="phone-number"><b>Contact:</b> {phoneNumber}</p>
          <p className="bio"><b>Bio:</b> {formData.bio}</p>
        </div>
        <div className="profile-actions">
          <button onClick={handleEditProfile}>Edit Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className={`edit-profile-container ${editProfileVisible ? '' : 'hidden'}`}>
        <input 
          required 
          type="text" 
          placeholder="Full Name" 
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
        />
        <input 
          required 
          type="email" 
          placeholder="Email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <input 
          required 
          type="tel" 
          placeholder="Phone Number" 
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
        <input 
          required 
          type="text" 
          placeholder="Add Bio" 
          name="bio"
          value={formData.bio}
          onChange={handleChange}
        />
        <button onClick={handleUpdateProfile}>Update</button>
        <button onClick={handleCancelEdit}>Cancel</button>
      </div>
    </>
  );
}

export default Profile;
