import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const [imageLoading, setImageLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleExpand = () => {
    setExpanded(true);
  };

  const handleClose = (e) => {
    // Only close if the overlay itself is clicked, not the image
    if (e.target.className === "image-modal-overlay") {
      setExpanded(false);
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={`message ${message.senderId === currentUser.uid && "owner"}`}
      >
        <div className="messageInfo">
          <img
            src={
              message.senderId === currentUser.uid
                ? currentUser.photoURL
                : data.user.photoURL
            }
            alt=""
          />
          <span>just now</span>
        </div>
        <div className="messageContent">
          <p>{message.text}</p>
          {message.img && (
            <div className="image-container">
              {imageLoading && (
                <div className="image-loading">
                  <div className="spinner"></div>
                </div>
              )}
              <img
                src={message.img}
                alt=""
                onLoad={handleImageLoad}
                style={{ display: imageLoading ? 'none' : 'block', cursor: 'pointer' }}
                onClick={handleExpand}
              />
            </div>
          )}
        </div>
      </div>
      {expanded && (
        <div className="image-modal-overlay" onClick={handleClose}>
          <div className="image-modal-content">
            <span className="image-modal-close" onClick={() => setExpanded(false)}>&times;</span>
            <img src={message.img} alt="Expanded" />
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
