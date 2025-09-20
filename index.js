
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

// Komut ve olayları yükle
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command) {
        client.commands.set(command.name, command);
        if (command.aliases) {
            command.aliases.forEach(alias => client.commands.set(alias, command));
        }
    }
    if ('data' in command) {
        client.slashCommands.set(command.data.name, command);
    }
}

const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}

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

    const rest = new REST({ version: '10' }).setToken(client.config.token);

    try {
        console.log('(/) Komutlar yenileniyor...');
        
        await rest.put(
            Routes.applicationGuildCommands(client.config.clientId, client.config.guildId),
            { body: slashCommands },
        );

        console.log('(/) Komutlar başarıyla yüklendi!');
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
