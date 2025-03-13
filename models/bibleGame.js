import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import { getRandomVerse } from './bible.js';

// Constants
const CREDITS_FILE = path.join(process.cwd(), 'data', 'credits.json');
const GAME_TIMEOUT = 30000; // 30 seconds
const POINTS_CORRECT = 100;
const POINTS_BONUS_TIME = 50;

const EXCLUDED_WORDS = [
    'the', 'and', 'but', 'for', 'that', 'with', 'this', 'from', 'they',
    'have', 'had', 'were', 'was', 'will', 'what', 'when', 'who', 'how',
    'are', 'his', 'her', 'their', 'your', 'has', 'not', 'unto', 'thy'
];

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

function findTargetWord(text) {
    const words = text.split(/\s+/);
    // Filter meaningful words
    const candidates = words.filter(word => 
        word.length > 3 && 
        !EXCLUDED_WORDS.includes(word.toLowerCase()) &&
        !/[0-9:]/.test(word) && // Exclude numbers and references
        !/[^\w\s]/.test(word)    // Exclude punctuation
    );
    
    if (!candidates.length) {
        return words.find(w => w.length > 2) || words[0];
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function createGameEmbed(puzzleText, data, targetWord) {
    return new EmbedBuilder()
        .setColor('#4169E1')
        .setTitle('📖 Bible Word Challenge!')
        .setDescription([
            '**Fill in the blank:**',
            '',
            `*"${puzzleText}"*`,
            '',
            '━━━━━━━━━━━━━━━━',
            `📍 **Reference:** ${data.reference}`,
            `📝 **Word Length:** ${targetWord.length} letters`,
            '⏳ **Time Limit:** 30 seconds',
            '━━━━━━━━━━━━━━━━',
            '',
            '💡 Type your answer below!'
        ].join('\n'))
        .setFooter({ text: '💰 Earn credits for correct answers + speed bonus!' });
}

function createWinEmbed(targetWord, points, timeBonus, totalPoints, balance, timeTaken) {
    return new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✨ Correct Answer! ✨')
        .setDescription([
            `🎯 The word was: **${targetWord}**`,
            '',
            '━━━━━━━━━━━━━━━━',
            `💎 Base Points: ${points}`,
            `⚡ Speed Bonus: +${timeBonus}`,
            `🏆 Total Earned: ${totalPoints}`,
            `💰 New Balance: ${balance}`,
            '━━━━━━━━━━━━━━━━',
            '',
            `⏱️ Solved in: ${timeTaken.toFixed(1)} seconds`,
            '',
            '🎮 Play again with `.bg`!'
        ].join('\n'))
        .setTimestamp();
}

function createFailEmbed(targetWord, data, isTimeout) {
    return new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(isTimeout ? '⏰ Time\'s Up!' : '❌ Wrong Answer!')
        .setDescription([
            `The correct word was: **${targetWord}**`,
            '',
            '━━━━━━━━━━━━━━━━',
            '📖 **Full Verse:**',
            `*"${data.text}"*`,
            '━━━━━━━━━━━━━━━━',
            '',
            '💰 Earn credits for correct answers!'
        ].join('\n'))
        .setTimestamp();
}

export async function PlayBibleGame(message) {
    try {
        const verse = await getRandomVerse();
        const response = await fetch(`https://bible-api.com/${encodeURIComponent(verse)}`);
        const data = await response.json();

        if (!data?.text) {
            return message.reply('❌ Failed to fetch verse. Please try again.');
        }

        // Improved word puzzle creation
        const cleanText = data.text.trim();
        const targetWord = findTargetWord(cleanText);
        const puzzleText = cleanText.replace(
            new RegExp(`\\b${targetWord}\\b`, 'gi'), 
            '___'.repeat(Math.ceil(targetWord.length / 3))
        );

        // Send game embed
        const gameMessage = await message.channel.send({ 
            embeds: [createGameEmbed(puzzleText, data, targetWord)] 
        });

        const startTime = Date.now();
        const filter = m => m.author.id === message.author.id;
        
        try {
            const collected = await message.channel.awaitMessages({ 
                filter, max: 1, time: GAME_TIMEOUT, errors: ['time'] 
            });

            const answer = collected.first().content.toLowerCase();
            const timeTaken = (Date.now() - startTime) / 1000;
            const isCorrect = answer === targetWord.toLowerCase();

            if (isCorrect) {
                // Calculate rewards
                const timeBonus = Math.max(0, Math.floor(POINTS_BONUS_TIME * (1 - timeTaken/30)));
                const totalPoints = POINTS_CORRECT + timeBonus;

                // Update credits
                const credits = await loadCredits();
                const userId = message.author.id;
                credits[userId] = (credits[userId] || 0) + totalPoints;
                await saveCredits(credits);

                await message.channel.send({ 
                    embeds: [createWinEmbed(
                        targetWord, 
                        POINTS_CORRECT, 
                        timeBonus, 
                        totalPoints, 
                        credits[userId], 
                        timeTaken
                    )] 
                });
            } else {
                throw new Error('wrong_answer');
            }

        } catch (err) {
            await message.channel.send({ 
                embeds: [createFailEmbed(
                    targetWord, 
                    data, 
                    err.message !== 'wrong_answer'
                )] 
            });
        }

    } catch (error) {
        console.error('Bible game error:', error);
        await message.reply('❌ Error running Bible game.');
    }
}