import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_DIR = path.join(process.cwd(), 'configs');
const MUSEUM_CONFIG_FILE = path.join(CONFIG_DIR, 'museumConfig.json');

// Create configs directory if it doesn't exist
await fs.mkdir(CONFIG_DIR, { recursive: true }).catch(() => {});

async function loadMuseumConfig() {
    try {
        const data = await fs.readFile(MUSEUM_CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist, create it with empty config
        await fs.writeFile(MUSEUM_CONFIG_FILE, '{}', 'utf8');
        return {};
    }
}

async function saveMuseumConfig(guildId, channelId) {
    try {
        let config = await loadMuseumConfig();
        // Ensure config is an object
        config = typeof config === 'object' ? config : {};
        config[guildId] = channelId;
        await fs.writeFile(MUSEUM_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving museum config:', err);
        return false;
    }
}

export async function getMuseumChannel(guild) {
    try {
        const config = await loadMuseumConfig();
        const channelId = config[guild.id];
        
        if (!channelId) {
            return null;
        }

        return await guild.channels.fetch(channelId);
    } catch (err) {
        console.error('Error getting museum channel:', err);
        return null;
    }
}

export async function setMuseumChannel(message) {
    // Check if user has administrator permissions
    if (!message.member.permissions.has("Administrator")) {
        await message.reply("❌ You need administrator permissions to use this command.");
        return;
    }

    // Get channel from mention or use current channel
    const channel = message.mentions.channels.first() || message.channel;
    const guildId = message.guild.id;

    try {
        // Get current config
        const currentConfig = await loadMuseumConfig();
        const currentChannelId = currentConfig[guildId];

        // Check if trying to set the same channel
        if (currentChannelId === channel.id) {
            await message.reply("❌ This channel is already set as the museum channel!");
            return;
        }

        // Save new configuration
        const success = await saveMuseumConfig(guildId, channel.id);
        
        if (success) {
            const response = currentChannelId 
                ? `✅ Museum channel changed from <#${currentChannelId}> to <#${channel.id}>`
                : `✅ Museum channel set to <#${channel.id}>`;
            await message.reply(response);
            console.log(`Museum channel ${currentChannelId ? 'changed to' : 'set to'} ${channel.id} for server ${guildId}`);
        } else {
            throw new Error('Failed to save configuration');
        }
    } catch (error) {
        console.error('Error updating museum channel:', error);
        await message.reply("❌ Failed to update museum channel configuration!");
    }
}

export { loadMuseumConfig };