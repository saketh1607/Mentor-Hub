import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import { AuthContextProvider } from "./context/AuthContext";
import { ChatContextProvider } from "./context/ChatContext";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./style.scss";
import MainHome from './Home';
import UserChoice from './choice'; 

import MentiesLogin from './pages/menties/Login';
import MentiesRegiester from './pages/menties/Register'; 
import MentiesPorfile from './pages/menties/Profile';
import MentiesChatbox from './pages/menties/chatbox';
import MentiesNavBar from './pages/menties/Navbar';
import MentiesProfessionalMentors from './pages/menties/ProfessionalMentors';
import MentiesPersonalMenties from './pages/menties/PersonalMentors';

import MentorsLogin from './pages/mentors/Login';
import MentorsRegiester from './pages/mentors/Register'; 
import MentorsPorfile from './pages/mentors/Profile';
import MentorsChatbox from './pages/mentors/chatbox';
import MentorsNavBar from './pages/mentors/Navbar';
import MentorsMenties from './pages/mentors/Menties';

function App() {
  const authContext = useContext(AuthContext);
  const currentUser = authContext ? authContext.currentUser : null;

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/choice" />;
    }

    return children;
  };

  return (
    <BrowserRouter>
        <AuthContextProvider>
          <ChatContextProvider>
            <Routes>
              {/* <Route path="/" element={<App />}> */}
                {/* menties */}
                <Route path="/menties/login" element={<MentiesLogin />} />
                <Route path="/menties/register" element={<MentiesRegiester />} />
                <Route path="/menties/Navbar" element={<MentiesNavBar/>}/>
                <Route path="/menties/chatbox" element={<MentiesChatbox />} />
                <Route path="/menties/profile" element={<MentiesPorfile />} />
                <Route path="/menties/professionalmentors" element={<MentiesProfessionalMentors/>}/>
                <Route path='/menties/personalmentors' element={<MentiesPersonalMenties/>}/>
                {/* mentors */}
                <Route path="/mentors/login" element={<MentorsLogin />} />
                <Route path="/mentors/register" element={<MentorsRegiester />} /> 
                <Route path="/mentors/Navbar" element={<MentorsNavBar/>}/>
                <Route path="/mentors/chatbox" element={<MentorsChatbox />} />
                <Route path="/mentors/profile" element={<MentorsPorfile />} /> 
                <Route path="/mentors/menties" element={<MentorsMenties />} /> 
                {/* root */}
                <Route index element={<MainHome />} />
                <Route path="/choice" element={<UserChoice />} />
              {/* </Route> */}
            </Routes>
          </ChatContextProvider>
        </AuthContextProvider>
      </BrowserRouter>
  );
}

export default App;
