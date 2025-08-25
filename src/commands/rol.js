// src/commands/rol.js
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('rol')
        .setDescription('Etiketlenen rol hakkında detaylı bilgi verir.')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Bilgisini görmek istediğiniz rol')
                .setRequired(true)),
    
    // Prefix komutu için isim ve açıklama
    name: 'rol',
    description: 'Etiketlenen rol hakkında detaylı bilgi verir.',
    aliases: ['roleinfo'], // İsteğe bağlı, ek takma ad ekleyebilirsiniz.

    // Komutun ana mantığını yürüten bir fonksiyon oluşturalım.
    async handleRolCommand(interactionOrMessage, role) {
        if (!role) {
            // interactionOrMessage'ın type'ına göre yanıt ver
            return interactionOrMessage.reply ? await interactionOrMessage.reply('Lütfen geçerli bir rol etiketleyin veya rol ID\'si girin.') :
                interactionOrMessage.channel.send('Lütfen geçerli bir rol etiketleyin veya rol ID\'si girin.');
        }

        // Rol bilgilerini al
        const roleName = role.name;
        const roleID = role.id;
        const roleColor = role.color;
        const rolePosition = role.position;
        const roleCreatedAt = role.createdAt.toLocaleDateString('tr-TR');
        const rolePermissions = role.permissions.toArray().map(permission => {
            return `\`${permission}\``;
        }).join(', ');

        // Rolü sahiplerinin listesini al ve etiketle
        const membersWithRole = role.guild.members.cache
            .filter(member => member.roles.cache.has(role.id))
            .map(member => `<@${member.id}>`)
            .join(', ') || 'Bu rolü sahiplenen kimse yok.';

        // Embed mesajı oluştur
        const embed = new MessageEmbed()
            .setColor(roleColor)
            .setTitle(`Rol Bilgileri: ${roleName}`)
            .addFields(
                { name: 'Rol ID', value: roleID, inline: true },
                { name: 'Renk', value: `#${roleColor.toString(16).padStart(6, '0')}`, inline: true },
                { name: 'Pozisyon', value: rolePosition.toString(), inline: true },
                { name: 'Oluşturulma Tarihi', value: roleCreatedAt, inline: true },
                { name: 'İzinler', value: rolePermissions || 'Hiçbir izin yok.', inline: false },
                { name: 'Rol Sahipleri', value: membersWithRole, inline: false }
            )
            .setFooter('Developed by Kazolegendd', 'https://cdn.discordapp.com/avatars/1149394269061271562/a_c1715253097d7f531489af59abb3ea05.gif?size=1024');

        // Yanıtı gönder
        try {
            // interactionOrMessage'ın type'ına göre yanıt ver
            if (interactionOrMessage.reply) {
                await interactionOrMessage.reply({ embeds: [embed] });
            } else {
                await interactionOrMessage.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Rol bilgileri gönderilirken bir hata oluştu:', error);
            // Hata mesajını da ilgili kanala/etkileşime gönder
            return interactionOrMessage.reply ? await interactionOrMessage.reply('Rol bilgileri gönderilirken bir hata oluştu.') :
                interactionOrMessage.channel.send('Rol bilgileri gönderilirken bir hata oluştu.');
        }
    },

    // Prefix komutları için metot
    async execute(client, message, args) {
        // Prefix komutu için rolü mesajdan al
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        await this.handleRolCommand(message, role);
    },

    // Slash komutları için metot
    async interact(interaction) {
        // Slash komutu için rolü etkileşimden al
        const role = interaction.options.getRole('rol');
        await this.handleRolCommand(interaction, role);
    }
};
