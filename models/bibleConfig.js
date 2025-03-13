import { promises as fs } from 'fs';
import path from 'path';
import cron from 'node-cron';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { getRandomVerse } from './bible.js';

const CONFIG_DIR = path.join(process.cwd(), 'configs');
const BIBLE_CONFIG_FILE = path.join(CONFIG_DIR, 'bibleConfig.json');

// Create configs directory if it doesn't exist
await fs.mkdir(CONFIG_DIR, { recursive: true }).catch(() => {});

async function loadBibleConfig() {
    try {
        const data = await fs.readFile(BIBLE_CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        await fs.writeFile(BIBLE_CONFIG_FILE, '{}', 'utf8');
        return {};
    }
}

export async function getBibleChannel(guild) {
    try {
        const config = await loadBibleConfig();
        const channelId = config[guild.id];
        
        if (!channelId) {
            return null;
        }
        return await guild.channels.fetch(channelId);
    } catch (err) {
        console.error('Error getting bible channel:', err);
        return null;
    }
}

export async function setBibleChannel(message) {
    if (!message.member.permissions.has("Administrator")) {
        await message.reply("❌ You need administrator permissions to use this command.");
        return;
    }

    const channel = message.mentions.channels.first() || message.channel;
    const guildId = message.guild.id;

    try {
        const config = await loadBibleConfig();
        config[guildId] = channel.id;
        await fs.writeFile(BIBLE_CONFIG_FILE, JSON.stringify(config, null, 2));
        await message.reply(`✅ Bible verse channel set to ${channel}`);
    } catch (error) {
        console.error('Error setting bible channel:', error);
        await message.reply('❌ Failed to set bible verse channel.');
    }
}