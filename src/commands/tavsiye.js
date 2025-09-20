const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

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
    aliases: ['öneri'],

    // Komutun ana mantığını yürüten bir fonksiyon
    async handleTavsiyeCommand(interactionOrMessage, tavsiyeMesaji) {
        const client = interactionOrMessage.client;
        const tavsiyeKanal = client.channels.cache.get(TAVSIYE_KANAL_ID);
        const user = interactionOrMessage.author || interactionOrMessage.user;

        if (!tavsiyeKanal) {
            const errorMessage = 'Tavsiye kanalı bulunamadı. Lütfen kanal ID\'sinin doğru olduğundan emin olun.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: errorMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(errorMessage);
            }
            return;
        }

        const zamanDamgasi = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', hour12: false, hour: '2-digit', minute: '2-digit' });

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('MED Mod Yardım')
            .setDescription(`**${user} Tavsiye etti 📬**\n\nKullanıcı ID: \`${user.id}\`\nKullanıcı: \`${user.username}\`\n\n**Tavsiye Mesajı:**\n${tavsiyeMesaji}\n\n*Kullanıldığı zaman:*\n${zamanDamgasi}`)
            .setThumbnail(user.displayAvatarURL({ forceStatic: false }))
            .setFooter({ text: 'Tavsiyeleriniz bizim için değerli ❤️' });

        try {
            const tavsiyeMesaj = await tavsiyeKanal.send({ embeds: [embed] });

            await tavsiyeMesaj.react('✅');
            await tavsiyeMesaj.react('❎');

            const feedbackMessage = `Tavsiye mesajı <#${TAVSIYE_KANAL_ID}> kanalına gönderildi.Teşekkür ediyoruz ${user} <:cute_owo:1246376595921436724>`;
            
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: feedbackMessage, ephemeral: false });
            } else {
                if (interactionOrMessage.deletable) {
                    await interactionOrMessage.delete();
                }
                await interactionOrMessage.channel.send(feedbackMessage);
            }
        } catch (error) {
            console.error('Tavsiye gönderilirken bir hata oluştu:', error);
            const errorMessage = 'Tavsiye gönderilirken bir hata oluştu.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: errorMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(errorMessage);
            }
        }
    },

    // Prefix komutları için metot
    async execute(client, message, args) {
        // DM kontrolü
        if (message.channel.type === ChannelType.DM) {
            return message.reply('Bu komut DM\'lerde kullanılamaz.');
        }

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
