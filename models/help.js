import { EmbedBuilder } from 'discord.js';

// Command groups
const commandGroups = {
    // Core commands
    "🤖 Essential": [
        {
            name: '.ai',
            shortDesc: 'AI chat assistant',
            usage: '.ai <question>'
        },
        {
            name: '.weather',
            shortDesc: 'Get weather forecast',
            usage: '.weather <city>',
            aliases: ['.w']
        },
        {
            name: '.t',
            shortDesc: 'Translate text',
            usage: '.t <text>'
        }
    ],
    // Museum features
    "🎨 Museum": [
        {
            name: '.museum',
            shortDesc: 'Save image to gallery',
            usage: '.museum <desc>',
            aliases: ['.m']
        },
        {
            name: '.setMuseum',
            shortDesc: 'Set museum channel',
            usage: '.sm [#channel]',
            aliases: ['.sm'],
            adminOnly: true
        }
    ],
    // Bible system
    "📖 Bible": [
        {
            name: '.bible',
            shortDesc: 'Share Bible verse',
            usage: '.bible [category]',
            aliases: ['.b']
        },
        {
            name: '.setBible',
            shortDesc: 'Set Bible channel',
            usage: '.setBible [#channel]',
            aliases: ['.sb'],
            adminOnly: true
        }
    ]
};

// Command details
const commandDetails = {
    'ai': {
        description: 'Chat with the AI assistant for help and information',
        example: '.ai What is Discord?',
        note: 'Uses GPT for intelligent responses'
    },
    'weather': {
        description: 'Get detailed weather forecast for any location',
        example: '.weather London',
        aliases: ['.w'],
        note: 'Shows temperature, conditions, and forecast'
    },
    'museum': {
        description: 'Add artwork to the museum gallery',
        example: '.museum A beautiful sunset 🌄',
        aliases: ['.m'],
        note: 'Must include an image attachment'
    },
    'bible': {
        description: 'Share Bible verses by category or reference',
        example: '.bible love',
        aliases: ['.b'],
        categories: [
            'love', 'peace', 'wisdom', 'hope', 'inspiration',
            'strength', 'grace', 'faith', 'joy', 'forgiveness',
            'courage', 'patience', 'humility', 'contentment'
        ],
        note: 'Random verse if no category specified'
    }
};

// Show help message
export async function ShowHelp(message) {
    try {
        const args = message.content.split(' ').slice(1);
        
        if (args.length > 0) {
            return await showCommandHelp(message, args[0]);
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🤖 Command Quick Guide')
            .setDescription('Use `.help <command>` for detailed info\n\nQuick Reference:');

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

        embed.setFooter({ text: '👑 = Admin only | Type .help <command> for details' });
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
        embed.addFields({ name: '💡 Aliases', value: cmd.aliases.join(', '), inline: true });
    }
    
    if (cmd.categories) {
        embed.addFields({ name: '📑 Categories', value: `\`${cmd.categories.join('`, `')}\``, inline: true });
    }

    if (cmd.note) {
        embed.addFields({ name: '📌 Note', value: cmd.note, inline: false });
    }

    await message.channel.send({ embeds: [embed] });
}