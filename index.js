// index.js (Senkronizasyon Atlatma İçin Düzenlenmiş Versiyon)
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const path = require('path');
const config = require('./config.js');
const loader = require('./src/loader.js'); // Loader dosyasını çağır

// Rol verme mesajının bulunduğu KANAL ID'sini buraya ekleyin!
// client.config.js dosyanızda sadece MESSAGE_ID olduğu için, buraya CHANNEL_ID'yi manuel olarak eklemeniz gereklidir.
const CHANNEL_ID = 'ROL_VERME_MESAJININ_BULUNDUGU_KANAL_IDSI'; // BURAYI KENDİ KANAL ID'nizle DEĞİŞTİRİN

// Bot istemcisini oluştur
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Üye verilerini anlık çekmek için açık kalmalı.
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
});

client.config = config;

// Loader'ı kullanarak tüm modülleri yükle
loader(client);

// --- KRİTİK DEĞİŞİKLİK: Hazır olduğunda Rol Mesajını Önbelleğe Al ---
client.on('ready', async () => {
    console.log(`Bot başarılı bir şekilde giriş yaptı: ${client.user.tag}`);

    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel) {
            // Mesajı çekerek önbelleğe alıyoruz. Bu, botun o anki tepkileri görmesini sağlar
            // ve yavaş senkronizasyon sorununu çözmeye yardımcı olur.
            const message = await channel.messages.fetch(client.config.MESSAGE_ID);
            console.log(`[ÖN BELLEK] Rol verme mesajı başarıyla önbelleğe alındı. (${message.id})`);
        } else {
            console.error(`[HATA] Rol verme kanalı bulunamadı: ${CHANNEL_ID}`);
        }
    } catch (error) {
        console.error("Rol verme mesajı önbelleğe alınamadı veya bulunamadı:", error.message);
    }
});
// ------------------------------------------------------------------

// Web sunucusu kısmı
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Bot aktif ve çalışıyor!');
});
app.listen(port, () => {
    console.log(`Web sunucusu ${port} portunda çalışıyor.`);
});

// Bota giriş yap
client.login(client.config.token).catch(err => {
    console.error("Bot başlatılırken kritik bir hata oluştu: ", err);
    process.exit(1);
});
