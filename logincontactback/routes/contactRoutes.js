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

router.post("/submit-form", authenticateUser, async (req, res) => {
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
                const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=02996533e20b4d17aa01e97790a00ee3&ip=${ip}`);
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

        const {
            ip: hostname,
            continent_code,
            continent_name,
            country_code2,
            country_code3,
            country_name,
            country_name_official,
            country_capital,
            state_prov,
            state_code,
            district,
            city,
            zipcode,
            latitude: lat,
            longitude: lon,
            is_eu,
            calling_code,
            country_tld,
            languages,
            country_flag,
            isp,
            connection_type,
            organization,
            asn,
            geoname_id,
            country_emoji,
            currency,
            time_zone,
            security,
            user_agent
        } = locationData;

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
            🏙 Location: ${city}, ${state_prov}, ${country_name}
            📡 ISP: ${isp}
            🌍 Coordinates: Latitude ${lat}, Longitude ${lon}
            ⏰ Timezone: ${time_zone.name} (UTC${time_zone.offset})
            📶 Connection Type: ${connection_type}
            📛 Organization: ${organization}
            🏳️ Country Code: ${country_code2} (${country_emoji})
            💰 Currency: ${currency.name} (${currency.symbol})
            🔒 Security Risk Score: ${security.threat_score}
            🏢 ASN: ${asn}
            🌍 Continent: ${continent_name} (${continent_code})
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
            await transporter.sendMail(adminMailOptions);
            console.log("Sending user email...");
            await transporter.sendMail(userMailOptions);
            console.log("✅ Emails sent successfully!");
            return res.status(200).json({ message: "✅ Emails sent successfully! Expect a reply within 24-48 hours." });
        } catch (emailError) {
            console.error("❌ Error sending emails:", emailError);
            return res.status(500).json({ error: "❌ An error occurred while sending the message. Please try again later." });
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
        return res.status(500).json({ error: "An error occurred while sending the message. Please check your internet connection and try again." });
    }
});

module.exports = router;
