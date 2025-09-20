// src/commands/ping.js

const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun gecikme süresini gösterir.'),
    
    name: 'ping',
    description: 'Botun gecikme süresini gösterir.',

    async execute(client, message, args) {
        // DM'den geliyorsa uyarı verip durdur
        if (message.channel.type === ChannelType.DM) {
            return message.reply('Bu komut DM\'lerde kullanılamaz.');
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Pong!')
            .setDescription(`**Gecikme süresi:** ${Date.now() - message.createdTimestamp}ms`);

        await message.reply({ embeds: [embed] });
    },

    async interact(interaction) {
        await interaction.reply({ content: `Pong! Gecikme süresi: ${interaction.client.ws.ping}ms`, ephemeral: true });
    },
};
