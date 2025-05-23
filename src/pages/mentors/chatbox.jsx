import React from 'react';
import Sidebar from '../../components/Sidebar';
import Chat from '../../components/Chat';
import NavBar from './Navbar';

function chatbox() {
    return (
      <>
      <NavBar/>
        <div className='home'>
          <div className="container">
            <Sidebar/>
            <Chat/>
          </div>
        </div>
      </>
      )
    }
    
export default chatbox;
