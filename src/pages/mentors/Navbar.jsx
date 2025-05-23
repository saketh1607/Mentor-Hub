import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import { Link, Outlet} from 'react-router-dom';
import './style.scss';

const NavBar = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const [showUserChat, setShowUserChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );
  
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setErr(true); 
      } else {
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
        });
        setShowUserChat(true); 
        setErr(false);
      }
    } catch (err) {
      setErr(true);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };
  
  const handleClear = () => {
    setUsername("");
    setShowUserChat(false); 
    setErr(false); 
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar); 
  };

  return (
    <>
      {err && <div className="collapseerro">
        <span>User not found!</span>
        <span><i className="bi bi-info-square"></i></span>
      </div>}
      {showUserChat && (
        <div className="collapse user-chat-info">
          <img src={user.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
          <span><i className="bi bi-info-square"></i></span>
        </div>
      )}
      <nav className="navbar">
        <div className="navbar-logo">MentorHub</div>
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Find a user"
            onKeyDown={handleKey}
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <i className="bi bi-x-lg clear-icon" onClick={handleClear}></i>
          <i className="bi bi-search search-icon" onClick={handleSearch}></i>
        </div>
        <div className="navbar-icons">
          <Link to="/mentors/chatbox"><i className="bi bi-chat-left-text icon"></i></Link>
          <Link to="/mentors/profile"><i className="bi bi-person-circle icon"></i></Link>

          <i className="bi bi-list icon" onClick={toggleSidebar}></i>
        </div>
      </nav>

{showSidebar && (
  <div className="sidebar">
    <ul>
      <li><Link to="/mentors/menties">Menties</Link></li>
      <li><Link to="/mentors/chatbox">Chat Box</Link></li>
      <li><Link to="/mentors/profile">Profile</Link></li>
      <li><Link to="/">Logout</Link></li>
    </ul>
  </div>
)}
<Outlet/>
</>
);
};

export default NavBar;
