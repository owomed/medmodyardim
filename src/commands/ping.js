// src/commands/ping.js
module.exports = {
    name: 'ping',
    description: 'Botun gecikmesini gösterir.',
    execute(message, args) {
        // execute fonksiyonu message ve args parametrelerini almalı
        message.channel.send('Pong!');
    }
};
