// Gerekli modülleri içe aktar
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Yapılandırma dosyasını içe aktar
const config = require('./src/config.js');

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

// Komutları Discord API'sine kaydetme
client.on('ready', async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);

    // Slash komutlarını bir diziye topla
    for (const command of client.slashCommands.values()) {
        if (command.data) {
            slashCommands.push(command.data.toJSON());
        }
    }

    const rest = new REST({ version: '9' }).setToken(client.config.token);

    try {
        console.log('(/) Komutları yenileniyor...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashCommands },
        );
        console.log('(/) Komutları başarıyla yenilendi!');
    } catch (error) {
        console.error(error);
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
