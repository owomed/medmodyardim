// src/commands/tavsiye.js
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

// Sabit kanal ID'si
const TAVSIYE_KANAL_ID = '1235593289315651685';

module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('tavsiye')
        .setDescription('Sunucuya tavsiye gönderir.')
        .addStringOption(option =>
            option.setName('mesaj')
                .setDescription('Göndermek istediğiniz tavsiye mesajı')
                .setRequired(true)),
    
    // Prefix komutu için isim ve açıklama
    name: 'tavsiye',
    description: 'Sunucu tavsiyesi gönderir.',
    aliases: ['öneri'], // İsteğe bağlı, ek takma ad ekleyebilirsiniz.

    // Komutun ana mantığını yürüten bir fonksiyon oluşturalım.
    async handleTavsiyeCommand(interactionOrMessage, tavsiyeMesaji) {
        const client = interactionOrMessage.client;
        const tavsiyeKanal = client.channels.cache.get(TAVSIYE_KANAL_ID);
        const user = interactionOrMessage.author || interactionOrMessage.user;

        if (!tavsiyeKanal) {
            return interactionOrMessage.reply ? await interactionOrMessage.reply('Tavsiye kanalı bulunamadı. Lütfen kanal ID\'sinin doğru olduğundan emin olun.') :
                interactionOrMessage.channel.send('Tavsiye kanalı bulunamadı. Lütfen kanal ID\'sinin doğru olduğundan emin olun.');
        }

        const zamanDamgasi = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', hour12: false, hour: '2-digit', minute: '2-digit' });

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('MED Mod Yardım')
            .setDescription(`**${user} Tavsiye etti 📬**

Kullanıcı ID: \`${user.id}\`
Kullanıcı: \`${user.username}\`
            
**Tavsiye Mesajı:**
${tavsiyeMesaji}
            
*Kullanıldığı zaman:*
${zamanDamgasi}`)
            .setThumbnail(user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setFooter('Tavsiyeleriniz bizim için değerli ❤️');

        try {
            // Tavsiye mesajını tavsiye kanalına gönder
            const tavsiyeMesaj = await tavsiyeKanal.send({ embeds: [embed] });

            // Emojileri tavsiye mesajına ekle
            await tavsiyeMesaj.react('✅');
            await tavsiyeMesaj.react('❎');

            // Kullanıcıya geri bildirim mesajı gönder
            const feedbackMessage = `Tavsiye mesajı <#${TAVSIYE_KANAL_ID}> kanalına gönderildi.Teşekkür ediyoruz ${user} <:cute_owo:1246376595921436724>`;
            
            if (interactionOrMessage.reply) {
                // Slash komutları için görünür yanıt
                await interactionOrMessage.reply({ content: feedbackMessage, ephemeral: false });
            } else {
                // Prefix komutları için orijinal mesajı sil ve yeni mesaj gönder
                if (interactionOrMessage.deletable) {
                    await interactionOrMessage.delete();
                }
                await interactionOrMessage.channel.send(feedbackMessage);
            }

        } catch (error) {
            console.error('Tavsiye gönderilirken bir hata oluştu:', error);
            // Hata durumunda kullanıcıya geri bildirim gönder
            const errorMessage = 'Tavsiye gönderilirken bir hata oluştu.';
            if (interactionOrMessage.reply) {
                await interactionOrMessage.reply({ content: errorMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(errorMessage);
            }
        }
    },

    // Prefix komutları için metot
    async execute(client, message, args) {
        const tavsiyeMesaji = args.join(' ');
        if (!tavsiyeMesaji) {
            return message.channel.send('Lütfen bir tavsiye mesajı girin.');
        }
        await this.handleTavsiyeCommand(message, tavsiyeMesaji);
    },

    // Slash komutları için metot
    async interact(interaction) {
        const tavsiyeMesaji = interaction.options.getString('mesaj');
        await this.handleTavsiyeCommand(interaction, tavsiyeMesaji);
    }
};
