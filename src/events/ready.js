const { ChannelType } = require('discord.js');
const chalk = require('chalk');
const moment = require('moment');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

// Bu `module.exports` fonksiyonu async olmalı, çünkü içinde await kullanacağız.
module.exports = async client => {
    // --- TEMEL BAŞLANGIÇ LOGLARI VE DURUM AYARLARI ---
    console.log(chalk.greenBright(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Bot Aktif. Komutlar yüklendi!`));
    console.log(chalk.greenBright(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${client.user.tag} olarak ${client.guilds.cache.size} sunucuya hizmet veriliyor!`));

    // Bot durumu (status) ayarı
    client.user.setStatus("dnd");

    // Bot aktivite (oynadığı oyun/yayın) ayarı
    // İstediğin gibi özel durum (custom status) ayarlandı.
    client.user.setActivity({
        name: 'OwO 🧡 MED ile ilgileniyor',
        type: 4, // Etkinlik türü: 4 = Özel Durum (Custom Status)
    });

    // --- SES KANALINA BAĞLANMA (Discord.js v14) ---
    const guildId = '788355812774903809'; // Sunucu ID'si
    const channelId = '1235643294973956158'; // Ses kanalının ID'si

    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.error(chalk.redBright('HATA: Belirtilen sunucu bulunamadı. Lütfen guildId değerini kontrol edin.'));
        } else {
            const channel = guild.channels.cache.get(channelId);
            if (!channel || channel.type !== ChannelType.GuildVoice) {
                console.error(chalk.redBright('HATA: Belirtilen kanal bir ses kanalı değil veya bulunamadı.'));
            } else {
                // Eğer bot zaten kanala bağlı değilse bağlan
                const connection = getVoiceConnection(guildId);
                if (!connection) {
                    joinVoiceChannel({
                        channelId: channel.id,
                        guildId: guild.id,
                        adapterCreator: guild.voiceAdapterCreator,
                    });
                    console.log(chalk.greenBright(`Başarıyla ${channel.name} ses kanalına bağlandım.`));
                }
            }
        }
    } catch (error) {
        console.error(chalk.redBright('SES KANALI BAĞLANTI HATASI: Ses kanalına bağlanırken bir hata oluştu:'), error);
        console.error(chalk.redBright('Olası Nedenler: Botun kanala katılma izni olmayabilir veya ses paketleri (@discordjs/voice) doğru kurulmamış olabilir.'));
    }
    
    // --- BİLDİRİM ROL SİSTEMİ İÇİN ROL SENKRONİZASYONU ---
    const CHANNEL_ID = client.config.CHANNEL_ID;
    const MESSAGE_ID = client.config.MESSAGE_ID;
    const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;

    try {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (!channel) {
            console.error(chalk.redBright('HATA: Bildirim Rol Sistemi için kanal bulunamadı:', CHANNEL_ID));
        } else {
            const message = await channel.messages.fetch(MESSAGE_ID).catch(() => null);
            if (message) {
                // Her tepki için kullanıcıları getir
                message.reactions.cache.forEach(async (reaction) => {
                    const users = await reaction.users.fetch();
                    users.forEach(async user => {
                        if (!user.bot) {
                            const roleId = ROLE_EMOJI_MAP[reaction.emoji.name];
                            if (roleId) {
                                const member = await message.guild.members.fetch(user.id).catch(() => null);
                                if (member) {
                                    if (reaction.users.cache.has(user.id)) {
                                        if (!member.roles.cache.has(roleId)) {
                                            member.roles.add(roleId)
                                                .then(() => console.log(chalk.blueBright(`[SYNC] Rol eklendi: ${user.tag} -> ${roleId}`)))
                                                .catch(error => console.error(chalk.redBright(`[SYNC] Rol eklenirken hata: ${user.tag} -> ${roleId}`), error));
                                        }
                                    } else {
                                        if (member.roles.cache.has(roleId)) {
                                            member.roles.remove(roleId)
                                                .then(() => console.log(chalk.yellowBright(`[SYNC] Rol kaldırıldı: ${user.tag} -> ${roleId}`)))
                                                .catch(error => console.error(chalk.redBright(`[SYNC] Rol kaldırılırken hata: ${user.tag} -> ${roleId}`), error));
                                        }
                                    }
                                }
                            }
                        }
                    });
                });
            } else {
                console.error(chalk.redBright('HATA: Bildirim Rol Sistemi için mesaj bulunamadı:', MESSAGE_ID));
            }
        }
    } catch (error) {
        console.error(chalk.redBright('HATA: Bildirim Rol Sistemi mesajı fetch edilirken veya roller senkronize edilirken bir hata oluştu:'), error);
    }
    
    // --- YUKARI/EMOJİ TEPKİ SİSTEMİ İÇİN MEVCUT MESAJLARA TEPKİ EKLEME ---
    const CHANNEL1_ID = client.config.CHANNEL1_ID;
    const EMOJI = '1235321947035013231';

    const channel1 = client.channels.cache.get(CHANNEL1_ID);
    if (channel1) {
        channel1.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(message => {
                if (!message.reactions.cache.has(EMOJI)) { // Tepkinin zaten var olup olmadığını kontrol et
                    message.react(EMOJI).catch(err => console.error(chalk.redBright('HATA: Emoji tepki eklenirken bir hata oluştu:'), err));
                }
            });
            console.log(chalk.greenBright(`[EMOJİ SİSTEMİ] ${CHANNEL1_ID} kanalındaki mesajlara tepkiler senkronize edildi.`));
        }).catch(err => console.error(chalk.redBright('HATA: Kanal mesajları fetch edilirken bir hata oluştu (Emoji Sistemi):'), err));
    } else {
        console.error(chalk.redBright('HATA: Belirtilen kanal bulunamadı (Yukarı/Emoji Tepki Sistemi). Kanal ID:', CHANNEL1_ID));
    }
};
