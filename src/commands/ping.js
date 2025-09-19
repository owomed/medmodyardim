const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun pingini gösterir.'),

    // Prefix komutu için isim ve takma adlar
    name: 'ping',
    aliases: ['p'],

    /**
     * Hem prefix hem de slash komutları için ortak metot
     * @param {import('discord.js').Interaction|import('discord.js').Message} interactionOrMessage
     */
    async execute(interactionOrMessage) {
        // Eğer bir etkileşim (slash komutu) ise
        if (interactionOrMessage.isChatInputCommand()) {
            await interactionOrMessage.reply({ content: `😉 yaptığım botun pingi :D => **${interactionOrMessage.client.ws.ping}ms**`, ephemeral: false });
        }
        // Eğer bir mesaj (prefix komutu) ise
        else {
            const sentMessage = await interactionOrMessage.channel.send(`😉 yaptığım botun pingi :D => **${interactionOrMessage.client.ws.ping}ms**`);
            // Komut mesajını sil
            await interactionOrMessage.delete().catch(console.error);
        }
    },
    
    /**
     * Slash komut etkileşimlerini işlemek için kullanılan metot.
     * execute() metodunu çağırır.
     * @param {import('discord.js').Interaction} interaction 
     */
    async interact(interaction) {
        await this.execute(interaction);
    },
};
