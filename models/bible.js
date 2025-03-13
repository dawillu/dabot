import { EmbedBuilder } from 'discord.js';
import { getBibleChannel } from './bibleConfig.js';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';

// Constants
const BIBLE_API_URL = 'https://bible-api.com/';
const VERSES_FILE = path.join(process.cwd(), 'models', 'data', 'verses.json');

// Helper function to get random item from array
function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Load verses from JSON
async function loadVerses() {
    try {
        const data = await fs.readFile(VERSES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading verses:', err);
        return {
            "default": ["john 3:16", "psalm 23:1", "genesis 1:1"]
        };
    }
}

// Get random verse by category
export async function getRandomVerse(category = '') {
    const verses = await loadVerses();
    return category && verses[category]
        ? randomFrom(verses[category])
        : randomFrom(Object.values(verses).flat());
}

// Handle Bible verse requests
export async function GetBibleVerse(message) {
    try {
        const bibleChannel = await getBibleChannel(message.guild);
        
        if (!bibleChannel) {
            return message.reply('❌ Bible verse channel not set! Use `.setBible` first.');
        }

        // Parse command for category or specific verse
        const commandParts = message.content.replace(/^\.(?:bible|b)\s*/, '').trim().toLowerCase();
        let verse;
        let category = '';

        if (!commandParts) {
            // No parameters - get random verse
            verse = await getRandomVerse();
        } else if ((await loadVerses())[commandParts]) {
            // Category specified
            verse = await getRandomVerse(commandParts);
            category = commandParts;
        } else {
            // Specific verse requested
            verse = commandParts;
        }

        // Fetch verse from API
        const response = await fetch(`${BIBLE_API_URL}${encodeURIComponent(verse)}`);
        const data = await response.json();

        if (!data.text) {
            return message.reply('❌ Verse not found. Please check the reference.');
        }

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`📖 ${data.reference}`)
            .setDescription(data.text.trim())
            .addFields(
                { name: 'Translation', value: data.translation_name || 'KJV', inline: true },
                { name: 'Shared by', value: message.author.username, inline: true }
            );

        if (category) {
            embed.addFields({ name: 'Category', value: category.charAt(0).toUpperCase() + category.slice(1), inline: true });
        }

        embed.setFooter({ text: '✨ Daily Bible Verse' })
            .setTimestamp();

        await bibleChannel.send({ embeds: [embed] });
        await message.reply('✅ Bible verse shared!');

    } catch (error) {
        console.error('Error sharing Bible verse:', error);
        await message.reply('❌ Failed to share Bible verse.');
    }
}