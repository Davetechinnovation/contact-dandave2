const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const fs = require("fs");

const router = express.Router();

// ✅ Load JWT Secret
const jwtSecret = process.env.JWT_SECRET || "your-very-secret-key";
console.log("🔑 JWT_SECRET Loaded:", jwtSecret);

// ✅ Ensure 'data' folder exists for SQLite
if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}

// ✅ Initialize SQLite Database
const db = new sqlite3.Database("./data/users.db", (err) => {
  if (err) {
    console.error("❌ Error connecting to SQLite:", err.message);
  } else {
    console.log("✅ Connected to SQLite database.");
  }
});

// ✅ Create Users Table if Not Exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// ✅ JWT Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("🛡️ Received Token:", token); // Debugging

  if (!token) {
    return res.status(401).json({ message: "🚫 Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("❌ JWT Verification Error:", err.message);
    return res.status(401).json({ message: "⏳ Invalid or expired token" });
  }
};

// ✅ Signup Route
router.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "⚠️ All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "✉️ Invalid email format" });
  }

  // Check if username or email already exists
  db.get(
    `SELECT * FROM users WHERE email = ? OR username = ?`,
    [email, username],
    (err, existingUser) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "⚠️ Database error" });
      }
      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === email
              ? "📧 Email is already registered"
              : "👤 Username is already taken",
        });
      }

      // Hash the password before storing it
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err || !hashedPassword) {
          console.error("🔒 Bcrypt Error:", err.message);
          return res.status(500).json({ message: "🔒 Error hashing password" });
        }

        // Insert new user into database
        db.run(
          `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
          [username, email, hashedPassword],
          function (err) {
            if (err) {
              console.error("SQLite Insert Error:", err.message);
              return res.status(400).json({ message: "⚠️ Unable to create user" });
            }
            res.status(201).json({ message: "✅ User created successfully" });
          }
        );
      });
    }
  );
});

// ✅ Login Route
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "⚠️ All fields are required" });
  }

  // Find user by email or username
  db.get(
    `SELECT * FROM users WHERE email = ? OR username = ?`,
    [identifier, identifier],
    (err, user) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "⚠️ Database error" });
      }
      if (!user) {
        return res.status(400).json({ message: "❌ No account found with this email or username" });
      }

      // Compare passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error("Bcrypt Compare Error:", err.message);
          return res.status(500).json({ message: "⚠️ Error verifying password" });
        }
        if (!isMatch) {
          return res.status(400).json({ message: "🔑 Incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "1h" });
        res.status(200).json({ token, username: user.username, message: "✅ Login successful" });
      });
    }
  );
});

// ✅ Protected Profile Route
router.get("/profile", authMiddleware, (req, res) => {
  db.get(
    `SELECT username, email FROM users WHERE id = ?`,
    [req.userId],
    (err, user) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "⚠️ Database error" });
      }
      if (!user) {
        return res.status(404).json({ message: "❌ User not found" });
      }
      res.status(200).json(user);
    }
  );
});

// ✅ Export Router
module.exports = router;
