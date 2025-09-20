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
        
        // Hatanın yaşandığı yer burası. `message.author` artık 'undefined' olmayacak,
        // çünkü parçalı mesaj kontrolü yapıldı ve bu satıra gelinmeden önce mesaj tamamlanmış olacak.
        if (message.author.bot || message.channel.type === ChannelType.DM) {
            return;
        }

        const client = message.client;

        // --- ÖZEL SİSTEMLER ---

        // Yukarı/Emoji Tepki Sistemi
        const CHANNEL1_ID = client.config.CHANNEL1_ID;
        const EMOJI = '1235321947035013231';

        if (message.channel.id === CHANNEL1_ID) {
            message.react(EMOJI).catch(err => console.error('Emoji tepki hatası:', err));
        }

        // Mesaj prefix ile başlamıyorsa, buradan çık
        const prefix = client.config.PREFIX || '!';
        if (!message.content.startsWith(prefix)) {
            return;
        }

        // --- GENEL PREFİXLİ KOMUT İŞLEYİCİ ---

        // Mesajı argümanlara ve komut adına ayır
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        // client.commands koleksiyonunda komutu veya takma adını ara
        const cmd = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName));

        // Eğer komut bulunursa çalıştır
        if (cmd) {
            try {
                // Komut dosyasının 'execute' metoduna sadece 'message' ve 'args' argümanlarını gönder
                await cmd.execute(message, args);
            } catch (error) {
                console.error(`Komut çalıştırılırken bir hata oluştu: ${commandName}`, error);
                message.reply('Bu komutu çalıştırırken bir hata oluştu! Lütfen daha sonra tekrar deneyin.');
            }
        }
    }
};
