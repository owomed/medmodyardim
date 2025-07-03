// src/commands/kapat.js
const { Permissions } = require('discord.js');

module.exports = {
    name: 'kapat',
    description: 'Belirtilen ticket kanalını kapatır.',
    async execute(client, message, args) {
        // Kullanıcının yönetici yetkisi olup olmadığını kontrol et
        if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return message.channel.send('Bu komutu kullanabilmek için yönetici yetkisine sahip olmalısınız.');
        }

        // Komuttan sonra bir kanal ID'si veya etiketlemesi olup olmadığını kontrol et
        const channelId = args[0]; // Komuttan sonraki ilk argüman kanal ID'si olacak

        if (!channelId) {
            return message.channel.send('Lütfen kapatmak istediğiniz ticket kanalının ID\'sini veya etiketlemesini belirtin. Örnek: `!kapat 123456789012345678` veya `!kapat #ticket-adı`');
        }

        // Kanalı ID'sine göre bul
        const channelToClose = message.guild.channels.cache.get(channelId) || message.mentions.channels.first();

        // Kanalın varlığını ve ticket kanalı olup olmadığını kontrol et
        if (!channelToClose) {
            return message.channel.send('Belirtilen ID\'ye sahip bir kanal bulunamadı.');
        }

        // Kanalın isminin "ticket-" ile başlayıp başlamadığını kontrol edebilirsiniz
        // Bu kontrolü yapmak istemiyorsanız aşağıdaki if bloğunu silebilirsiniz.
        if (!channelToClose.name.startsWith('ticket-')) {
            return message.channel.send('Belirttiğiniz kanal bir ticket kanalı gibi görünmüyor. Lütfen sadece ticket kanallarını kapatın.');
        }

        try {
            await channelToClose.delete();
            message.channel.send(`**${channelToClose.name}** adlı ticket kanalı başarıyla kapatıldı.`);
            console.log(`Kanal ${channelToClose.name} başarıyla kapatıldı.`);
        } catch (error) {
            console.error(`Kanal ${channelToClose.name} kapatılırken bir hata oluştu: ${error}`);
            message.channel.send(`**${channelToClose.name}** adlı ticket kanalı kapatılırken bir hata oluştu: \`${error.message}\``);
        }
    },
};