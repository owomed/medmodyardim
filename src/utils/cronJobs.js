// src/utils/cron.js

const { ChannelType } = require('discord.js');
const cron = require('node-cron'); // 'node-cron' modülünü burada tanımlıyoruz.

module.exports = (client) => {

    // Her gün 15:00'te (UTC), Türkiye saatiyle 18:00'de çalışır.
    // Her gün çalışır, ancak mesajı 2 günde bir gönderir.
    cron.schedule('0 15 * * *', () => {
        const now = new Date();
        const day = now.getUTCDate(); // UTC gününü alıyoruz

        if (day % 2 === 0) { // Sadece çift günlerde (ayın 2, 4, 6... günü)
            
            // 1. Kanal Mesajı
            const channelId1 = '1235140378399604766';
            const channel1 = client.channels.cache.get(channelId1);
            if (channel1 && channel1.type === ChannelType.GuildText) {
                channel1.send('Oy vermeyi unutmayın <@&1236394142788091995> !');
            } else {
                console.error(`Kanal bulunamadı veya bir metin kanalı değil: ${channelId1}`);
            }

            // 2. Kanal Mesajı
            const channelId2 = '1238064886844624896';
            const channel2 = client.channels.cache.get(channelId2);
            if (channel2 && channel2.type === ChannelType.GuildText) {
                channel2.send('** <a:med_kirmiziyildiz:1241736282946801775> | <@&1236317902295138304> Rolü ve üstündeki kişi ve kişilere bağış atılıyor. <:med_kalpuwu:1274072967508135987> Owo dilenmek yasak. <a:med_cookieyerimm:1274247962930839664> **');
            } else {
                console.error(`Kanal bulunamadı veya bir metin kanalı değil: ${channelId2}`);
            }
            console.log("Bugün mesaj gönderildi (Çift gün).");
        } else {
            console.log("Bugün mesaj gönderilmiyor. (Tek gün)");
        }
    }, {
        timezone: "UTC" // Cron job'un kendisi UTC'ye göre ayarlandığı için timezone: "UTC" daha tutarlı
    });

    // Her gün Türkiye saati ile 10:00'da mesaj gönder
    cron.schedule('0 10 * * *', () => {
        const channelId = '1278027775130865779';
        const channel = client.channels.cache.get(channelId);
        if (channel && channel.type === ChannelType.GuildText) {
            channel.send('.agayapsuisi');
        } else {
            console.error(`Kanal bulunamadı veya bir metin kanalı değil: ${channelId}`);
        }
    }, {
        timezone: "Europe/Istanbul" // Bu cron job'u Türkiye saatiyle senkronize etmek için
    });

    console.log('Cron job’lar yüklendi ve planlandı.');
};
