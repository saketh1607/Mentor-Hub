import React from 'react';
import './home_styles.scss'; // Import SCSS file for styling

const HomeFooter = () => {
    return (
        <footer className="home-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h2>About Us</h2>
                    <p>About MentorHub

MentorHub is dedicated to fostering growth and development through personalized mentorship.
 Our platform connects individuals with experienced mentors across various fields, offering invaluable guidance and support.
  Whether you're a student, professional, or entrepreneur, MentorHub provides a supportive environment to learn, grow, and succeed.
   Join us in building a community where knowledge is shared, relationships are formed, and aspirations are realized.</p>
                </div>
                <div className="footer-section">
                    <h2>Contact Us</h2>
                    <p>Email: info@example.com</p>
                    <p>Phone: +1234567890</p>
                </div>
                <div className="footer-section">
                    <h2>Follow Us</h2>
                    <p>Stay connected with us on social media:</p>
                    <div className="social-links">
                        <a href="https://www.facebook.com/your-company" target="_blank"><i className="bi bi-facebook"></i></a>
                        <a href="https://twitter.com/your-company" target="_blank"><i className="bi bi-twitter-x"></i></a>
                        <a href="https://www.instagram.com/your-company" target="_blank"><i className="bi bi-instagram"></i></a>
                    </div>
                </div>
            </div>
            <div className="copyright">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default HomeFooter;