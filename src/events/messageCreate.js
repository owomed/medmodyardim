const { Events, ChannelType } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Step 1: Handle partial messages.
        // This ensures we have a complete message object before proceeding.
        if (message.partial) {
            try {
                await message.fetch();
            } catch (error) {
                console.error('Failed to fetch partial message:', error);
                return; // Stop execution if fetching fails
            }
        }

        // Step 2: Stop if the message is from a bot or a DM.
        // This is the most crucial check for your "tavsiye" command error.
        // It prevents the bot from processing messages from other bots or DMs.
        // A DM doesn't have a 'guild', which causes issues later.
        if (message.author.bot || message.channel.type === ChannelType.DM) {
            return;
        }

        // Now that we've handled partial messages and DMs, we can safely proceed.
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
                // Here, we provide the correct arguments to the command's execute function.
                // Your command files expect (client, message, args), so we pass them in that order.
                await cmd.execute(client, message, args);
            } catch (error) {
                console.error(`An error occurred while executing command: ${commandName}`, error);
                // Reply only in a guild channel to avoid DM errors.
                if (message.guild) {
                    message.reply('An error occurred while running this command. Please try again later.');
                }
            }
        }
    }
};
