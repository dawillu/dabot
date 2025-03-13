# dabot - Discord Assistant Bot

A versatile Discord bot featuring AI chat, weather updates, translations, museum gallery, and daily Bible verses.

## Features

### 🤖 Core Commands
- `.ai` - AI chat assistant powered by GPT
- `.weather` (`.w`) - Get weather forecasts for any location
- `.t` - Translate text using commands or flag reactions

### 🎨 Museum Gallery
- `.museum` (`.m`) - Save images to gallery channel
- `.setMuseum` (`.sm`) - Set up museum gallery channel

### 📖 Bible System
- `.bible` (`.b`) - Share Bible verses by category
- `.setBible` (`.sb`) - Configure Bible verse channel
- Daily verse scheduler

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dabot.git
cd dabot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with required tokens:
```env
# Discord Bot Token
BOT_TOKEN=your_discord_bot_token

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

4. Start the bot:
```bash
node index.js
```

## Translation System

### Using Commands
```
.t spanish Hello World
```

### Using Flag Reactions
React with country flags to translate messages:
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇯🇵 Japanese
- (50+ languages supported)

## Bible Categories
Available categories for `.bible`:
- love
- peace
- wisdom
- hope
- inspiration
- strength
- grace
- faith
- joy
- forgiveness

## Requirements

- Node.js v16.9.0 or higher
- Discord.js v14
- Environment variables:
  - `BOT_TOKEN` - Discord Bot Token
  - `GEMINI_API_KEY` - Google Gemini API Key

## Getting API Keys

### Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to the Bot section
4. Click "Reset Token" to get your bot token

### Google Gemini API
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click "Get API key"
3. Create a new project or select existing
4. Copy your API key

> **Note**: Keep your API keys secure and never commit them to version control

## Commands

| Command | Description | Usage | Admin |
|---------|-------------|--------|-------|
| `.ai` | AI chat assistant | `.ai <question>` | No |
| `.weather` | Get weather forecast | `.weather <city>` | No |
| `.t` | Translate text | `.t <language> <text>` | No |
| `.museum` | Save to gallery | `.museum <description>` | No |
| `.setMuseum` | Set museum channel | `.sm [#channel]` | Yes |
| `.bible` | Share Bible verse | `.bible [category]` | No |
| `.setBible` | Set Bible channel | `.setBible [#channel]` | Yes |
| `.help` | Show all commands | `.help [command]` | No |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.