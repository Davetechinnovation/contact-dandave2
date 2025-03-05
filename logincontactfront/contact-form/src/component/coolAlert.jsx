import React, { useEffect } from "react";
import "../styles/CoolAlert.css"; // Add styles for the alert

const CoolAlert = ({ message, onClose }) => {
  useEffect(() => {
    // Automatically close the alert after 2 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer); // Cleanup timer
  }, [onClose]);

  return (
    <div className="cool-alert">
      <div className="cool-alert-content">
        <span role="img" aria-label="emoji">
          🎉
        </span>{" "}
        {message}
      </div>
    </div>
  );
};

export default CoolAlert;