const { ChannelType } = require('discord.js');

module.exports = (client, cron) => {
    // Her gün Türkiye saatiyle 15:00'te çalışır ama sadece 2 günde bir mesaj gönderir
    cron.schedule('0 15 * * *', () => {
        const now = new Date();
        const turkishDate = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
        const day = turkishDate.getDate();

        if (day % 2 === 0) { // 2 günde bir: sadece çift günlerde çalışır
            // 1. kanal mesajı
            const channelId1 = '1235140378399604766';
            const channel1 = client.channels.cache.get(channelId1);
            if (channel1 && channel1.type === ChannelType.GuildText) {
                channel1.send('Oy vermeyi unutmayın <@&1236394142788091995> !');
            } else {
                console.error(`Kanal bulunamadı veya bir metin kanalı değil: ${channelId1}`);
            }

            // 2. kanal mesajı
            const channelId2 = '1238064886844624896';
            const channel2 = client.channels.cache.get(channelId2);
            if (channel2 && channel2.type === ChannelType.GuildText) {
                channel2.send('** <a:med_kirmiziyildiz:1241736282946801775> | <@&1236317902295138304> Rolü ve üstündeki kişi ve kişilere bağış atılıyor. <:med_kalpuwu:1274072967508135987> Owo dilenmek yasak. <a:med_cookieyerimm:1274247962930839664> **');
            } else {
                console.error(`Kanal bulunamadı veya bir metin kanalı değil: ${channelId2}`);
            }
        } else {
            console.log("Bugün mesaj gönderilmiyor. (Tek gün):", turkishDate.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }));
        }
    }, {
        timezone: "Europe/Istanbul"
    });

    // Her gün Türkiye saati ile 10:00'da mesaj gönder
    cron.schedule('0 10 * * *', () => {
        const channelId = '1278027775130865779'; // Mesajın gönderileceği kanalın ID'si
        const channel = client.channels.cache.get(channelId);
        if (channel && channel.type === ChannelType.GuildText) {
            channel.send('.agayapsuisi');
        } else {
            console.error(`Kanal bulunamadı veya bir metin kanalı değil: ${channelId}`);
        }
    }, {
        timezone: "Europe/Istanbul" // Türkiye saat dilimini kullan
    });
};
