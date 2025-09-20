const { Events, ChannelType } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // This is the most crucial step: Check if the message is partial.
        // A partial message is an incomplete object. We must fetch its full data
        // before trying to access properties like 'author', 'content', etc.
        if (message.partial) {
            try {
                await message.fetch();
            } catch (error) {
                console.error('Failed to fetch a partial message:', error);
                return; // Stop execution if fetching fails
            }
        }
        
        // Now that we have the full message, we can safely access its properties.
        // The error on line 19 ('message.author.bot') will no longer occur.
        if (message.author.bot || message.channel.type === ChannelType.DM) {
            return;
        }

        const client = message.client;

        // --- CUSTOM SYSTEMS ---

        // Reaction System
        const CHANNEL1_ID = client.config.CHANNEL1_ID;
        const EMOJI = '1235321947035013231';

        if (message.channel.id === CHANNEL1_ID) {
            message.react(EMOJI).catch(err => console.error('Emoji reaction failed:', err));
        }

        // Command Handler
        const prefix = client.config.prefix || '!';
        if (!message.content.startsWith(prefix)) {
            return;
        }

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (cmd) {
            try {
                await cmd.execute(message, args);
            } catch (error) {
                console.error(`An error occurred while executing command: ${commandName}`, error);
                message.reply('An error occurred while running this command. Please try again later.');
            }
        }
    }
};
