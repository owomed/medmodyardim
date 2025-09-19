const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    // Slash komutu için veri
    data: new SlashCommandBuilder()
        .setName('resetle')
        .setDescription('Ticket sayısını sıfırlar.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // En iyi yöntem: Slash komutu için yetkiyi burada tanımla
    
    // Prefix komutu için ad ve takma adlar
    name: 'resetle',
    aliases: ['sıfırla'],

    /**
     * Hem prefix hem de slash için çalışacak ortak fonksiyon
     * @param {import('discord.js').Interaction|import('discord.js').Message} interactionOrMessage
     */
    async execute(interactionOrMessage) {
        // Komutun türüne göre yetki kontrolü
        // Hem slash hem de prefix için PermissionsBitField kullanmak en iyisidir.
        const hasPermission = interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.Administrator);
        
        if (!hasPermission) {
            const replyMessage = 'Bu komutu kullanabilmek için yönetici yetkisine sahip olmalısınız.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(replyMessage);
                await interactionOrMessage.delete().catch(console.error);
            }
            return;
        }

        // Ticket sayısını sıfırla
        // `client` objesine erişim, `interactionOrMessage.client` üzerinden sağlanır.
        interactionOrMessage.client.ticketCounter = 1;

        const successMessage = 'Ticket sayısı başarıyla sıfırlandı.';
        if (interactionOrMessage.isChatInputCommand()) {
            await interactionOrMessage.reply({ content: successMessage });
        } else {
            await interactionOrMessage.channel.send(successMessage);
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
