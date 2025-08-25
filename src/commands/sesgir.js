// src/commands/sesgir.js
const { joinVoiceChannel } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');

// Sabit ses kanalı ID'si
const TARGET_CHANNEL_ID = '1235643294973956158';

module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('sesgir')
        .setDescription('Botun belirli bir ses kanalına katılmasını sağlar.'),
    
    // Prefix komutu için isim ve açıklama
    name: 'sesgir',
    description: 'Botun belirli bir ses kanalına katılmasını sağlar.',

    // Komutun ana mantığını yürüten bir fonksiyon oluşturalım.
    async handleVoiceJoin(interactionOrMessage) {
        const client = interactionOrMessage.client;
        const guild = interactionOrMessage.guild;
        
        // Ses kanalını al
        const voiceChannel = guild.channels.cache.get(TARGET_CHANNEL_ID);

        // Kanal bulunamazsa veya ses kanalı değilse hata gönder
        if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') {
            return interactionOrMessage.reply ? await interactionOrMessage.reply('Belirtilen ses kanalı bulunamadı veya geçerli bir ses kanalı değil.') :
                interactionOrMessage.channel.send('Belirtilen ses kanalı bulunamadı veya geçerli bir ses kanalı değil.');
        }

        try {
            // joinVoiceChannel fonksiyonunu kullanarak kanala katıl
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            // Başarılı olduğunu belirt
            interactionOrMessage.reply ? await interactionOrMessage.reply('`Bot ses kanalına katıldı.`') :
                interactionOrMessage.channel.send('`Bot ses kanalına katıldı.`');
        } catch (error) {
            console.error('Ses kanalına katılma hatası:', error);
            // Hata mesajı gönder
            interactionOrMessage.reply ? await interactionOrMessage.reply('Ses kanalına katılırken bir hata oluştu.') :
                interactionOrMessage.channel.send('Ses kanalına katılırken bir hata oluştu.');
        }
    },

    // Prefix komutları için metot
    async execute(client, message) {
        await this.handleVoiceJoin(message);
    },

    // Slash komutları için metot
    async interact(interaction) {
        await this.handleVoiceJoin(interaction);
    },
};
