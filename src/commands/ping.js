// src/commands/ping.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun pingini gösterir.'),

    // Prefix komutu için isim ve açıklama
    name: 'ping',
    description: 'Botun pingini gösterir.',
    aliases: ['p'], // İsteğe bağlı, ek takma ad ekleyebilirsiniz.

    // Prefix komutları için metot
    execute(client, message) {
        // Ping değerini al ve kanala gönder
        message.channel.send(`😉 yaptığım botun pingi :D => **${client.ws.ping}ms**`);
    },

    // Slash komutları için metot
    async interact(interaction) {
        // Ping değerini al ve etkileşime yanıt ver
        await interaction.reply({ content: `😉 yaptığım botun pingi :D => **${interaction.client.ws.ping}ms**`, ephemeral: false });
    },
};
