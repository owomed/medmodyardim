// Gerekli modülleri içe aktar
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Yapılandırma dosyasını içe aktar
const config = require('./config.js');
// Bot istemcisini oluştur ve ayarlarını yap
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent, // v14 için zorunlu olan mesaj içeriği yetkisi
        GatewayIntentBits.GuildMembers, // Üye log ve bilgileri için
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
});

// Yapılandırma ve komut koleksiyonlarını global hale getir
client.config = config;
client.commands = new Collection();
client.slashCommands = new Collection();
const slashCommands = []; // Slash komutlarını tutmak için bir dizi

// Loader dosyasını çağırarak tüm komutları, olayları ve yardımcı modülleri yükle
// Loader, komutları yükleyerek client.commands koleksiyonunu dolduracak
require('./src/loader.js')(client);

// client.on('ready', ...'nin içine koyacağın yeni kod bloğu
client.on('ready', async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    
    // Slash komutlarını bir diziye topla
    const slashCommands = [];
    for (const command of client.slashCommands.values()) {
        if (command.data) {
            slashCommands.push(command.data.toJSON());
        }
    }

    // Yeni ve doğru API versiyonunu (v10) kullanıyoruz
    const rest = new REST({ version: '10' }).setToken(client.config.TOKEN);

    try {
        console.log('(/) Komutları yenileniyor...');
        
        // Komutları global yerine sunucuya özel yüklüyoruz.
        // Bu çok daha hızlıdır. GUILD_ID'yi config.js'den alıyor.
        await rest.put(
            Routes.applicationGuildCommands(client.config.CLIENT_ID, client.config.GUILD_ID),
            { body: slashCommands },
        );

        console.log('(/) Komutları başarıyla yüklendi!');
    } catch (error) {
        console.error('(/) Komut yüklenirken bir hata oluştu:', error);
    }
});

// --- WEB SUNUCUSU KISMI BAŞLANGIÇ ---
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot aktif ve çalışıyor!');
});

app.listen(port, () => {
    console.log(`Web sunucusu ${port} portunda çalışıyor.`);
});
// --- WEB SUNUCUSU KISMI BİTİŞ ---

// Botu başlat
client.login(client.config.token).catch(err => {
    console.error("Bot başlatılırken bir hata oluştu: ", err);
    process.exit(1);
});
