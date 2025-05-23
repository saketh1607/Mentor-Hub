import React from 'react';
import { Link } from 'react-router-dom';
import './home_styles.scss';
import imageSrc from './img/body.png';

const HomeBody = () => {
    return (
        <div className="home-body">
            <div className="left-content">
                <h1>Welcome to MentorHub</h1>
                <p>Your gateway to transformative mentorship. Discover tailored connections with experienced mentors eager to guide you. Whether you're seeking career insights or personal development, MentorHub is here to empower your journey.</p>
                <div className="button-container">
                    <Link to="/choice">
                        <button style={{ width: '180px', height: '50px' }}>Get Started</button>
                    </Link>
                </div>
            </div>
            <div className="right-content">
                <img src={imageSrc} alt="Description of the image" className="swing" /> {/* Apply animation class */}
            </div>
        </div>
    );
}

export default HomeBody;
