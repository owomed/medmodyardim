const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun gecikme süresini gösterir.'),
    
    // Prefix komutu için ad
    name: 'ping',
    description: 'Botun gecikme süresini gösterir.',
    aliases: ['gecikme'], // ping için bir takma ad

    // Prefix komutları için metot
    async execute(message) {
        const sent = await message.reply('Pinging...');
        sent.edit(`Pong! Gecikme: ${sent.createdTimestamp - message.createdTimestamp}ms`);
    },

    // Slash komutları için metot
    async interact(interaction) {
        // Gecikme süresini hesaplamak için etkileşim yanıtını ertele
        await interaction.deferReply({ ephemeral: true });

        const sent = await interaction.editReply({ content: 'Pinging...', fetchReply: true });
        
        await interaction.editReply(`Pong! Gecikme: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    },
};
