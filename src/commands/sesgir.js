// src/commands/sesgir.js
const { joinVoiceChannel } = require('@discordjs/voice'); // Orijinal kodunuzdaki gibi import edildi

module.exports = {
    name: 'sesgir',
    description: 'Botun belirli bir ses kanalına katılmasını sağlar.',
    async execute(client, message, args) {
        const channelId = '1235643294973956158'; // Ses kanalının ID'sini buraya ekleyin (Orijinal haliyle korundu)
        const voiceChannel = message.guild.channels.cache.get(channelId);

        if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') { // 'GUILD_VOICE' stringi orijinal haliyle korundu. Discord.js v14'te ChannelType.GuildVoice enum'ı önerilir.
            return message.reply('Belirtilen ses kanalı bulunamadı veya geçerli bir ses kanalı değil.');
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            message.reply('`Bot ses kanalına katıldı.`');
        } catch (error) {
            console.error('Ses kanalına katılma hatası:', error);
            message.reply('Ses kanalına katılırken bir hata oluştu.');
        }
    },
};