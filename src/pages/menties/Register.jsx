import React, { useState } from "react";
import Rimage from "../../img/register.png";
import "./style.scss";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth, db, realtime } from "../../firebase"; 
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { ref as databaseRef, set as setDatabase } from 'firebase/database';

const Register = () => {
  const [error, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    setErr('');
    e.preventDefault();
    
    const displayName = e.target[0].value.trim();
    const email = e.target[1].value.trim().toLowerCase();
    const phoneNumber = e.target[2].value.trim();
    const password = e.target[3].value;
    const confirmPassword = e.target[4].value;

    console.log('Registration attempt with:', { email, displayName });
  
    if (!displayName || !email || !phoneNumber || !password || !confirmPassword) {
      setErr('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErr('Please enter a valid email address');
      setLoading(false);
      return;
    }
  
    if (!validatePhoneNumber(phoneNumber)) {
      setErr('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setErr('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
  
    if (password !== confirmPassword) {
      setErr('Passwords do not match');
      setLoading(false);
      return;
    }

    // Sign out any existing user first
    try {
      await signOut(auth);
    } catch (err) {
      console.log('No user to sign out');
    }
  
    try {
      console.log('Creating user with email:', email);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', res.user.uid);
      
      const placeholderColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      const placeholderAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${placeholderColor.substring(1)}&color=fff`;
  
      try {
        await updateProfile(res.user, {
          displayName,
          photoURL: placeholderAvatar,
        });

        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          displayName,
          email,
          phoneNumber,
          photoURL: placeholderAvatar,
          createdAt: new Date().toISOString()
        });

        await setDatabase(databaseRef(realtime, 'menties/' + res.user.uid), {
          uid: res.user.uid,
          displayName,
          email,
          phoneNumber,
          photoURL: placeholderAvatar,
          createdAt: new Date().toISOString()
        });

        await setDoc(doc(db, "userChats", res.user.uid), {});

        setErr('');
        setLoading(false);
        setSuccess('Registration successful!');
        
        setTimeout(() => {
          navigate("/menties/profile");
        }, 3000);

      } catch (err) {
        console.error('Profile update error:', err);
        setErr(err.message || 'Error updating profile');
        setLoading(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErr('This email is already registered. Please use a different email address or try logging in.');
      } else if (err.code === 'auth/invalid-email') {
        setErr('Invalid email address format');
      } else if (err.code === 'auth/weak-password') {
        setErr('Password is too weak. Please use at least 6 characters');
      } else if (err.code === 'auth/network-request-failed') {
        setErr('Network error. Please check your internet connection and try again.');
      } else {
        setErr(err.message || 'Registration failed. Please try again.');
      }
      setLoading(false);
    }
  };  

  return (
    <div className="formContainer">
      <div className="imageContainer">
        <img src={Rimage} alt="Error!" />
      </div>
      <div className="formWrapper">
        <span className="logo">Menties Side</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
            <input required type="text" placeholder="Full Name" />
            <input 
              required 
              type="email" 
              placeholder="Email" 
              onChange={(e) => {
                const email = e.target.value.trim().toLowerCase();
                console.log('Email input changed:', email);
              }}
            />
            <input required type="tel" placeholder="Phone Number (e.g., +1234567890)" />
            <input required type="password" placeholder="Password (min. 6 characters)" />
            <input required type="password" placeholder="Confirm Password" />
            <button disabled={loading}>Sign up</button>
            {loading && "Loading please wait..."}
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
        </form>
        <p>
          Already have an account? <Link to="/menties/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
