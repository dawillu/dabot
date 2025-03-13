import { Client, GatewayIntentBits } from "discord.js";
import 'dotenv/config';

// Core imports
import { AiRequest } from './models/ai.js';
import { GetForecast } from "./models/weather.js";
import { TranslateFromCode, TranslateToRequestedLanguage } from "./models/translate.js";
import { SaveToMuseum } from './models/museum.js';
import { ShowHelp } from './models/help.js';
import { setMuseumChannel } from './models/museumConfig.js';
import { GetBibleVerse } from './models/bible.js';
import { setBibleChannel, scheduleDailyVerse } from './models/bibleConfig.js';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, 
              GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent]
});

// Command handlers
const commands = {
    '.ai': AiRequest,
    '.weather': GetForecast,
    '.w': GetForecast,
    '.t': TranslateToRequestedLanguage,
    '.setMuseum': setMuseumChannel,
    '.sm': setMuseumChannel,
    '.museum': SaveToMuseum,
    '.m': SaveToMuseum,
    '.h': ShowHelp,
    '.help': ShowHelp,
    '.setBible': setBibleChannel,
    '.sb': setBibleChannel,
    '.bible': GetBibleVerse,
    '.b': GetBibleVerse
};

// Bot startup
client.on("ready", () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    scheduleDailyVerse(client);
});

// Message handler
client.on("messageCreate", async (message) => {
    try {
        if (message.author.bot) return;
        const command = Object.entries(commands)
            .find(([prefix]) => message.content.startsWith(prefix));
        if (command) {
            const [_, handler] = command;
            await handler(message);
        }
    } catch (error) {
        console.error('Error:', error);
        await message.reply('❌ Command failed');
    }
});

// Translation reactions
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.content) {
        await TranslateFromCode(reaction.message, reaction.emoji.name);
    }
});

client.login(process.env.BOT_TOKEN);
