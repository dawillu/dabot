import { EmbedBuilder } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';

const CREDITS_FILE = path.join(process.cwd(), 'data', 'credits.json');
const STARTING_CREDITS = 1000;

async function loadCredits() {
    try {
        await fs.mkdir(path.dirname(CREDITS_FILE), { recursive: true });
        const data = await fs.readFile(CREDITS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}

async function saveCredits(credits) {
    await fs.writeFile(CREDITS_FILE, JSON.stringify(credits, null, 2));
}

export async function CheckCredits(message) {
    try {
        const credits = await loadCredits();
        const userId = message.author.id;
        const balance = credits[userId] || 0;

        if (!credits[userId]) {
            credits[userId] = STARTING_CREDITS;
            await saveCredits(credits);
        }

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setDescription([
                `**Balance:** ${balance} credits`,
            ].join('\n'))
            .setFooter({ text: `${message.author.username}'s balance` })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Credits check error:', error);
        await message.reply('❌ Error checking credits balance.');
    }
}