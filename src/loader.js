// src/loader.js
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client, fs, cron) => {
    // client objesine commands koleksiyonunu ekle
    // Eğer client.commands daha önce tanımlanmadıysa, burada tanımlarız.
    // Bu, botun tüm komutlarını tutacağı yer olacak.
    client.commands = new Collection(); 

    // Cron İşleri
    const cronJobsPath = path.join(__dirname, 'utils', 'cronJobs.js');
    require(cronJobsPath)(client, cron);

    // Mesaj Temizleyici
    const messageCleanerPath = path.join(__dirname, 'utils', 'messageCleaner.js');
    require(messageCleanerPath)(client);

    // Anti-Reklam Sistemi
    const antiAdSystemPath = path.join(__dirname, 'utils', 'antiAdSystem.js');
    require(antiAdSystemPath)(client);

    // Mesaj Sabitleme ve Emoji Oyunu (Varsa)
    // Eğer 'messagePinAndEmojiGame.js' dosyanız 'emojiGame.js' ise,
    // yolunu ona göre güncelleyin. Örneğin: path.join(__dirname, 'events', 'emojiGame.js')
    const messagePinAndEmojiGamePath = path.join(__dirname, 'utils', 'messagePinAndEmojiGame.js'); // Veya src/events/emojiGame.js
    require(messagePinAndEmojiGamePath)(client, fs);

    // YENİ EKLENEN: Otomatik İltifat İçin Mesaj Sayacı
    const messageCounterPath = path.join(__dirname, 'utils', 'messageCounter.js');
    require(messageCounterPath)(client); // client objesini messageCounter modülüne geçir

    // Olay Dinleyicilerini Yükle
    const eventsPath = path.join(__dirname, 'events');
    fs.readdirSync(eventsPath).forEach(file => {
        if (file.endsWith('.js')) {
            const event = require(path.join(eventsPath, file));
            const eventName = file.replace('.js', ''); // Dosya adından olayın adını al
            client.on(eventName, (...args) => event(client, ...args));
            console.log(`Olay yüklendi: ${eventName}`);
        }
    });

    // Komutları Yükle
    const commandsPath = path.join(__dirname, 'commands'); // 'src/commands' klasörünü işaret eder
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Her komut dosyasında 'name' ve 'execute' özellikleri olmalı
        if (command.name && typeof command.execute === 'function') {
            client.commands.set(command.name, command);
            console.log(`Komut yüklendi: ${command.name}`);
        } else {
            console.warn(`[UYARI] ${file} dosyasında 'name' veya 'execute' özelliği eksik. Bu komut yüklenmedi.`);
        }
    }
};