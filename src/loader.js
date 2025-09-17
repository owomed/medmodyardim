const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
    // Komutları saklamak için bir Collection oluştur
    client.commands = new Collection();
    
    // Olay Dinleyicilerini Yükle
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        const eventName = file.replace('.js', '');

        // `once` olayı için özel işlem (örn. `ready` olayı)
        if (event.once) {
            client.once(eventName, (...args) => event(client, ...args));
        } else {
            client.on(eventName, (...args) => event(client, ...args));
        }
        console.log(`Olay yüklendi: ${eventName}`);
    }

    // Komutları Yükle
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('name' in command && 'execute' in command) {
            client.commands.set(command.name, command);
            console.log(`Komut yüklendi: ${command.name}`);
        } else {
            console.warn(`[UYARI] ${file} dosyasında 'name' veya 'execute' özelliği eksik. Bu komut yüklenmedi.`);
        }
    }

    // Ekstra Modülleri Yükle
    const utilsPath = path.join(__dirname, 'utils');
    const utilityFiles = fs.readdirSync(utilsPath).filter(file => file.endsWith('.js'));
    
    // Her bir yardımcı modülü yükle
    for (const file of utilityFiles) {
        const filePath = path.join(utilsPath, file);
        const module = require(filePath);
        module(client); // Bu modüller zaten client objesini bekliyor
        console.log(`Yardımcı modül yüklendi: ${file}`);
    }
};
