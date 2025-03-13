import { Client, GatewayIntentBits } from "discord.js";
import 'dotenv/config';

// Core imports from models
import { AiRequest } from './models/ai.js';
import { GetForecast } from "./models/weather.js";
import { TranslateFromCode, TranslateToRequestedLanguage } from "./models/translate.js";
import { SaveToMuseum } from './models/museum.js';
import { ShowHelp } from './models/help.js';
import { setMuseumChannel } from './models/museumConfig.js';
import { GetBibleVerse } from './models/bible.js';
import { setBibleChannel } from './models/bibleConfig.js';
import { PlaySlots } from './models/slots.js';
import { PlayBibleGame } from './models/bibleGame.js';
import { CheckCredits } from './models/credits.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent
    ]
});

// Command handlers
const commands = {
    // Essential commands
    '.ai': AiRequest,
    '.assistant': AiRequest,
    '.weather': GetForecast,
    '.w': GetForecast,
    '.translate': TranslateToRequestedLanguage,
    '.t': TranslateToRequestedLanguage,
    
    // Museum commands
    '.museum': SaveToMuseum,
    '.m': SaveToMuseum,
    '.setmuseum': setMuseumChannel,
    '.ms': setMuseumChannel,
    
    // Bible commands
    '.bible': GetBibleVerse,
    '.b': GetBibleVerse,
    '.setbible': setBibleChannel,
    '.bs': setBibleChannel,
    
    // Games & Credits
    '.slot': PlaySlots,
    '.s': PlaySlots,
    '.game': PlayBibleGame,
    '.g': PlayBibleGame,
    '.credits': CheckCredits,
    '.c': CheckCredits,
    '.balance': CheckCredits,
    
    // Help
    '.help': ShowHelp,
    '.h': ShowHelp
};

// Bot startup
client.on("ready", () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Message handler
client.on("messageCreate", async (message) => {
    try {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Get the full command word (first word after prefix)
        const args = message.content.trim().split(/\s+/);
        const fullCommand = args[0].toLowerCase();

        // Find command prefix
        const command = Object.entries(commands)
            .find(([prefix]) => prefix === fullCommand);

        if (command) {
            const [_, handler] = command;
            await handler(message);
        }
    } catch (error) {
        console.error('command failed:', error);
        await message.reply('❌ opsie command failed');
    }
});

// Translation reactions (flag emojis)
client.on('messageReactionAdd', async (reaction, user) => {
    // ignore bot reactions
    if (user.bot) return;

    // ignore reactions not on messages
    if (!reaction.message) return;

    // ignore reactions not on messages with content
    if (reaction.message.content) {
        await TranslateFromCode(reaction.message, reaction.emoji.name);
    }
});

// Login to Discord
client.login(process.env.BOT_TOKEN);
