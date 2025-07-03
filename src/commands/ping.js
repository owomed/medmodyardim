// src/commands/ping.js
module.exports = {
    name: 'ping',
    description: 'Botun pingini gösterir.', // Daha anlaşılır olması için description eklendi
    execute(client, message) {
        message.channel.send(`😉 yaptığım botun pingi :D => **${client.ws.ping}ms**`);
    },
};