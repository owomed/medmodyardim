const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
    // Komutları saklamak için Collection'ları oluştur
    client.commands = new Collection();
    client.slashCommands = new Collection(); // Slash komutları için yeni Collection

    // Olay Dinleyicilerini Yükle
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        // Olay dosyasının doğru yapıda olup olmadığını kontrol et
        if (event.name && event.execute) {
            const eventName = event.name;
            if (event.once) {
                client.once(eventName, (...args) => event.execute(client, ...args));
            } else {
                client.on(eventName, (...args) => event.execute(client, ...args));
            }
            console.log(`[EVENT] ${eventName} olayı yüklendi.`);
        } else {
            console.warn(`[UYARI] ${file} dosyası geçerli bir olay dosyası değil.`);
        }
    }

    // Komutları Yükle
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        // Komutun tipini kontrol et
        if (command.data && command.data.name) { // Eğer slash komutuysa
            client.slashCommands.set(command.data.name, command);
            console.log(`[KOMUT] Slash Komut yüklendi: ${command.data.name}`);
        } else if ('name' in command && 'execute' in command) { // Eğer normal (ön-ekli) komutsa
            client.commands.set(command.name, command);
            console.log(`[KOMUT] Normal Komut yüklendi: ${command.name}`);
        } else {
            console.warn(`[UYARI] ${file} dosyasında 'data' veya 'name/execute' özelliği eksik. Bu komut yüklenmedi.`);
        }
    }

    // Ekstra Modülleri Yükle
    const utilsPath = path.join(__dirname, 'utils');
    const utilityFiles = fs.readdirSync(utilsPath).filter(file => file.endsWith('.js'));
    
    for (const file of utilityFiles) {
        const filePath = path.join(utilsPath, file);
        const module = require(filePath);
        module(client);
        console.log(`[MODÜL] Yardımcı modül yüklendi: ${file}`);
    }
};
