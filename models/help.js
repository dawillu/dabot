import { EmbedBuilder } from 'discord.js';

// Command groups
const commandGroups = {
    "🤖 Essential": [
        {
            name: '.ai',
            shortDesc: 'AI chat assistant',
            usage: '.ai <question>',
            aliases: ['.assistant']
        },
        {
            name: '.w',
            shortDesc: 'Weather forecast',
            usage: '.w <city>',
            aliases: ['.weather']
        },
        {
            name: '.t',
            shortDesc: 'Translate text',
            usage: '.t <text>',
            aliases: ['.translate']
        }
    ],
    "🎨 Museum": [
        {
            name: '.m',
            shortDesc: 'Save to museum',
            usage: '.m <desc>',
            aliases: ['.museum']
        },
        {
            name: '.ms',
            shortDesc: 'Set museum channel',
            usage: '.ms [#channel]',
            aliases: ['.setmuseum'],
            adminOnly: true
        }
    ],
    "📖 Bible": [
        {
            name: '.b',
            shortDesc: 'Bible verse',
            usage: '.b [category/reference]',
            aliases: ['.bible']
        },
        {
            name: '.bs',
            shortDesc: 'Set Bible channel',
            usage: '.bs [#channel]',
            aliases: ['.setbible'],
            adminOnly: true
        }
    ],
    "🎮 Games": [
        {
            name: '.s',
            shortDesc: 'Play slots',
            usage: '.s [bet]',
            aliases: ['.slot']
        },
        {
            name: '.g',
            shortDesc: 'Bible word game',
            usage: '.g',
            aliases: ['.game']
        },
        {
            name: '.c',
            shortDesc: 'Check credits',
            usage: '.c',
            aliases: ['.credits', '.balance']
        }
    ]
};

// Command details
const commandDetails = {
    'ai': {
        description: 'Chat with AI assistant',
        example: '.ai What is Discord?',
        aliases: ['.assistant'],
        note: 'Uses GPT for responses'
    },
    'w': {
        description: 'Get weather forecast',
        example: '.w London',
        aliases: ['.weather'],
        note: 'Shows current weather and forecast'
    },
    'b': {
        description: 'Get Bible verses by category or reference',
        example: '.b love or .b john 3:16',
        aliases: ['.bible'],
        categories: ['love', 'peace', 'wisdom', 'hope', 'faith', 'etc..'],
        note: 'Try .b categories to see all options'
    },
    's': {
        description: 'Play slots with your credits',
        example: '.s 100',
        aliases: ['.slots'],
        note: 'Bet from 10 to all your credits. Win up to 10x your bet!'
    },
    'g': {
        description: 'Bible word guessing game',
        example: '.g',
        aliases: ['.game'],
        note: 'Earn 100 credits + speed bonus up to 50!'
    },
    'c': {
        description: 'Check your credit balance',
        example: '.c',
        aliases: ['.credits', '.balance'],
        note: 'Shows balance and ways to earn more'
    }
};

// Helper function for credits info
function getCreditsHelp() {
    return [
        '💰 **Credits System**',
        '• Check balance: `.c`',
        '• Play slots: `.s [bet]`',
        '• Play word game: `.g`',
        '• Win up to 10x your bet'
    ].join('\n');
}

// Show help message
export async function ShowHelp(message) {
    try {
        const args = message.content.split(' ').slice(1);
        
        if (args.length > 0) {
            return await showCommandHelp(message, args[0]);
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Command Quick Guide')
            .setDescription([
                'Use `.help <command>` for detailed info',
                '',
                getCreditsHelp(),
                '',
                '**Quick Reference:**'
            ].join('\n'));

        for (const [category, commands] of Object.entries(commandGroups)) {
            const commandList = commands.map(cmd => {
                const adminBadge = cmd.adminOnly ? '👑 ' : '';
                const alias = cmd.aliases ? ` (${cmd.aliases[0]})` : '';
                return `${adminBadge}**${cmd.name}**${alias}: ${cmd.shortDesc}`;
            }).join('\n');

            embed.addFields({
                name: category,
                value: commandList,
                inline: false
            });
        }

        embed.setFooter({ 
            text: '👑 = Admin only | 💰 = Uses credits | Type .help <command> for details' 
        });
        
        await message.channel.send({ embeds: [embed] });

    } catch (error) {
        console.error('Error showing help:', error);
        await message.reply('❌ Error displaying help message.');
    }
}

async function showCommandHelp(message, commandName) {
    const cmd = commandDetails[commandName.replace('.', '')];
    if (!cmd) {
        return message.reply('❌ Command not found. Use `.help` to see all commands.');
    }

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`Command: ${commandName}`)
        .setDescription(cmd.description)
        .addFields(
            { name: '📝 Example', value: `\`${cmd.example}\``, inline: false }
        );

    if (cmd.aliases?.length) {
        embed.addFields({ 
            name: '💡 Aliases', 
            value: cmd.aliases.join(', '), 
            inline: true 
        });
    }
    
    if (cmd.categories) {
        embed.addFields({ 
            name: '📑 Categories', 
            value: `\`${cmd.categories.join('`, `')}\``, 
            inline: true 
        });
    }

    if (cmd.note) {
        embed.addFields({ 
            name: '📌 Note', 
            value: cmd.note, 
            inline: false 
        });
    }

    await message.channel.send({ embeds: [embed] });
}