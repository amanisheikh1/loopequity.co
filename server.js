const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Endpoint for handling form submission
app.post("/submit", async (req, res) => {
    const { email, firstName } = req.body;

    try {
        // Logic to send email using Gmail API
        await sendEmail(email, firstName);
        res.status(200).send("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Failed to send email.");
    }
});

// Send email function
async function sendEmail(recipientEmail, recipientName) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const emailContent = `
        To: ${recipientEmail}
        Subject: Your Growth Ceiling Calculator
        
        Hi ${recipientName},

        Here’s the link to download your Growth Ceiling Calculator:
        https://docs.google.com/spreadsheets/d/1ZDZ9upLWqttyeiUs4VimnkhqmxEhXDczFK6BDDobx_E/edit?usp=sharing

        Best regards,
        Amani
    `;

    const encodedMessage = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage,
        },
    });
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// const cors = require("cors");
// app.use(cors());
