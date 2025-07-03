const { Client, Intents, MessageActionRow, MessageSelectMenu, EmbedBuilder, MessageEmbed } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const express = require('express'); // Express.js'i ekliyoruz

global.client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

// Ayarlar ve sabitler için merkezi bir dosya kullanmak daha iyi olabilir
// Bu örnekte main dosyada tutulmuştur. İsterseniz constants.js dosyasına taşıyabilirsiniz.
const ROLE_EMOJI_MAP = {
    '🎊': '1238180102454513845',
    '🎉': '1238180308608749689',
    '🎲': '1238181107741098115',
    '🐦': '1238181182353440818',
    '🧾': '1238181268064309329',
    '💰': '1238183161188581447',
    '🔔': '1242016385689980928',
};

const BilgiRoleMap = {
    '1235288469413302306': 'Autohunt Hakkında Bilgi İçin',
    '1235289050517340241': 'Silahlar Hakkında Bilgi İçin',
    '1235288028709257226': 'Gemler Hakkında Bilgi İçin',
};

const colorRoleMap = {
    '🔴': '1235226278311759883', // Kırmızı
    '🟢': '1235226195734429887', // Yeşil
    '🔵': '1235226003857735701', // Mavi
    '🟡': '1235226369995051110', // Sarı
    '🟤': '1235226635960324137', // Kahverengi
    '⬛': '1235225883787132948', // Siyah
    '⬜': '1235225495663280139', // Beyaz
    '🔵': '1235226828373753961', // Lacivert (iki tane mavi var, düzelttim. Biri lacivert olsun)
    '🟠': '1235226529286586540', // Turuncu
    '🟣': '1235226437552963624', // Mor
};
const allowedRoles = ['1267795945844637696', '1242100437226881105']; // İzin verilen roller

// Sabit Kanal ve Mesaj ID'leri
const CHANNEL_ID = '1235112746329178165'; // Kanal ID'sini buraya girin (Bildirim Rol Sistemi için)
const MESSAGE_ID = '1269356111308525660'; // Mesaj ID'sini buraya girin (Bildirim Rol Sistemi için)
const CHANNEL1_ID = '1238505799475794043'; // Kanal ID'si (Yukarı/Emoji Tepki Sistemi için)

const ALLOWED_ROLES_ANTI_AD = ['1236317902295138304', '1216094391060529393']; // Reklam engellemeden muaf rollerin ID'leri
const MUTE_ROLE_ID = '1235246562628603925'; // Mute rolünün ID'si
const AD_LINKS = ['https://', 'http://', 'www.', 'discord.gg/']; // Reklam olarak kabul edilen bağlantı işaretçileri
const MAX_ADS = 3; // Bir kullanıcıya reklama izin verilen maksimum sayı
const MUTE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 gün (milisaniye cinsinden)

const userAds = new Map(); // Kullanıcıların reklam sayısını takip etmek için

// Tüm sabitleri global.client.config'e atayabiliriz veya ayrı bir constants.js dosyasında toplayabiliriz.
// Şimdilik ana dosyada dursun, ama ileride taşımak iyi bir fikir.
client.config = {
    ROLE_EMOJI_MAP,
    BilgiRoleMap,
    colorRoleMap,
    allowedRoles,
    CHANNEL_ID,
    MESSAGE_ID,
    CHANNEL1_ID,
    ALLOWED_ROLES_ANTI_AD,
    MUTE_ROLE_ID,
    AD_LINKS,
    MAX_ADS,
    MUTE_DURATION_MS,
    userAds // Map'i de config'e ekleyebiliriz
};


client.config.token = process.env.TOKEN; // Token'ı config'e taşıdık

require('./src/loader')(client, fs, cron); // client, fs ve cron modüllerini loader'a gönderiyoruz

// --- WEB SUNUCUSU KISMI BAŞLANGIÇ ---
const app = express();
const port = process.env.PORT || 3000; // Render, PORT ortam değişkenini otomatik olarak atar

// Basit bir kök (/) endpoint'i tanımlıyoruz.
// Render, bu endpoint'e düzenli olarak istek göndererek uygulamanızın canlı olup olmadığını kontrol eder.
app.get('/', (req, res) => {
  res.send('Bot aktif ve çalışıyor!');
});

// Web sunucusunu başlatıyoruz
app.listen(port, () => {
  console.log(`Web sunucusu ${port} portunda çalışıyor.`);
});
// --- WEB SUNUCUSU KISMI BİTİŞ ---

client.login(client.config.token);