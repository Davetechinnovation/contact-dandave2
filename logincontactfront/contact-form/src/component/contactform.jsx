import React, { useState, useEffect } from "react"; // Import React and some tools (useState and useEffect) to manage the app.
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom"; // Import a tool to help move between pages (like a GPS for the app).
import CoolAlert from "./CoolAlert"; // Import a custom alert box to show messages.
import "../styles/contactform.css"; // Import the styling for this page.

function ContactForm() {
  // Create a state to store the form data (name, email, message).
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  // Create a state to track if the form is being submitted (loading).
  const [loading, setLoading] = useState(false);

  // Create a state to store success or error messages.
  const [successMessage, setSuccessMessage] = useState("");

  // Create a state to track if the user is being redirected to another page.
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Create a state to track if the user is logged in.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Create a state to store alert messages (like "Logged out successfully").
  const [alertMessage, setAlertMessage] = useState("");

  // Create a state to control whether the alert is shown or hidden.
  const [showAlert, setShowAlert] = useState(false);

  // Create a state to store the logged-in user's username.
  const [username, setUsername] = useState("");

  // Create a navigation tool to move between pages.
  const navigate = useNavigate();

  // When the page loads, check if the user is logged in and fetch their username.
  useEffect(() => {
    const token = localStorage.getItem("token"); // Check if there's a token in the browser's storage.
    if (token) {
      setIsLoggedIn(true); // If there's a token, the user is logged in.
      fetchUserProfile(token); // Fetch the user's profile to get their username.
    }
  }, []);

  // Function to fetch the user's profile and get their username.
  const fetchUserProfile = async (token) => {
    try {
      // Send a request to the server to get the user's profile.
      const response = await fetch("https://contact-dandave.onrender.com/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token to prove the user is logged in.
        },
      });

      // Check if the server responded with an error.
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Convert the server's response to JSON (a readable format).
      const data = await response.json();

      // If the username is in the response, save it in the state.
      if (data.username) {
        setUsername(data.username);
      }
    } catch (error) {
      // If something goes wrong, log the error to the console.
      console.error("Error fetching user profile:", error);
    }
  };

  // Function to handle user logout.
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from the browser's storage.
    setIsLoggedIn(false); // Mark the user as logged out.
    setUsername(""); // Clear the username.

    // Show a cool alert message.
    setAlertMessage(`👋 ${username} you have successfully Logged out! `);
    setShowAlert(true);

    // After 2 seconds, redirect the user to the login page.
    setTimeout(() => {
      navigate("/"); // Use the GPS to go to the login page.
    }, 2000);
  };

  // Function to handle changes in the form inputs (like typing in a box).
  const handleChange = (e) => {
    // Update the form data with the new value from the input.
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle form submission (when the user clicks "Send Message").
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Retrieve the token from localStorage
    const token = localStorage.getItem("token");
    console.log("Token:", token); // Debugging: Log the token
  
    if (!token) {
      setSuccessMessage("❌ You must be logged in to send a message. Please login.");
      setLoading(false);
      setIsRedirecting(true);
      setTimeout(() => {
        navigate("/auth");
      }, 2500);
      return;
    }
  
    try {
      console.log("Form Data:", formData);
  
      // ✅ Send form data to backend
      const response = await fetch("https://contact-dandave.onrender.com/submit-form", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the token in the header
          },
          body: JSON.stringify(formData),
      });
  
      // ✅ Parse response
      const data = await response.json();
      console.log("Response:", data);
  
      if (response.ok) {
        setSuccessMessage("✅ Message sent successfully! Expect a reply within 24 - 48 working hours! Also, check your email or spam folder for a confirmation message. Thank you! 😊");
        setFormData({ name: "", email: "", message: "" });
  
          // Reload page after 12 seconds
          setTimeout(() => {
              setSuccessMessage("");
              window.location.reload();
          }, 12000);
      } else {
          // ✅ Ensure correct error is shown
          setSuccessMessage(data.error || "❌ Failed to send message. Please check your connection and try again.");
  
          // Hide message after 12 seconds
          setTimeout(() => {
              setSuccessMessage("");
          }, 12000);
      }
  } catch (error) {
      console.error("❌ Error:", error);
      setSuccessMessage("❌ Failed to connect to the server. Please check your connection and try again.");
  
      setTimeout(() => {
          setSuccessMessage("");
      }, 12000);
  }
  
  setLoading(false);
  };  

  

  return (
    <div className="containercontact">
      {/* Cool Alert */}
      {showAlert && ( // If showAlert is true, show the CoolAlert component.
        <CoolAlert
          message={alertMessage} // Pass the alert message to the CoolAlert.
          onClose={() => setShowAlert(false)} // When the alert is closed, hide it.
        />
      )}

      <div className="contact">
        <div className="logout" style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center"}}>
          {/* Logout Link */}
          {isLoggedIn && ( // If the user is logged in, show the logout link.
            <p style={{ textAlign: "right", marginBottom: "10px" }}>
              <a href="#" onClick={handleLogout} style={{ color: "red", textDecoration: "none" }}>
                Logout
              </a>
            </p>
          )}

          {/* Welcome Message */}
          {isLoggedIn && username && ( // If the user is logged in and has a username, show the welcome message.
            <h2 style={{ textAlign: "center", marginBottom: "20px", color: "blue", fontStyle: "italic" }}>Welcome back, {username}! 😊</h2>
          )}
        </div>

        <h2>Contact us</h2>
        <p>Note: Any email provided below will be used to reply to your message. Ensure you provide a valid and functional email.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name e.g Dandave"
            value={formData.name}
            onChange={handleChange} // Update the form data when the user types.
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email e.g dandave@gmail.com"
            value={formData.email}
            onChange={handleChange} // Update the form data when the user types.
            required
          />
          <textarea
            name="message"
            placeholder="Your Message eg hello i have a complaint"
            value={formData.message}
            onChange={handleChange} // Update the form data when the user types.
            required
          ></textarea>

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"} {/* Show "Sending..." if the form is being submitted. */}
          </button>

          {/* Show the "Login/Signup" link only if the user is NOT logged in */}
          {!isLoggedIn && ( // If the user is NOT logged in, show the link.
            <p style={{ textAlign: "right" }}>
             <Link to="/auth">Login/Signup</Link>
            </p>
          )}
        </form>

        {/* Success or error message */}
        {successMessage && ( // If there's a success or error message, show it.
          <p style={{ color: successMessage.includes("✅") ? "green" : "red", marginTop: "10px" }}>
            {successMessage}
          </p>
        )}

        {/* Redirecting message */}
        {isRedirecting && <p>Redirecting to login page...</p>} {/* If redirecting, show a message. */}
      </div>
    </div>
  );
}

export default ContactForm; 