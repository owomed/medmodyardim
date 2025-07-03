// src/commands/oy.js
const { MessageEmbed } = require('discord.js'); // Orijinal kodunuzdaki gibi MessageEmbed kullanıldı.

module.exports = {
    name: 'oy',
    description: 'Belirtilen kullanıcının son etiketleme mesajını gösterir',
    async execute(client, message, args) {
        if (!args.length) {
            // Kullanıcıya ID girmesi gerektiğini belirt ve mesajı sil (isteğe bağlı, ilgi komutundaki gibi)
            return message.reply("Lütfen bir kullanıcı ID'si girin.").then(msg => {
                setTimeout(() => msg.delete(), 5000); 
                message.delete().catch(err => console.error('Orijinal mesaj silinirken hata oluştu:', err));
            }).catch(err => console.error('Uyarı mesajı gönderilirken hata oluştu:', err));
        }

        const targetUserId = args[0];
        let targetUser;
        try {
            targetUser = await client.users.fetch(targetUserId);
        } catch (error) {
            console.error(`Kullanıcı ID'si (${targetUserId}) alınırken hata oluştu:`, error);
            return message.channel.send("Girilen ID ile bir kullanıcı bulunamadı.");
        }

        if (!targetUser) { // fetch hata fırlatmazsa ama yine de bulunamazsa diye kontrol
            return message.channel.send("Girilen ID ile bir kullanıcı bulunamadı.");
        }

        const targetChannelId = '1238040770888339519'; // Sabit kanal ID'si
        const targetChannel = client.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            return message.channel.send('Belirtilen kanal bulunamadı. Lütfen kanal ID\'sinin doğru olduğundan emin olun.');
        }

        let targetMessage;
        try {
            // Sadece etiketlenen mesajları getirmek için filter kullanıldı.
            targetMessage = await targetChannel.messages.fetch({ limit: 100 })
                .then(messages => messages.find(msg => msg.mentions.users.has(targetUser.id)));
        } catch (error) {
            console.error('Mesajlar alınırken bir hata oluştu:', error);
            return message.channel.send('Mesajlar alınırken bir hata oluştu.');
        }

        if (!targetMessage) {
            return message.channel.send(`${targetUser.username} kullanıcısı bu kanalda etiketlenmemiş.`);
        }

        const messageContent = targetMessage.content;
        let oyCount = null;
        let obCount = null;
        let otCount = null;

        if (messageContent.includes('250000')) {
            oyCount = '10 Oy = <:Med_cowoncy:1235298123971170417> 250.000';
            otCount = '100.000 <:Med_cowoncy:1235298123971170417>';
            obCount = '350.000 <:Med_cowoncy:1235298123971170417>';
        } else if (messageContent.includes('350000')) {
            oyCount = '15 Oy = <:Med_cowoncy:1235298123971170417> 350.000';
            otCount = '450.000 <:Med_cowoncy:1235298123971170417>';
            obCount = '700.000 <:Med_cowoncy:1235298123971170417>';
        } else if (messageContent.includes('100000')) {
            oyCount = '5 Oy = <:Med_cowoncy:1235298123971170417> 100.000';
            otCount = '150.000 <:Med_cowoncy:1235298123971170417>';
            obCount = '100.000 <:Med_cowoncy:1235298123971170417>';
        } else if (messageContent.includes('450000')) {
            oyCount = '20 Oy = <:Med_cowoncy:1235298123971170417> 450.000';
            otCount = '100.000 <:Med_cowoncy:1235298123971170417>';
            obCount = '1.150.000 <:Med_cowoncy:1235298123971170417>';
        } else if (messageContent.includes('600000')) {
            oyCount = '30 Oy = <:Med_cowoncy:1235298123971170417> 600.000';
            otCount = '150.000 <:Med_cowoncy:1235298123971170417>';
            obCount = '1.750.000 <:Med_cowoncy:1235298123971170417>';
        }

        const currentDate = new Date();
        const messageDate = targetMessage.createdAt;

        let monthDifference = '';
        if (currentDate.getMonth() !== messageDate.getMonth() || currentDate.getFullYear() !== messageDate.getFullYear()) {
            monthDifference = `\n\n**UYARI**: Bu mesaj, komutun kullanıldığı aydan farklı bir ayda gönderilmiş!`;
        }

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setThumbnail('https://cdn.discordapp.com/icons/788355812774903809/aed39ddb08e850df0478a079c80d05b7.jpg')
            .setTitle('OwO MED OY SİSTEMİ')
            .setDescription(`**${targetUser.username}** kullanıcısının <#${targetChannelId}> kanalından yapılan son ödemesi${monthDifference}`)
            .addFields( // .addField yerine .addFields kullanıldı (daha temiz)
                { name: 'Mesaj', value: targetMessage.content },
                { name: 'Ödenilmiş Oy Parası', value: oyCount || 'Bulunamadı' },
                { name: 'Toplam Ödenilmiş Oy Parası', value: obCount || 'Bulunamadı' },
                { name: 'Ödenilecek oy parası', value: otCount || 'Bulunamadı' },
                { name: 'Ödemeyi yapan', value: targetMessage.author.username },
                { name: 'Mesaj Bağlantısı', value: `[Mesaja Git](${targetMessage.url})` } // Mesaj bağlantısı eklendi
            )
            .setTimestamp(targetMessage.createdTimestamp)
            .setFooter(`Mesaj ID: ${targetMessage.id}`);

        // Orijinal mesajı silme isteği varsa, buraya ekleyebilirsiniz:
        // if (message.deletable) {
        //     try {
        //         await message.delete();
        //     } catch (error) {
        //         console.error('Orijinal mesaj silinirken bir hata oluştu:', error);
        //     }
        // }

        message.channel.send({ embeds: [embed] });
    },
};