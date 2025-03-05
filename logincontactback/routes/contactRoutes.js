require("dotenv").config();

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const nodemailer = require("nodemailer");
const useragent = require("useragent");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const authenticateUser = require("../authMiddleware");

const router = express.Router();

const filePath = "messages.json";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 📩 API Route: Handle form submissions from frontend
router.post("/submit-form", authenticateUser, async (req, res) => {  // ✅ Changed `app.post` to `router.post`
    try {
        const { name, email, message, latitude, longitude, mobile } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Name, email, and message are required" });
        }

        const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const agent = useragent.parse(req.headers["user-agent"]);
        const deviceInfo = agent.os ? `${agent.toString()} (${agent.os.toString()})` : agent.toString();

        async function getUserLocation(ip) {
            try {
                const response = await axios.get(`http://ip-api.com/json/${ip}`);
                return response.data;
            } catch (error) {
                console.error("Error fetching IP info:", error.message);
                return null;
            }
        }

        const locationData = await getUserLocation(ip);

        if (!locationData) {
            return res.status(500).json({ error: "Network error. Please try again." });
        }

        const { city, region, country, isp, lat, lon, timezone, mobile: isMobile } = locationData;
        const connectionType = isMobile ? "Mobile" : "Wi-Fi";
        const finalLat = latitude || lat;
        const finalLon = longitude || lon;

        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: "davetechinnovation@gmail.com",
            subject: "New Contact Form Message",
            text: `You just received a new message:
            ------------------------------------
            👤 Name: ${name}
            📧 Email: ${email}
            📞 Mobile: ${mobile}
            ✉️ Message: ${message}

            🌐 IP Address: ${ip}
            📱 Device: ${deviceInfo}
            🏙 Location: ${city}, ${region}, ${country}
            📡 ISP: ${isp}
            🌍 Coordinates: Latitude ${finalLat}, Longitude ${finalLon}
            ⏰ Timezone: ${timezone}
            📶 Connection Type: ${connectionType}
            📅 Date: ${new Date().toISOString()}
            ------------------------------------`
        };

        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Message Has Been Received",
            text: `Hello ${name},

            Thank you for reaching out to us. We have received your message and will respond to you within 24 to 48 working hours.

            Here is a copy of your message:
            ------------------------------------
            ✉️ Message: ${message}
            ------------------------------------

            If you have any urgent concerns, feel free to contact us directly at ${process.env.EMAIL_USER}.

            Best regards,
            Dave Tech Innovation Team`
        };

        try {
            console.log("Sending admin email...");
            const adminEmail = await transporter.sendMail(adminMailOptions);
            console.log("Admin email sent:", adminEmail.response);

            console.log("Sending user email...");
            const userEmail = await transporter.sendMail(userMailOptions);
            console.log("User email sent:", userEmail.response);

            console.log("✅ Emails sent successfully!");

            // ✅ Send success response to frontend
            return res.status(200).json({
                message: "✅ Emails sent successfully! Expect a reply within 24-48 hours."
            });

        } catch (emailError) {
            console.error("❌ Error sending emails:", emailError);
            return res.status(500).json({ error: "❌ An error occurred while sending the message. Please try again later." });
        }

        const messages = await readMessagesFromFile(filePath);
        const newMessage = {
            name,
            email,
            mobile: mobile || "Not provided",
            message,
            ip,
            device: deviceInfo,
            location: `${city}, ${region}, ${country}`,
            isp,
            coordinates: { lat: finalLat, lon: finalLon },
            timezone,
            connection: connectionType,
            date: new Date().toISOString(),
        };

        messages.push(newMessage);
        await writeMessagesToFile(filePath, messages);

        return res.json({ success: "Message sent successfully! We have also sent you a confirmation email." });
    } catch (error) {
        console.error("❌ Error:", error.message);
        return res.status(500).json({ error: "An error occurred while sending the message. Please check your internet connection and try again." });
    }
});

module.exports = router;
