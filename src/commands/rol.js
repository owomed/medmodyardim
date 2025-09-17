const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
    aliases: ['roleinfo'],

    // Komutun ana mantığını yürüten bir fonksiyon
    async handleRolCommand(interactionOrMessage, role) {
        if (!role) {
            const replyMessage = 'Lütfen geçerli bir rol etiketleyin veya rol ID\'si girin.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(replyMessage);
            }
            return;
        }

        const roleName = role.name;
        const roleID = role.id;
        const roleColor = role.hexColor; // Discord.js v14'te role.color yerine role.hexColor kullanılır
        const rolePosition = role.position;
        const roleCreatedAt = role.createdAt.toLocaleDateString('tr-TR');
        const rolePermissions = role.permissions.toArray().map(permission => {
            return `\`${permission}\``;
        }).join(', ');
        
        const membersWithRole = role.members
            .map(member => `<@${member.id}>`)
            .join(', ') || 'Bu rolü sahiplenen kimse yok.';

        // Embed mesajı oluştur
        const embed = new EmbedBuilder()
            .setColor(roleColor)
            .setTitle(`Rol Bilgileri: ${roleName}`)
            .addFields(
                { name: 'Rol ID', value: roleID, inline: true },
                { name: 'Renk', value: roleColor, inline: true },
                { name: 'Pozisyon', value: rolePosition.toString(), inline: true },
                { name: 'Oluşturulma Tarihi', value: roleCreatedAt, inline: true },
                { name: 'İzinler', value: rolePermissions || 'Hiçbir izin yok.', inline: false },
                { name: 'Rol Sahipleri', value: membersWithRole, inline: false }
            )
            .setFooter({
                text: 'Developed by Kazolegendd/Nostalgically edited by hicckimse',
                iconURL: 'https://cdn.discordapp.com/avatars/1149394269061271562/a_c1715253097d7f531489af59abb3ea05.gif?size=1024'
            });

        // Yanıtı gönder
        try {
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ embeds: [embed] });
            } else {
                await interactionOrMessage.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Rol bilgileri gönderilirken bir hata oluştu:', error);
            const errorMessage = 'Rol bilgileri gönderilirken bir hata oluştu.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: errorMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(errorMessage);
            }
        }
    },

    // Prefix komutları için metot
    async execute(client, message, args) {
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        await this.handleRolCommand(message, role);
    },

    // Slash komutları için metot
    async interact(interaction) {
        const role = interaction.options.getRole('rol');
        await this.handleRolCommand(interaction, role);
    }
};
