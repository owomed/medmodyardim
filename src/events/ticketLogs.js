const { ChannelType } = require('discord.js');

module.exports = async (client, type, guild, user) => {
    // .env dosyasından log kanalı ID'sini al
    const logChannelId = process.env.LOG_CHANNEL_ID;

    // Eğer log kanalı ID'si tanımlı değilse, loglama yapma ve bilgi mesajı göster
    if (!logChannelId) {
        console.log('Log kanalı ID\'si .env dosyasında tanımlanmamış. Ticket logları gönderilmeyecek.');
        return;
    }

    try {
        // Log kanalını fetch (getir) et
        const logChannel = await client.channels.fetch(logChannelId);

        // Kanal bulunamadıysa veya bir metin kanalı değilse hata logla
        if (!logChannel || logChannel.type !== ChannelType.GuildText) {
            console.error(`HATA: Belirtilen log kanalı (${logChannelId}) bulunamadı veya bir metin kanalı değil.`);
            return;
        }

        // Ticket tipi değerine göre log mesajını gönder
        switch (type) {
            case 'createTicket':
                return logChannel.send(`${user.tag} az önce **${guild.name}** sunucusunda bir **yeni bilet** oluşturdu.`);
            
            case 'closeTicket':
                return logChannel.send(`${user.tag} az önce **${guild.name}** sunucusundaki bir bileti **kapattı**.`);
            
            case 'reopenTicket':
                return logChannel.send(`${user.tag}, **${guild.name}** sunucusunda bir bileti **yeniden açtı**.`);
            
            case 'deleteTicket':
                return logChannel.send(`${user.tag} az önce **${guild.name}** sunucusundaki bir bileti **sildi**.`);
            
            case 'saveTicket':
                return logChannel.send(`${user.tag} az önce **${guild.name}** sunucusuna bir bilet **kaydetti**.`);
            
            default:
                console.warn(`Bilinmeyen ticket log tipi: ${type}`);
                return logChannel.send(`Bilinmeyen bir bilet eylemi gerçekleşti: **${type}** tarafından ${user.tag} (${user.id})`);
        }
    } catch (error) {
        console.error(`Ticket logları gönderilirken bir hata oluştu:`, error);
    }
};
