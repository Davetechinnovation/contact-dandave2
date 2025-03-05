import axios from "axios";

const API_URL = "http://localhost:5000"; // Replace with your backend URL

// Register a new user
export const register = async (username, email, password) => {
  const response = await axios.post(`${API_URL}/signup`, {
    username,
    email,
    password,
  });
  return response.data;
};

// Login user
export const login = async (username, email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    username,
    email,
    password,
  });
  return response.data;
};

// Get user profile (protected route)
export const getProfile = async (token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};