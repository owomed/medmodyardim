const { Events, ChannelType } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Eğer mesaj parçalıysa (tamamlanmamışsa), tam halini almaya çalış.
        // Bu, botun çevrimdışıyken gönderilen mesajları işlerken yaşanabilecek hataları önler.
        if (message.partial) {
            try {
                await message.fetch();
            } catch (error) {
                console.error('Parçalı mesaj işlenirken bir hata oluştu:', error);
                return; // Hata durumunda işlemi durdur
            }
        }
        
        const client = message.client;

        // Botların kendi mesajlarını veya DM'leri göz ardı et
        // "message.author" artık 'undefined' olmayacak, çünkü parçalı mesaj kontrolü yapıldı.
        if (message.author.bot || message.channel.type === ChannelType.DM) return;

        // Diğer özel sistemler ve prefixli komut işleyicisi
        const CHANNEL1_ID = client.config.CHANNEL1_ID;
        const EMOJI = '1235321947035013231';

        if (message.channel.id === CHANNEL1_ID) {
            message.react(EMOJI).catch(err => console.error('Emoji tepki hatası:', err));
        }

        const prefix = client.config.PREFIX || '!';

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (cmd) {
            try {
                await cmd.execute(message, args);
            } catch (error) {
                console.error(`Komut çalıştırılırken bir hata oluştu: ${commandName}`, error);
                message.reply('Bu komutu çalıştırırken bir hata oluştu! Lütfen daha sonra tekrar deneyin.');
            }
        }
    }
};
