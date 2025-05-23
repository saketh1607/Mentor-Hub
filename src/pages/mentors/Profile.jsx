import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { updateProfile, signOut } from 'firebase/auth'; 
import { auth } from '../../firebase';
import NavBar from './Navbar';
import './style.scss'; 

function Profile() {
  const { currentUser } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    photoURL: '' 
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !currentUser.uid) {
        setError('No user logged in');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // First try to get user data from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPhoneNumber(userData.phoneNumber);
          setFormData({
            displayName: userData.displayName || currentUser.displayName || '',
            email: userData.email || currentUser.email || '',
            phoneNumber: userData.phoneNumber || '',
            bio: userData.bio || '',
            photoURL: userData.photoURL || currentUser.photoURL || ''
          });
        } else {
          // If no Firestore document exists, use auth data
          setFormData({
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            phoneNumber: '',
            bio: '',
            photoURL: currentUser.photoURL || ''
          });
        }
      } catch (error) {
        console.error('Error getting user document:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="loading-container">
          <div>Loading profile...</div>
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

  if (!currentUser) {
    return (
      <>
        <NavBar />
        <div className="error-container">
          <div className="error-message">Please log in to view your profile</div>
        </div>
      </>
    );
  }

  const handleEditProfile = () => {
    setEditProfileVisible(true);
  };

  const handleCancelEdit = () => {
    setEditProfileVisible(false);
  };

  const handleUpdateProfile = async () => {
    const confirmed = window.confirm("Are you sure you want to update your profile?");
    if (confirmed) {
      try {
        setError(null);
        
        // Update auth profile
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName,
          photoURL: formData.photoURL
        });

        // Update Firestore document
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          displayName: formData.displayName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          bio: formData.bio,
          photoURL: formData.photoURL,
          updatedAt: new Date().toISOString()
        });

        // Update local state
        setPhoneNumber(formData.phoneNumber);
        
        setEditProfileVisible(false);
      } catch (error) {
        console.error('Error updating user profile:', error);
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <>
      <NavBar />
      <div className={`profile-container ${editProfileVisible ? 'hidden' : ''}`}>
        <img src={formData.photoURL} alt="Profile" className="profile-image" />
        <div className="profile-details">
          <h2>{formData.displayName}</h2>
          <p>{formData.email}</p>
          <p className="phone-number">{formData.phoneNumber}</p>
          <p className="bio">{formData.bio}</p>
        </div>
        <div className="profile-actions">
          <button onClick={handleEditProfile}>Edit Profile</button>
          <Link to="/" onClick={() => signOut(auth)}>Logout</Link>
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
