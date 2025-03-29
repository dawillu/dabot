# dabot - Discord Assistant Bot

dabot is a versatile Discord bot that provides various utilities and fun features for your server, including AI chat assistance, Bible verse lookup, games, translation services, and more.

## Features Overview

### 🤖 AI Assistant
- `.ai` or `.assistant` - Ask any question to get AI-powered responses
- Powered by Google's Gemini 1.5 Flash model
- Example: `.ai What are the planets in our solar system?`

### 📖 Bible Features
- `.b` or `.bible` - Get Bible verses by category or reference
- Categories include love, peace, wisdom, hope, faith, and more
- Example: `.b love` or `.b john 3:16`
- `.bs` - Set a dedicated Bible channel
- `.g` or `.game` - Bible word guessing game that rewards credits

### 🎮 Games & Credits System
- `.s` or `.slot` - Play slots with your credits
- `.g` or `.game` - Bible word guessing game
- `.c` or `.credits` - Check your credit balance
- Win credits through games to spend on slots

### 🗣️ Translation
- `.t` or `.translate` - Translate text to specified languages
- Example: `.t spanish Hello world`
- React with country flag emojis to translate messages

### ☁️ Weather
- `.w` or `.weather` - Get weather forecast for any city
- Shows current conditions and forecast for next day
- Example: `.w London`

### 🖼️ Museum
- `.m` or `.museum` - Save images to a museum channel
- `.ms` or `.setmuseum` - Configure the museum channel

## Setup Instructions

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your bot token and API keys:
   ```
   BOT_TOKEN=your_discord_bot_token_here
   GOOGLE_API_KEY=your_google_api_key_here
   ```
4. Start the bot with `npm start`

## Configuration

### Channel Setup
- Set Bible channel: `.bs #channel-name`
- Set Museum channel: `.ms #channel-name`

## Help Commands

- `.h` or `.help` - Show full command list
- `.h <command>` - Get detailed help for a specific command

## Repository Structure
- `models/` - Contains modular functionality for each feature
- `data/` - Stores verse categories and user credits
- `configs/` - Holds server-specific configuration

## Credits System

Start with 1000 credits and earn more through:
- Bible word game (100 points + speed bonus)
- Slots with multipliers up to 10x your bet

## License
This project is licensed under the [MIT License](LICENSE).
