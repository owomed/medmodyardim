const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

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

    // Komutun ana mantığını yürüten bir fonksiyon
    async handleVoiceJoin(interactionOrMessage) {
        const client = interactionOrMessage.client;
        const guild = interactionOrMessage.guild;
        
        // Ses kanalını al
        const voiceChannel = guild.channels.cache.get(TARGET_CHANNEL_ID);

        // Kanal bulunamazsa veya ses kanalı değilse hata gönder
        if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
            const replyMessage = 'Belirtilen ses kanalı bulunamadı veya geçerli bir ses kanalı değil.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(replyMessage);
            }
            return;
        }

        try {
            // joinVoiceChannel fonksiyonunu kullanarak kanala katıl
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            
            // Başarılı olduğunu belirt
            const successMessage = '`Bot ses kanalına katıldı.`';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: successMessage });
            } else {
                await interactionOrMessage.channel.send(successMessage);
            }
        } catch (error) {
            console.error('Ses kanalına katılma hatası:', error);
            const errorMessage = 'Ses kanalına katılırken bir hata oluştu.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: errorMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(errorMessage);
            }
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
