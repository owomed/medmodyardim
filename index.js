const { Client, GatewayIntentBits, Partials, Collection, Events } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const express = require('express');
const path = require('path');
const fs = require('fs');

const config = require('./config.js');

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
client.commands = new Collection();
client.slashCommands = new Collection();

const slashCommands = [];

// Events (Olaylar) yükleyici
const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Commands (Komutlar) yükleyici
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'interact' in command) {
        client.slashCommands.set(command.data.name, command);
        slashCommands.push(command.data.toJSON());
    }
    if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
    }
}

client.on(Events.ClientReady, async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    
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

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot aktif ve çalışıyor!');
});

app.listen(port, () => {
    console.log(`Web sunucusu ${port} portunda çalışıyor.`);
});

client.login(client.config.token).catch(err => {
    console.error("Bot başlatılırken bir hata oluştu: ", err);
    process.exit(1);
});
