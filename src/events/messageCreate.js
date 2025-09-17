const { ChannelType } = require('discord.js');

module.exports = async (client, message) => {
    // Botların kendi mesajlarını veya DM'leri (özel mesajları) göz ardı et
    if (message.author.bot || message.channel.type === ChannelType.DM) return;

    // Prefixi client.config'ten al. Eğer tanımlı değilse varsayılan olarak '!' kullan.
    const prefix = client.config.PREFIX || '!';

    // --- ÖZEL SİSTEMLER ---

    // Yukarı/Emoji Tepki Sistemi
    // client.config.CHANNEL1_ID ve EMOJI ID'nizin doğru olduğundan emin olun
    const CHANNEL1_ID = client.config.CHANNEL1_ID;
    const EMOJI = '1235321947035013231';

    if (message.channel.id === CHANNEL1_ID) {
        message.react(EMOJI).catch(err => console.error('Emoji tepki hatası:', err));
    }

    // Mesaj prefix ile başlamıyorsa, buradan çık (çünkü yukarıdaki özel durumlar işlendi)
    if (!message.content.startsWith(prefix)) return;

    // --- GENEL PREFİXLİ KOMUT İŞLEYİCİ ---

    // Mesajı argümanlara ve komut adına ayır
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const commandName = args.shift().toLowerCase();

    // client.commands koleksiyonunda komutu veya takma adını ara
    const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

    // Eğer komut bulunursa çalıştır
    if (cmd) {
        try {
            await cmd.execute(client, message, args);
        } catch (error) {
            console.error(`Komut çalıştırılırken bir hata oluştu: ${commandName}`, error);
            message.reply('Bu komutu çalıştırırken bir hata oluştu! Lütfen daha sonra tekrar deneyin.');
        }
    }
};
