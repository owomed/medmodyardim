module.exports = (client) => {
    const ALLOWED_ROLES = client.config.ALLOWED_ROLES_ANTI_AD; // config'ten al
    const MUTE_ROLE_ID = client.config.MUTE_ROLE_ID; // config'ten al
    const AD_LINKS = client.config.AD_LINKS; // config'ten al
    const MAX_ADS = client.config.MAX_ADS; // config'ten al
    const MUTE_DURATION_MS = client.config.MUTE_DURATION_MS; // config'ten al
    const userAds = client.config.userAds; // config'ten al (Map olduğu için referansını alıyoruz)

    client.on('messageCreate', async message => {
        if (message.author.bot) return;

        const userRoles = message.member.roles.cache.map(role => role.id);
        const hasAllowedRole = ALLOWED_ROLES.some(roleId => userRoles.includes(roleId));

        const isAd = AD_LINKS.some(link => message.content.includes(link) && !message.content.startsWith('https://discord.com/channels/'));

        if (isAd && !hasAllowedRole) {
            const userId = message.author.id;
            const channel = message.channel;

            message.delete().catch(console.error);

            channel.send(`${message.author}, reklam yapmamanız gerekiyor. Aksi takdirde ceza alacaksınız.`);

            if (!userAds.has(userId)) {
                userAds.set(userId, 1);
            } else {
                let adCount = userAds.get(userId);
                adCount += 1;
                userAds.set(userId, adCount);

                if (adCount >= MAX_ADS) {
                    const member = message.guild.members.cache.get(userId);
                    if (member) {
                        const muteRole = message.guild.roles.cache.get(MUTE_ROLE_ID);
                        if (muteRole) {
                            member.roles.add(muteRole).catch(console.error);
                            channel.send(`${message.author}, Reklam denemeleri yaptığınız için mute rolü verildi. Bu rol 1 gün sonra kaldırılacaktır.`);

                            setTimeout(() => {
                                member.roles.remove(muteRole).catch(console.error);
                                channel.send(`${message.author}, mute rolü kaldırıldı.`);
                            }, MUTE_DURATION_MS);
                        }
                    }
                }
            }
        } else if (!isAd && userAds.has(message.author.id)) {
            userAds.delete(message.author.id);
        }
    });
};