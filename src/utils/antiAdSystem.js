module.exports = (client) => {
    // config'ten gerekli verileri al
    const {
        ALLOWED_ROLES_ANTI_AD,
        MUTE_ROLE_ID,
        AD_LINKS,
        MAX_ADS,
        MUTE_DURATION_MS,
        userAds
    } = client.config;

    client.on('messageCreate', async message => {
        // Bot mesajlarını ve DM'leri göz ardı et
        if (message.author.bot || !message.guild) return;

        // İzin verilen rollere sahip kullanıcıları kontrol et
        const userRoles = message.member.roles.cache.map(role => role.id);
        const hasAllowedRole = ALLOWED_ROLES_ANTI_AD.some(roleId => userRoles.includes(roleId));

        // Mesajın bir reklam bağlantısı içerip içermediğini kontrol et
        const isAd = AD_LINKS.some(link => message.content.includes(link) && !message.content.startsWith('https://discord.com/channels/'));

        if (isAd && !hasAllowedRole) {
            const userId = message.author.id;
            const channel = message.channel;

            // Mesajı sil
            await message.delete().catch(err => console.error('Reklam mesajı silinirken hata oluştu:', err));

            // Uyarı mesajı gönder
            const warnMessage = await channel.send(`${message.author}, reklam yapmamanız gerekiyor. Aksi takdirde ceza alacaksınız.`);
            setTimeout(() => warnMessage.delete().catch(console.error), 5000);

            // Kullanıcının reklam sayacını güncelle
            const adCount = (userAds.get(userId) || 0) + 1;
            userAds.set(userId, adCount);

            if (adCount >= MAX_ADS) {
                const member = await message.guild.members.fetch(userId).catch(console.error);
                if (member) {
                    const muteRole = message.guild.roles.cache.get(MUTE_ROLE_ID);
                    if (muteRole) {
                        try {
                            // Mute rolü ver
                            await member.roles.add(muteRole);
                            await channel.send(`${message.author}, ${MAX_ADS} reklam denemesi yaptığınız için mute rolü verildi. Bu rol 1 gün sonra kaldırılacaktır.`);

                            // Mute süresinin sonunda rolü kaldır
                            setTimeout(async () => {
                                try {
                                    await member.roles.remove(muteRole);
                                    await channel.send(`${message.author}, mute rolü kaldırıldı.`);
                                    userAds.delete(userId); // Sayacı sıfırla
                                } catch (err) {
                                    console.error('Mute rolü kaldırılırken hata oluştu:', err);
                                }
                            }, MUTE_DURATION_MS);

                        } catch (err) {
                            console.error('Mute rolü verilirken hata oluştu:', err);
                            channel.send(`${message.author}, mute rolü verilemedi. Lütfen botun izinlerini kontrol edin.`);
                        }
                    } else {
                        console.error('Mute rolü bulunamadı. Lütfen MUTE_ROLE_ID değerini kontrol edin.');
                    }
                }
            }
        } else if (!isAd && userAds.has(message.author.id)) {
            // Kullanıcı reklam yapmayı bıraktıysa sayacı sıfırla
            userAds.delete(message.author.id);
        }
    });
};
