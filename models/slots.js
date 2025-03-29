import { promises as fs } from 'fs';
import path from 'path';

const CREDITS_FILE = path.join(process.cwd(), 'data', 'credits.json');
const SLOT_SYMBOLS = ['🍉', '🥐', '🥦'];
const MIN_BET = 10;
const STARTING_CREDITS = 1000;

const PAYOUTS = {
    '🍉🍉🍉': 10,  // 10x bet
    '🥐🥐🥐': 7,   // 7x bet
    '🥦🥦🥦': 5,   // 5x bet
};

// Helper functions for message formatting
function createSpinningMessage(symbols, bet, credits) {
    return [
        '```',
        'SPINNING...',
        `| ${symbols.join(' | ')} |`,
        `bet: ${bet} 💰  balance: ${credits} 💰`,
        '```'
    ].join('\n');
}

function createResultMessage(result, bet, winnings, balance) {
    const isWinner = winnings > 0;
    return [
        '```',
        isWinner ? 'WINNER!' : 'BAD LUCK!',
        `| ${result.join(' | ')} |`,
        `bet: ${bet} 💰  balance: ${balance} 💰  win: ${winnings} 💰`,
        isWinner ? `🎉 ${winnings/bet}x Multiplier! 🎉` : '😢 better luck next time!',
        '```'
    ].join('\n');
}

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

function spin() {
    return [
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
    ];
}

function calculateWinnings(result, betAmount) {
    const combination = result.join('');
    const multiplier = PAYOUTS[combination] || 0;
    return multiplier * betAmount;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function PlaySlots(message) {
    try {
        // Parse bet amount from command
        const args = message.content.split(' ');
        const betAmount = parseInt(args[1]) || MIN_BET;

        const credits = await loadCredits();
        const userId = message.author.id;

        // Validate bet amount
        if (betAmount < MIN_BET || betAmount > credits[userId]) {
            return message.reply(`❌ Bet must be between ${MIN_BET} and ${credits[userId]} credits.`);
        }
        
        if (!credits[userId]) {
            credits[userId] = STARTING_CREDITS;
        }

        if (credits[userId] < betAmount) {
            return message.reply(`❌ Not enough credits! You need ${betAmount} credits to play.`);
        }

        // Initial message
        const response = await message.reply(
            createSpinningMessage(['❓', '❓', '❓'], betAmount, credits[userId])
        );

        // Spinning animation
        for (let i = 0; i < 3; i++) {
            await sleep(800);
            const spinSymbols = Array(3).fill('').map(() => 
                SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
            );
            await response.edit(
                createSpinningMessage(spinSymbols, betAmount, credits[userId])
            );
        }

        // Final spin
        credits[userId] -= betAmount;
        const result = spin();
        const winnings = calculateWinnings(result, betAmount);
        credits[userId] += winnings;
        await saveCredits(credits);

        // Show final result
        await response.edit(
            createResultMessage(result, betAmount, winnings, credits[userId])
        );

    } catch (error) {
        console.error('Slots error:', error);
        await message.reply('❌ Error playing slots.');
    }
}