// index.js (Yeni ve daha temiz hali)
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const path = require('path');
const config = require('./config.js');
const loader = require('./src/loader.js'); // Loader dosyasını çağır

// Bot istemcisini oluştur
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
});

client.config = config;

// Loader'ı kullanarak tüm modülleri yükle
loader(client);

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
    console.error("Bot başlatılırken bir hata oluştu: ", err);
    process.exit(1);
});
