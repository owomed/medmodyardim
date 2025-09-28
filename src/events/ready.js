// src/events/ready.js - Senkronizasyon Bloğu Kaldırıldı.

const { ChannelType } = require('discord.js');
const chalk = require('chalk');
const moment = require('moment');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = async client => {
    // --- TEMEL BAŞLANGIÇ LOGLARI VE DURUM AYARLARI ---
    console.log(chalk.greenBright(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Bot Aktif. Komutlar yüklendi!`));
    console.log(chalk.greenBright(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${client.user.tag} olarak ${client.guilds.cache.size} sunucuya hizmet veriliyor!`));

    client.user.setStatus("dnd");
    client.user.setActivity({
        name: 'OwO 🧡 MED ile ilgileniyor',
        type: 4,
    });

    // --- SES KANALINA BAĞLANMA (Değişiklik yapılmadı) ---
    const guildId = client.config.GUILD_ID || '788355812774903809';
    const voiceChannelId = client.config.VOICE_CHANNEL_ID || '1235643294973956158';

    try {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            const channel = guild.channels.cache.get(voiceChannelId);
            if (channel && channel.type === ChannelType.GuildVoice) {
                const connection = getVoiceConnection(guildId);
                if (!connection) {
                    joinVoiceChannel({
                        channelId: channel.id,
                        guildId: guild.id,
                        adapterCreator: guild.voiceAdapterCreator,
                    });
                    console.log(chalk.greenBright(`Başarıyla ${channel.name} ses kanalına bağlandım.`));
                }
            } else {
                 console.error(chalk.redBright('HATA: Belirtilen kanal bir ses kanalı değil veya bulunamadı.'));
            }
        } else {
            console.error(chalk.redBright('HATA: Belirtilen sunucu bulunamadı. Lütfen guildId değerini kontrol edin.'));
        }
    } catch (error) {
        console.error(chalk.redBright('SES KANALI BAĞLANTI HATASI: Ses kanalına bağlanırken bir hata oluştu:'), error);
    }
    
    // --- BİLDİRİM ROL SİSTEMİ İÇİN MANUEL ROL SENKRONİZASYON BLOĞU KALDIRILDI ---
    // Bu blok, botun açılışında yüzlerce eski tepkiyi kontrol edip hata veriyordu.
    // Artık sadece anlık tepkiler (messageReactionAdd/Remove) ile rol verilecek/alınacaktır.
    
    
    // --- YUKARI/EMOJİ TEPKİ SİSTEMİ İÇİN MEVCUT MESAJLARA TEPKİ EKLEME (Değişiklik yapılmadı) ---
    const CHANNEL1_ID = client.config.CHANNEL1_ID;
    const EMOJI = '1235321947035013231';

    const channel1 = client.channels.cache.get(CHANNEL1_ID);
    if (channel1) {
        channel1.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(message => {
                if (!message.reactions.cache.has(EMOJI)) {
                    message.react(EMOJI).catch(err => console.error(chalk.redBright('HATA: Emoji tepki eklenirken bir hata oluştu:'), err));
                }
            });
            console.log(chalk.greenBright(`[EMOJİ SİSTEMİ] ${CHANNEL1_ID} kanalındaki mesajlara tepkiler senkronize edildi.`));
        }).catch(err => console.error(chalk.redBright('HATA: Kanal mesajları fetch edilirken bir hata oluştu (Emoji Sistemi):'), err));
    } else {
        console.error(chalk.redBright('HATA: Belirtilen kanal bulunamadı (Yukarı/Emoji Tepki Sistemi). Kanal ID:', CHANNEL1_ID));
    }
};
