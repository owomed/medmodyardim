module.exports = (client) => {
    client.on('ready', () => {
        console.log(`Mesaj temizleme işlemi başlatıldı!`);

        const channelId = '1272645947792556173'; // Mesajların temizleneceği kanalın ID'si
        const oneMonthInMs = 30 * 24 * 60 * 60 * 1000; // 1 ay milisaniye cinsinden

        const channel = client.channels.cache.get(channelId);
        if (channel) {
            channel.messages.fetch({ limit: 100 })
                .then(messages => {
                    const oldMessages = messages.filter(msg => Date.now() - msg.createdTimestamp > oneMonthInMs);
                    oldMessages.forEach(msg => msg.delete().catch(console.error));
                    console.log(`Bir aydan eski ${oldMessages.size} mesaj silindi.`);
                })
                .catch(console.error);
        } else {
            console.error(`Kanal bulunamadı: ${channelId}`);
        }
    });
};