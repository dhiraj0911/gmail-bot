// Import necessary modules from the 'googleapis' library
const { google } = require("googleapis");
// Import dotenv to load environment variables from a .env file
require('dotenv').config();
// Load environment variables
const {
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI,
  REFRESH_TOKEN,
} = process.env;

// Create an OAuth2 client using the provided credentials
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);

// Set the OAuth2 client's credentials using the refresh token
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Create a Set to store email addresses of users who have already been replied to
const repliedUsers = new Set();

// Define an asynchronous function to check unread emails and send automated replies
async function checkEmailsAndSendReplies() {
  try {
    // Create a Gmail API client using the OAuth2 client
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Retrieve a list of unread messages from the user's Gmail inbox
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
    });
    const messages = res.data.messages;

    // If there are unread messages, iterate through each message
    if (messages && messages.length > 0) {
      for (const message of messages) {
        // Retrieve the full email details using the message ID
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });

        // Extract important email headers (From, To, Subject)
        const from = email.data.payload.headers.find(
          (header) => header.name === "From"
        );
        const toHeader = email.data.payload.headers.find(
          (header) => header.name === "To"
        );
        const Subject = email.data.payload.headers.find(
          (header) => header.name === "Subject"
        );
        const From = from.value;
        const toEmail = toHeader.value;
        const subject = Subject.value;

        // Log the details of the received email
        console.log("email come From", From);
        console.log("to Email", toEmail);

        // Check if the user has already been replied to, and skip if true
        if (repliedUsers.has(From)) {
          console.log("Already replied to: ", From);
          continue;
        }

        // Retrieve the entire email thread to check for existing replies
        const thread = await gmail.users.threads.get({
          userId: "me",
          id: message.threadId,
        });

        // Extract replies from the email thread (excluding the original message)
        const replies = thread.data.messages.slice(1);

        // If there are no existing replies, send an automated reply
        if (replies.length === 0) {
          // Send a reply email
          await gmail.users.messages.send({
            userId: "me",
            requestBody: {
              raw: await createReplyRaw(toEmail, From, subject),
            },
          });

          // Add a label "Vacation-Mail" to the original email
          const labelName = "Vacation-Mail";
          await gmail.users.messages.modify({
            userId: "me",
            id: message.id,
            requestBody: {
              addLabelIds: [await createLabelIfNeeded(labelName)],
            },
          });

          // Log that a reply has been sent
          console.log("Sent reply to email:", From);

          // Add the user to the repliedUsers set to avoid replying again
          repliedUsers.add(From);
        }
      }
    }
  } catch (error) {
    // Log any errors that occur during the process
    console.error("Error occurred:", error);
  }
}

// Define an asynchronous function to create the raw content for the automated reply
async function createReplyRaw(from, to, subject) {
  const emailContent = `From: ${from}\nTo: ${to}\nSubject: ${subject}\n\nThank you for your messaage. I'am currently on vacation with limited access to my emails. I will reply to you as soon as possible.\n\nBest regards, \nDhiraj`;
  const base64EncodedEmail = Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return base64EncodedEmail;
}

// Define an asynchronous function to create a Gmail label if it doesn't exist
async function createLabelIfNeeded(labelName) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  // Retrieve the list of existing labels
  const res = await gmail.users.labels.list({ userId: "me" });
  const labels = res.data.labels;

  // Check if the desired label already exists, and return its ID if true
  const existingLabel = labels.find((label) => label.name === labelName);
  if (existingLabel) {
    return existingLabel.id;
  }

  // If the label doesn't exist, create a new label and return its ID
  const newLabel = await gmail.users.labels.create({
    userId: "me",
    requestBody: {
      name: labelName,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });

  return newLabel.data.id;
}

// Define a function to generate a random interval between min and max values
function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Set up an interval to run the email checking function at random intervals
setInterval(checkEmailsAndSendReplies, getRandomInterval(45, 120) * 1000);
