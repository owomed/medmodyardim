const { ChannelType } = require('discord.js');
const cron = require('node-cron');

module.exports = (client) => {
    // Mesaj temizleme işlemini her gün saat 03:00'te çalışacak şekilde ayarla.
    cron.schedule('0 3 * * *', async () => {
        console.log('Mesaj temizleme işlemi başlatıldı!');

        const channelId = '1272645947792556173';
        const channel = client.channels.cache.get(channelId);

        // Kanal bulunamazsa veya bir metin kanalı değilse işlemi durdur
        if (!channel || channel.type !== ChannelType.GuildText) {
            console.error(`HATA: Mesaj temizleme kanalı bulunamadı veya bir metin kanalı değil: ${channelId}`);
            return;
        }

        try {
            // Toplu silme için 14 günden yeni mesajları al.
            const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            const messages = await channel.messages.fetch({ limit: 100 });
            
            const deletableMessages = messages.filter(msg => now - msg.createdTimestamp <= twoWeeksInMs);
            const nonDeletableMessages = messages.filter(msg => now - msg.createdTimestamp > twoWeeksInMs);

            let deletedCount = 0;
            
            // 14 günden yeni mesajları toplu olarak sil
            if (deletableMessages.size > 0) {
                const bulkDeleted = await channel.bulkDelete(deletableMessages, true);
                deletedCount += bulkDeleted.size;
            }

            // 14 günden eski mesajları tek tek sil
            if (nonDeletableMessages.size > 0) {
                for (const msg of nonDeletableMessages.values()) {
                    await msg.delete().catch(error => {
                        console.error(`Bir mesaj silinirken hata oluştu: ${error.message}`);
                    });
                    deletedCount++;
                }
            }
            
            console.log(`Başarıyla ${deletedCount} mesaj silindi.`);

        } catch (error) {
            console.error('Mesaj temizleme işlemi sırasında bir hata oluştu:', error);
        }
    }, {
        timezone: "Europe/Istanbul"
    });
};
