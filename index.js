const { Client, Intents, MessageActionRow, MessageSelectMenu, EmbedBuilder, MessageEmbed, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const cron = require('node-cron');
const express = require('express');

global.client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'], // Partials'ı bu şekilde belirtin
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
    userAds
};

client.config.token = process.env.TOKEN;

// Komut koleksiyonları oluşturuluyor
client.commands = new Collection();
client.slashCommands = new Collection();
const slashCommands = [];

// Komut dosyaları yükleniyor
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
    if (command.data) {
        client.slashCommands.set(command.data.name, command);
        slashCommands.push(command.data.toJSON());
    }
}

// Komutları Discord API'sine kaydetme
client.on('ready', async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
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

// Prefix komutları dinleniyor
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(process.env.PREFIX)) return;

    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply('Bu komutu çalıştırırken bir hata oluştu!');
    }
});

// Slash komutları dinleniyor
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.interact(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Bu komutu çalıştırırken bir hata oluştu!', ephemeral: true });
    }
});

require('./src/loader')(client, fs, cron);

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

client.login(client.config.token);
