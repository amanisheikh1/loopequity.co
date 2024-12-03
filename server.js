const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.post("/submit", async (req, res) => {
    console.log("Request body received:", req.body);

    const { email, firstName } = req.body;

    if (!email || !firstName) {
        return res.status(400).send("Email and first name are required.");
    }

    try {
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

    // Set OAuth2 credentials
    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Construct email content
    const emailContent = `
        To: ${recipientEmail}
        Subject: Your Growth Ceiling Calculator
        
        Hi ${recipientName},

        Here’s the link to download your Growth Ceiling Calculator:
        https://docs.google.com/spreadsheets/d/1ZDZ9upLWqttyeiUs4VimnkhqmxEhXDczFK6BDDobx_E/edit?usp=sharing

        Best regards,
        Amani
    `;

    // Encode the email content in Base64 URL-safe format
    const encodedMessage = Buffer.from(emailContent)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    try {
        // Send the email
        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });
        console.log(`Email sent to ${recipientEmail}`);
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error; // Rethrow error for the calling function to handle
    }
}

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
