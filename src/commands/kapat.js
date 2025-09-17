const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    // Slash komutu için veri
    data: new SlashCommandBuilder()
        .setName('kapat')
        .setDescription('Belirtilen ticket kanalını kapatır.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Kapatmak istediğiniz kanalı belirtin.')
                .addChannelTypes(ChannelType.GuildText) // Sadece metin kanallarını gösterir
                .setRequired(true)),
    
    // Prefix komutu için ad
    name: 'kapat',
    
    async execute(interactionOrMessage, args) {
        // Komutun türüne göre yetki kontrolü ve kanal tespiti
        let member, channelToClose;

        if (interactionOrMessage.isChatInputCommand()) {
            member = interactionOrMessage.member;
            channelToClose = interactionOrMessage.options.getChannel('kanal');
        } else {
            member = interactionOrMessage.member;
            const channelId = args[0];
            channelToClose = interactionOrMessage.guild.channels.cache.get(channelId) || interactionOrMessage.mentions.channels.first();
        }

        // Kullanıcının yetkisi yoksa
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const replyMessage = 'Bu komutu kullanabilmek için yönetici yetkisine sahip olmalısınız.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(replyMessage);
            }
            return;
        }

        // Kanal bulunamadıysa
        if (!channelToClose) {
            const replyMessage = 'Belirtilen kanal bulunamadı.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(replyMessage);
            }
            return;
        }

        // Kanalın adını kontrol et
        if (!channelToClose.name.startsWith('ticket-')) {
            const replyMessage = 'Belirttiğiniz kanal bir ticket kanalı gibi görünmüyor.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(replyMessage);
            }
            return;
        }

        try {
            await channelToClose.delete();
            const replyMessage = `**${channelToClose.name}** adlı ticket kanalı başarıyla kapatıldı.`;
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply(replyMessage);
            } else {
                await interactionOrMessage.channel.send(replyMessage);
                await interactionOrMessage.delete(); // Prefix komutunda mesajı sil
            }
            console.log(`Kanal ${channelToClose.name} başarıyla kapatıldı.`);
        } catch (error) {
            console.error(`Kanal ${channelToClose.name} kapatılırken bir hata oluştu: ${error}`);
            const errorMessage = `**${channelToClose.name}** adlı ticket kanalı kapatılırken bir hata oluştu: \`${error.message}\``;
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: errorMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(errorMessage);
            }
        }
    },
};
