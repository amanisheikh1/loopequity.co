const { google } = require("googleapis");
const readline = require("readline");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

function getAccessToken() {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });
    console.log("Authorize this app by visiting this URL:", authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question("Enter the code from that page here: ", (code) => {
        rl.close();
        oauth2Client.getToken(code, (err, token) => {
            if (err) return console.error("Error retrieving access token", err);
            console.log("Your refresh token is:", token.refresh_token);
        });
    });
}

getAccessToken();
