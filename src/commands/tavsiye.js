// src/commands/tavsiye.js
const { MessageEmbed } = require('discord.js'); // Orijinal kodunuzdaki gibi MessageEmbed kullanıldı

module.exports = {
    name: 'tavsiye',
    description: 'Sunucu tavsiyesi gönderir',
    async execute(client, message, args) {
        if (!args.length) {
            // Kullanıcıya tavsiye mesajı girmesi gerektiğini belirt
            return message.channel.send('Lütfen bir tavsiye mesajı girin.');
        }

        // Tavsiye mesajını oluştur
        const tavsiyeMesaji = args.join(' ');
        const tavsiyeKanalID = '1235593289315651685'; // Orijinal kanal ID'si korundu
        // Zaman damgası ve zaman dilimi ayarı olduğu gibi bırakıldı
        const zamanDamgasi = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', hour12: false, hour: '2-digit', minute: '2-digit' }); 
        const tavsiyeKanal = client.channels.cache.get(tavsiyeKanalID);

        if (!tavsiyeKanal) {
            return message.channel.send('Tavsiye kanalı bulunamadı. Lütfen kanal ID\'sinin doğru olduğundan emin olun.');
        }

        // Kullanıcının tavsiyesini ve profil fotoğrafını gönder
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('MED Mod Yardım')
            .setDescription(`**${message.author} Tavsiye etti 📬**

Kullanıcı ID: \`${message.author.id}\`
Kullanıcı: \`${message.author.username}\`
            
**Tavsiye Mesajı:**
${tavsiyeMesaji}
            
*Kullanıldığı zaman:*
${zamanDamgasi}`)
            .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true })) // Orijinal format ve dynamic ayarı korundu
            .setFooter('Tavsiyeleriniz bizim için değerli ❤️');

        try {
            // Tavsiye mesajını tavsiye kanalına gönder
            const tavsiyeMesaj = await tavsiyeKanal.send({ embeds: [embed] });

            // Emojileri tavsiye mesajına ekle
            await tavsiyeMesaj.react('✅');
            await tavsiyeMesaj.react('❎');

            // Orijinal tavsiye mesajını sil
            // Orijinal kodunuzda olduğu gibi, mesajın silinebilir olup olmadığı kontrol edilmiyor.
            await message.delete();
            // Tavsiye gönderildikten sonra kullanıcıya geri bildirim mesajı
            message.channel.send(`Tavsiye mesajı <#1235593289315651685> kanalına gonderildi.Teşekkür ediyoruz ${message.author} <:cute_owo:1246376595921436724>`);

        } catch (error) {
            console.error('Tavsiye gönderilirken bir hata oluştu:', error);
            // Hata durumunda kullanıcıya geri bildirim gönder
            message.channel.send('Tavsiye gönderilirken bir hata oluştu.');
        }
    },
};