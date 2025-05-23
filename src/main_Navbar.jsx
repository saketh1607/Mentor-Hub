import React from 'react';
import './home_styles.scss'; 

const HomeNavbar = () => {
    return (
        <nav className="home-navbar">
             <span className="logo">Mentorhub</span> 
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
           
        </nav>
    );
}

export default HomeNavbar;