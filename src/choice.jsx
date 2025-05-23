// Choice.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import "./style.scss";
import imageSrc from "./img/image.png";

function Choice() {
  return (
    <div className="choice-container">
      <h1>Choose Your Role</h1>
      <div className="content-wrapper">
        <div className="image-wrapper">
        <img src={imageSrc} alt="Description of the image" />
        </div>
        <div className="options-wrapper">
          <Link to="/menties/login">
            <button>Menties</button>
          </Link>
          <Link to="/mentors/login">
            <button>Mentors</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Choice;
