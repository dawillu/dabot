import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import { getBibleChannel } from './bibleConfig.js';

// Constants
const BIBLE_API_URL = 'https://bible-api.com';
const VERSES_FILE = path.join(process.cwd(), 'data', 'verses.json');

// Books with numbers in their names so that i can replace spaces with plus sign (API format)
const BOOKS_WITH_NUMBERS = [
    '1 chronicles', '2 chronicles',
    '1 corinthians', '2 corinthians',
    '1 john', '2 john', '3 john',
    '1 kings', '2 kings',
    '1 peter', '2 peter',
    '1 samuel', '2 samuel',
    '1 thessalonians', '2 thessalonians',
    '1 timothy', '2 timothy'
];

// Helper Functions
async function loadVerses() {
    try {
        // Create data folder if it doesn't exist
        await fs.mkdir(path.dirname(VERSES_FILE), { recursive: true });
        // Load verses from file
        const data = await fs.readFile(VERSES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading verses:', err);
        throw new Error('Failed to load verses. Please check verses.json file.');
    }
}

// Fetch Bible verse from API
async function fetchBibleVerse(verse) {
    try {
        // Handle numbered books first
        let cleanVerse = verse.trim().toLowerCase();
        
        // Check if verse starts with a numbered book
        const numberedBook = BOOKS_WITH_NUMBERS.find(book => cleanVerse.startsWith(book));

        if (numberedBook) {
            // Replace space after number with plus sign (API format)
            cleanVerse = cleanVerse.replace(numberedBook, numberedBook.replace(' ', '+'));
        }

        // Clean up the rest of the reference
        cleanVerse = cleanVerse
            .replace(/\s+/g, '+')
            .replace(/[^a-z0-9+:\-]/g, '');

        // Validate verse format including ranges and numbered books
        const versePattern = /^(?:[1-3]\+)?[a-z]+\+?\d+:\d+(?:-\d+)?$/;
        if (!versePattern.test(cleanVerse)) {
            throw new Error('Invalid verse format. Use format like "john 3:16" or "1 peter 1:3-5".');
        }

        // Fetch verse from API
        const response = await fetch(`${BIBLE_API_URL}/${encodeURIComponent(cleanVerse)}`);
        
        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`);
            if (response.status === 404) {
                throw new Error('Verse not found. Please check the reference.');
            }
            throw new Error('Error fetching verse');
        }

        // Parse response
        const data = await response.json();
        
        // Check if verse content is empty
        if (!data?.text) {
            throw new Error('No verse content returned');
        }

        return data;
    } catch (error) {
        console.error('Error fetching verse:', error.message);
        throw error;
    }
}

// Create verse embed
function createVerseEmbed(data, category = null) {
    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`📖 ${data.reference}`)
        .setDescription(data.text.trim());

    if (category) {
        embed.addFields({ 
            name: 'Category', 
            value: category.charAt(0).toUpperCase() + category.slice(1), 
            inline: true 
        });
    }

    return embed.setTimestamp();
}

// Create category list embed
function createCategoryListEmbed(verses) {
    const categories = Object.keys(verses);
    const description = categories.map(cat => {
        const count = verses[cat].length;
        return `**${cat.charAt(0).toUpperCase() + cat.slice(1)}** (${count} verses)`;
    }).join('\n');

    return new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('Bible Verse Categories')
        .setDescription([
            '**Available Categories:**',
            '',
            description,
            '',
            '**Usage:**',
            '`.b <category>` - Get verse from category',
        ].join('\n'))
        .setFooter({ text: 'Example: .b love' });
}

// Command Functions
export async function GetBibleVerse(message) {
    try {
        // Get configured channel
        const bibleChannel = await getBibleChannel(message.guild);
        
        if (!bibleChannel) {
            return message.reply('❌ Bible channel not set! Use `.bs` first.');
        }

        const args = message.content.split(' ').slice(1);
        const verses = await loadVerses();
        let verse;
        let category = null;

        if (!args.length) {
            // Random verse from all categories
            const allVerses = Object.values(verses).flat();
            verse = allVerses[Math.floor(Math.random() * allVerses.length)];
        } else if (['categories', 'help', 'list'].includes(args[0].toLowerCase())) {
            // Show categories list
            return message.reply({ embeds: [createCategoryListEmbed(verses)] });
        } else if (verses[args[0]?.toLowerCase()]) {
            // Category verse
            category = args[0].toLowerCase();
            const categoryVerses = verses[category];
            verse = categoryVerses[Math.floor(Math.random() * categoryVerses.length)];
        } else {
            // Specific verse reference
            verse = args.join(' ');
        }

        const data = await fetchBibleVerse(verse);
        const embed = createVerseEmbed(data, category);
        
        // Send to configured channel and notify user
        await bibleChannel.send({ embeds: [embed] });
        if (bibleChannel.id !== message.channel.id) {
            await message.reply(`✅ Bible verse shared in ${bibleChannel}!`);
        }

    } catch (error) {
        console.error('Bible command error:', error);
        const errorMessage = error.message === 'Could not find that verse reference' 
            ? '❌ Invalid verse reference. Use `.h b` to see usage examples.'
            : `❌ ${error.message}`;
        await message.reply(errorMessage);
    }
}

// Export for other modules
export async function getRandomVerse(category = '') {
    const verses = await loadVerses();
    if (category && verses[category]) {
        const categoryVerses = verses[category];
        return categoryVerses[Math.floor(Math.random() * categoryVerses.length)];
    }
    const allVerses = Object.values(verses).flat();
    return allVerses[Math.floor(Math.random() * allVerses.length)];
}