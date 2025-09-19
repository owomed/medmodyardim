const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun pingini gösterir.'),

    // Prefix komutu için isim ve açıklama
    name: 'ping',
    description: 'Botun pingini gösterir.',
    aliases: ['p'],

    // Hem prefix hem de slash komutları için ortak metot
    async execute(interactionOrMessage) {
        // Eğer bir etkileşim (slash komutu) ise
        if (interactionOrMessage.isCommand()) {
            await interactionOrMessage.reply({ content: `😉 yaptığım botun pingi :D => **${interactionOrMessage.client.ws.ping}ms**`, ephemeral: false });
        } 
        // Eğer bir mesaj (prefix komutu) ise
        else {
            interactionOrMessage.channel.send(`😉 yaptığım botun pingi :D => **${interactionOrMessage.client.ws.ping}ms**`);
        }
    },
};
