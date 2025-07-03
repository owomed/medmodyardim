// src/commands/reset.js
const { Permissions } = require('discord.js'); // Orijinal kodunuzdaki gibi Permissions kullanıldı

module.exports = {
    name: 'resetle', // Orijinal adı korundu
    description: 'Ticket sayısını sıfırlar', // Orijinal açıklaması korundu
    async execute(client, message, args) {
        // Yalnızca yönetici yetkisine sahip kullanıcılar bu komutu kullanabilir
        // Orijinal kodunuzdaki Permissions.FLAGS.ADMINISTRATOR kullanımı olduğu gibi bırakıldı.
        // Bu, Discord.js v14'te hata verebilir ancak güncelleme istemediğiniz için değiştirilmedi.
        if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return message.channel.send('Bu komutu kullanabilmek için yönetici yetkisine sahip olmalısınız.');
        }

        // Ticket sayısını sıfırla
        // Bu kısım, ticketCounter'ın botun başlangıcında veya başka bir yerde
        // 'client' objesi üzerinde tanımlı olduğunu varsayar.
        client.ticketCounter = 1;

        message.channel.send('Ticket sayısı başarıyla sıfırlandı.');
    },
};