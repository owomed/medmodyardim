const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    // Slash komutu için veri
    data: new SlashCommandBuilder()
        .setName('resetle')
        .setDescription('Ticket sayısını sıfırlar.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // En iyi yöntem: Slash komutu için yetkiyi burada tanımla
    
    // Prefix komutu için ad
    name: 'resetle',
    
    // Hem prefix hem de slash için çalışacak fonksiyon
    async execute(interactionOrMessage) {
        // Komutun türüne göre yetki kontrolü
        let hasPermission = false;
        if (interactionOrMessage.isChatInputCommand()) {
            // Slash komutu için güncel yetki kontrolü
            hasPermission = interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.Administrator);
        } else {
            // Prefix komutu için kullanıcıdan gelen eski yetki kontrolü
            // Bu, Discord.js v14'te hata verebilir, bu yüzden slash komutu için farklı bir yöntem kullanıyoruz.
            const { Permissions } = require('discord.js');
            hasPermission = interactionOrMessage.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
        }
        
        if (!hasPermission) {
            const replyMessage = 'Bu komutu kullanabilmek için yönetici yetkisine sahip olmalısınız.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(replyMessage);
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
};
