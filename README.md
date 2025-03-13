# dabot - Discord Assistant Bot

A versatile Discord bot featuring Bible verses, games, AI chat, and more.

## Features

### Core Commands
- `.ai` - Chat with AI assistant
- `.w` - Get weather forecast
- `.t` - Translate text

### Bible Features
- `.b` - Get Bible verses (KJV/CUV)
  - Random verses
  - Category-based verses
  - Specific verse lookup
  - Supports verse ranges
- `.bs` - Set Bible channel

### Games & Credits
- `.s` - Play slots (bet 10-1000 credits)
- `.g` - Bible word guessing game
- `.c` - Check credit balance

### Museum
- `.m` - Save content to museum
- `.ms` - Set museum channel

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

3. Create a `.env` file:
```env
DISCORD_TOKEN=your_token_here
OPENAI_API_KEY=your_key_here
WEATHER_API_KEY=your_key_here
```

4. Start the bot:
```bash
npm start
```

## Configuration

### Bible Verses
- Create `data/verses.json` for custom verse categories
- Set Bible channel with `.bs #channel`

### Museum
- Set museum channel with `.ms #channel`

## Credits System
- Start with 1000 credits
- Win credits in Bible game
- Bet credits in slots
- Win multipliers: up to 10x

## Help
Use `.h` for general help or `.h <command>` for specific command help.

## Dependencies
- discord.js
- node-fetch
- dotenv
- openai

## License
MIT License

## Contributing
1. Fork the repository
2. Create feature branch
3. Submit pull request
