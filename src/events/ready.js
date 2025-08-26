// src/events/ready.js
const { VoiceChannel } = require('discord.js');
const chalk = require('chalk');
const moment = require('moment');

// Bu `module.exports` fonksiyonu async olmalı, çünkü içinde await kullanacağız.
module.exports = async client => { // Buraya 'async' eklendi

    // --- TEMEL BAŞLANGIÇ LOGLARI VE DURUM AYARLARI ---
    console.log(chalk.greenBright(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Bot Aktif. Komutlar yüklendi!`));
    console.log(chalk.greenBright(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${client.user.tag} olarak ${client.guilds.cache.size} sunucuya hizmet veriliyor!`));

    // Bot durumu (status) ayarı
    client.user.setStatus("dnd");

    // Bot aktivite (oynadığı oyun/yayın) ayarı
    // Sadece istediğiniz tek durumu içeren bir dizi oluşturuldu.
    const games = [
        'OwO 🧡 MED ile ilgileniyor',
    ];

    let currentIndex = 0;

    // Twitch yayıncı olarak ayarlama (10 saniyede bir değişir)
    // Sadece tek bir durum olduğu için her zaman aynı metin gösterilecek.
    setInterval(() => {
        client.user.setActivity(games[currentIndex], { type: 'STREAMING', url: 'https://www.twitch.tv/kazo1egendd' });
        currentIndex = (currentIndex + 1) % games.length;
    }, 10 * 1000);

    // --- SES KANALINA BAĞLANMA (Discord.js v13) ---
    // Bu kısım, bot sadece bir kez 'ready' olduğunda çalışır.
    client.once('ready', async () => {
        try {
            const guildId = '788355812774903809'; // Sunucu ID'si
            const channelId = '1235643294973956158'; // Ses kanalının ID'si

            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                console.error(chalk.redBright('HATA: Belirtilen sunucu bulunamadı. Lütfen guildId değerini kontrol edin.'));
                return;
            }

            const channel = guild.channels.cache.get(channelId);
            // v13'te VoiceChannel kontrolü doğrudur.
            if (!channel || !(channel instanceof VoiceChannel)) {
                console.error(chalk.redBright('HATA: Belirtilen kanal bir ses kanalı değil veya bulunamadı.'));
                return;
            }

            // v13'te ses kanalına bağlanmak için channel.join() metodunu kullanın.
            await channel.join();
            console.log(chalk.greenBright(`Başarıyla ${channel.name} ses kanalına bağlandım.`));
            
        } catch (error) {
            console.error(chalk.redBright('SES KANALI BAĞLANTI HATASI: Ses kanalına bağlanırken bir hata oluştu:'), error);
            console.error(chalk.redBright('Olası Nedenler: Botun kanala katılma izni olmayabilir veya "@discordjs/opus" ve "libsodium-wrappers" gibi ses paketleri eksik olabilir.'));
        }
    });

    // --- BİLDİRİM ROL SİSTEMİ İÇİN ROL SENKRONİZASYONU ---
    // Bot çevrimiçi olduğunda mevcut mesaj tepkilerine göre rolleri senkronize etme.
    const CHANNEL_ID = client.config.CHANNEL_ID;
    const MESSAGE_ID = client.config.MESSAGE_ID;
    const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;

    try {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (!channel) {
            console.error(chalk.redBright('HATA: Bildirim Rol Sistemi için kanal bulunamadı:', CHANNEL_ID));
            // Hata olduğu için buradan çıkmak isteyebilirsiniz, veya sadece loglayıp devam edebilirsiniz.
            // return;
        } else {
            const message = await channel.messages.fetch(MESSAGE_ID); // Sabit mesaj ID'si ile mesajı getir
            if (message) {
                // Her tepki için kullanıcıları getir
                message.reactions.cache.forEach(async (reaction) => {
                    const users = await reaction.users.fetch();
                    users.forEach(user => {
                        // Botun kendi tepkilerini göz ardı et
                        if (!user.bot) {
                            const roleId = ROLE_EMOJI_MAP[reaction.emoji.name];
                            if (roleId) {
                                const member = message.guild.members.cache.get(user.id);
                                if (member) {
                                    // Eğer kullanıcı tepkiyi bırakmışsa rolü ekle, kaldırmışsa kaldır.
                                    // Bu mantık, `messageReactionAdd` ve `messageReactionRemove` olayları ile birlikte daha etkili çalışır.
                                    // Buradaki senkronizasyon, bot çevrimdışı iken yapılan tepkileri yakalamak içindir.
                                    if (reaction.users.cache.has(user.id)) {
                                        if (!member.roles.cache.has(roleId)) {
                                            member.roles.add(roleId)
                                                .then(() => console.log(chalk.blueBright(`[SYNC] Rol eklendi: ${user.tag} -> ${roleId}`)))
                                                .catch(error => console.error(chalk.redBright(`[SYNC] Rol eklenirken hata: ${user.tag} -> ${roleId}`), error));
                                        }
                                    } else { // Kullanıcı tepkiyi kaldırmış ama hala rolü varsa
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
    // Bot çevrimiçi olduğunda belirli kanaldaki son 100 mesaja otomatik emoji ekleme.
    const CHANNEL1_ID = client.config.CHANNEL1_ID;
    const EMOJI = '1235321947035013231';

    const channel1 = client.channels.cache.get(CHANNEL1_ID);
    if (channel1) {
        // Son 100 mesajı getir
        channel1.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(message => {
                // Botun bu emoji ile zaten tepki vermediği mesajlara tepki ekle
                if (!message.reactions.cache.has(EMOJI) || !message.reactions.cache.get(EMOJI).me) {
                    message.react(EMOJI).catch(err => console.error(chalk.redBright('HATA: Emoji tepki eklenirken bir hata oluştu:'), err));
                }
            });
            console.log(chalk.greenBright(`[EMOJİ SİSTEMİ] ${CHANNEL1_ID} kanalındaki mesajlara tepkiler senkronize edildi.`));
        }).catch(err => console.error(chalk.redBright('HATA: Kanal mesajları fetch edilirken bir hata oluştu (Emoji Sistemi):'), err));
    } else {
        console.error(chalk.redBright('HATA: Belirtilen kanal bulunamadı (Yukarı/Emoji Tepki Sistemi). Kanal ID:', CHANNEL1_ID));
    }
};
