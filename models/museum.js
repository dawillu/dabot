import getColors from 'get-image-colors';
import { EmbedBuilder } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { getMuseumChannel } from './museumConfig.js';

// Constants
const CONFIG_DIR = path.join(process.cwd(), 'configs');
const MUSEUM_ENTRIES_FILE = path.join(CONFIG_DIR, 'museumEntries.json');

// Create configs directory if it doesn't exist
await fs.mkdir(CONFIG_DIR, { recursive: true }).catch(() => {});

// Load museum entries
async function loadEntries() {
    try {
        const data = await fs.readFile(MUSEUM_ENTRIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        await fs.writeFile(MUSEUM_ENTRIES_FILE, '[]', 'utf8');
        return [];
    }
}

// Get next entry ID
async function getNextEntryId(guildId) {
    const entries = await loadEntries();
    const serverEntries = entries.filter(entry => entry.guildId === guildId);
    const lastEntry = serverEntries[serverEntries.length - 1];
    
    if (!lastEntry) return 1;
    return parseInt(lastEntry.id.replace('#', '')) + 1;
}

// Save new entry
async function saveEntry(entryData) {
    const entries = await loadEntries();
    entries.push(entryData);
    await fs.writeFile(MUSEUM_ENTRIES_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

// Save artwork to museum
export async function SaveToMuseum(message) {
    const attachment = message.attachments.first();
    const text = message.content.replace('.museum ', '').trim();

    if (!attachment) {
        return message.reply('❌ Please attach an image to your message!');
    }

    if (!attachment.contentType?.startsWith('image/')) {
        return message.reply('❌ Please attach a valid image file!');
    }

    try {
        const museumChannel = await getMuseumChannel(message.guild);
        
        if (!museumChannel) {
            return message.reply('❌ Museum channel not set! Use `.setMuseum` first.');
        }

        const colors = await getColors(attachment.url, { count: 1 });
        const dominantColor = colors[0].hex();
        const entryId = await getNextEntryId(message.guild.id);
        const formattedId = `#${String(entryId).padStart(4, '0')}`;

        const museumEmbed = new EmbedBuilder()
            .setColor(dominantColor)
            .setTitle(`${formattedId} - Museum Entry`)
            .setDescription(text || 'No description provided')
            .setImage(attachment.url)
            .addFields(
                { name: 'ID', value: formattedId, inline: true },
                { name: 'by', value: message.author.username, inline: true },
            )
            .setTimestamp();

        const sent = await museumChannel.send({ embeds: [museumEmbed] });
        
        await saveEntry({
            id: formattedId,
            guildId: message.guild.id,
            messageId: sent.id,
            authorId: message.author.id,
            imageUrl: attachment.url,
            description: text,
            dominantColor: dominantColor,
            timestamp: new Date().toISOString()
        });

        await message.reply(`✅ Successfully added to museum with ID: ${formattedId}`);

    } catch (error) {
        console.error('Error processing museum entry:', error);
        await message.reply('❌ Failed to process image or save to museum.');
    }
}