// src/commands/rol.js
const { MessageEmbed } = require('discord.js'); // Orijinal kodunuzdaki gibi MessageEmbed kullanıldı

module.exports = {
    name: 'rol',
    description: 'Etiketlenen rol hakkında detaylı bilgi verir.',
    async execute(client, message, args) {
        // Etiketlenen rolü kontrol et
        // Orijinal kodunuzdaki gibi role.guild.roles.cache.get(args[0]) kullanıldı.
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) {
            return message.channel.send('Lütfen geçerli bir rol etiketleyin veya rol ID\'sini yazın.');
        }

        // Rol bilgilerini al
        const roleName = role.name;
        const roleID = role.id;
        const roleColor = role.color;
        const rolePosition = role.position;
        const roleCreatedAt = role.createdAt.toLocaleDateString('tr-TR');
        // Orijinal kodunuzdaki role.permissions.toArray() kullanımı olduğu gibi bırakıldı.
        const rolePermissions = role.permissions.toArray().map(permission => {
            // İzinleri daha okunabilir hale getirmek için
            return `\`${permission}\``;
        }).join(', ');

        // Rolü sahiplerinin listesini al ve etiketle
        // Orijinal kodunuzdaki gibi member.roles.cache.has(role.id) kullanıldı.
        const membersWithRole = role.guild.members.cache
            .filter(member => member.roles.cache.has(role.id))
            .map(member => `<@${member.id}>`)
            .join(', ') || 'Bu rolü sahiplenen kimse yok.';

        // Embed mesajı oluştur
        const embed = new MessageEmbed()
            .setColor(roleColor)
            .setTitle(`Rol Bilgileri: ${roleName}`)
            .addField('Rol ID', roleID, true)
            .addField('Renk', `#${roleColor.toString(16).padStart(6, '0')}`, true)
            .addField('Pozisyon', rolePosition.toString(), true)
            .addField('Oluşturulma Tarihi', roleCreatedAt, true)
            .addField('İzinler', rolePermissions || 'Hiçbir izin yok.', false)
            .addField('Rol Sahipleri', membersWithRole, false)
            .setFooter('Developed by Kazolegendd', 'https://cdn.discordapp.com/avatars/1149394269061271562/a_c1715253097d7f531489af59abb3ea05.gif?size=1024');

        // Embed mesajı gönder
        try {
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Rol bilgileri gönderilirken bir hata oluştu:', error);
            return message.channel.send('Rol bilgileri gönderilirken bir hata oluştu.');
        }
    },
};