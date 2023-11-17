# Gmail Bot using Node.js

## Description

This repository contains the Gmail Bot, a Node.js application leveraging Google APIs. It's designed to automatically respond to emails received in a Gmail account, particularly useful when you are on vacation or unavailable.

## Features

- *Automatic Email Response*: Sends replies to emails that have not been previously answered.
- *Label Management*: Adds a label to emails and moves them to this label.
- *Random Interval Checks*: Checks for new emails at random intervals between 45 to 120 seconds.
- *OAuth 2.0 Authentication*: Securely authenticates with Gmail using OAuth 2.0.
- *Node.js Clusters Support*: Enhances performance and load handling.

## Libraries

- `googleapis`: Provides functionality for interacting with various Google APIs, including Gmail.
- `OAuth2`: Handles authentication and access token generation for Gmail API.

## Getting Started

### Setting Up OAuth 2.0 Authentication

1. *Create a Google Cloud Project*: Go to [Google Cloud Console](https://console.developers.google.com), create a new project, and enable the Gmail API.
2. *Generate OAuth Credentials*: Create OAuth client ID credentials. Set the application type to "Web application" and note the client ID and secret.
3. *Configure OAuth Playground*: Use the [OAuth Playground](https://developers.google.com/oauthplayground) to generate a refresh token using your client ID and secret.

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/dhiraj0911/gmail-bot.git

2. ```bash
   npm install

3. Start the application
   ```bash
   node index.js
