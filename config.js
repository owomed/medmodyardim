require('dotenv').config();

module.exports = {
    // Bot'un kimlik bilgileri
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    
    // Mesaj logları için kanal ID'si
    LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID,

    // Anti-Reklam Sistemi Ayarları
    ALLOWED_ROLES_ANTI_AD: ['1277916392926085151', '1188389290292551740'], // Reklam yapmasına izin verilen rol ID'leri
    MUTE_ROLE_ID: '1235246562628603925', // Mute rolünün ID'si
    AD_LINKS: ['discord.gg', 'discord.com/invite', 'dlive.tv', 'twitch.tv'], // Yasaklı reklam bağlantıları
    MAX_ADS: 3, // Mute verilmeden önceki maksimum reklam deneme sayısı
    MUTE_DURATION_MS: 24 * 60 * 60 * 1000, // 24 saat (milisaniye cinsinden)
    userAds: new Map(), // Kullanıcıların reklam deneme sayısını tutar

    // Ticket (Bilet) Sistemi Ayarları
    TICKET_CHANNEL_ID: '1234966836936704083', // Bilet oluşturma mesajının olduğu kanal
    TICKET_CATEGORY_ID: '1268509251911811175', // Bilet kanallarının oluşturulacağı kategori
    TICKET_STAFF_ROLE_ID: '1236317902295138304', // Biletleri yönetebilecek yetkili rolü

    // Diğer Sabitler
    DM_LOG_CHANNEL_ID: '1235584702308552765', // DM loglarının gönderileceği kanal
    
    // Bildirim ve Rol Sistemi
    CHANNEL_ID: '1235112746329178165', 
    MESSAGE_ID: '1269356111308525660',

    // Boost tepki 
    CHANNEL1_ID: '1238505799475794043',  
};
