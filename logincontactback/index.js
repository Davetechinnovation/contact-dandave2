require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");


const app = express(); // ✅ Define app

const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.json());
app.use(
  cors({
    origin: "https://contact-dandave.netlify.app", // Allow requests from this origin
    credentials: true, // Allow credentials (e.g., cookies)
    methods: ["GET", "POST", "OPTIONS"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  })
);

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");

// ✅ Use Routes
app.use("/auth", authRoutes);
app.use("/contact", contactRoutes);

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
