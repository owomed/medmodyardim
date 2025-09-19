const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Sabit kanal ID'si ve emoji, kod tekrarını önlemek için burada tanımlanabilir.
const TARGET_CHANNEL_ID = '1238040770888339519';
const COWONCY_EMOJI = '<:med_cowoncy:1409892592312651867>';

module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('oy')
        .setDescription('Belirtilen kullanıcının son etiketleme mesajını gösterir')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Oy geçmişini görmek istediğiniz kullanıcı')
                .setRequired(true)),
    
    // Prefix komutu için isim ve açıklama
    name: 'oy',
    description: 'Belirtilen kullanıcının son etiketleme mesajını gösterir',
    aliases: ['oyk'], // İsteğe bağlı, ek takma adlar ekleyebilirsiniz.

    /**
     * Komutun ana mantığını yürüten fonksiyon. Hem slash hem de prefix komutları tarafından çağrılır.
     * @param {import('discord.js').Interaction|import('discord.js').Message} interactionOrMessage
     * @param {import('discord.js').User} targetUser
     */
    async handleOyCommand(interactionOrMessage, targetUser) {
        const client = interactionOrMessage.client;
        const targetChannel = client.channels.cache.get(TARGET_CHANNEL_ID);

        // Hata kontrolü
        if (!targetChannel) {
            const replyMessage = 'Belirtilen kanal bulunamadı. Lütfen kanal ID\'sinin doğru olduğundan emin olun.';
            if (interactionOrMessage.isChatInputCommand()) {
                return interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                return interactionOrMessage.channel.send(replyMessage);
            }
        }

        let targetMessage;
        try {
            targetMessage = await targetChannel.messages.fetch({ limit: 100 })
                .then(messages => messages.find(msg => msg.mentions.users.has(targetUser.id)));
        } catch (error) {
            console.error('Mesajlar alınırken bir hata oluştu:', error);
            const replyMessage = 'Mesajlar alınırken bir hata oluştu.';
            if (interactionOrMessage.isChatInputCommand()) {
                return interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                return interactionOrMessage.channel.send(replyMessage);
            }
        }

        if (!targetMessage) {
            const replyMessage = `${targetUser.username} kullanıcısı bu kanalda etiketlenmemiş.`;
            if (interactionOrMessage.isChatInputCommand()) {
                return interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                return interactionOrMessage.channel.send(replyMessage);
            }
        }

        const messageContent = targetMessage.content;
        let oyCount = null;
        let obCount = null;
        let otCount = null;

        if (messageContent.includes('250000')) {
            oyCount = `10 Oy = ${COWONCY_EMOJI} 250.000`;
            otCount = `100.000 ${COWONCY_EMOJI}`;
            obCount = `350.000 ${COWONCY_EMOJI}`;
        } else if (messageContent.includes('350000')) {
            oyCount = `15 Oy = ${COWONCY_EMOJI} 350.000`;
            otCount = `450.000 ${COWONCY_EMOJI}`;
            obCount = `700.000 ${COWONCY_EMOJI}`;
        } else if (messageContent.includes('100000')) {
            oyCount = `5 Oy = ${COWONCY_EMOJI} 100.000`;
            otCount = `150.000 ${COWONCY_EMOJI}`;
            obCount = `100.000 ${COWONCY_EMOJI}`;
        } else if (messageContent.includes('450000')) {
            oyCount = `20 Oy = ${COWONCY_EMOJI} 450.000`;
            otCount = `100.000 ${COWONCY_EMOJI}`;
            obCount = `1.150.000 ${COWONCY_EMOJI}`;
        } else if (messageContent.includes('600000')) {
            oyCount = `30 Oy = ${COWONCY_EMOJI} 600.000`;
            otCount = `150.000 ${COWONCY_EMOJI}`;
            obCount = `1.750.000 ${COWONCY_EMOJI}`;
        }

        const currentDate = new Date();
        const messageDate = targetMessage.createdAt;
        let monthDifference = '';

        if (currentDate.getMonth() !== messageDate.getMonth() || currentDate.getFullYear() !== messageDate.getFullYear()) {
            monthDifference = `\n\n**UYARI**: Bu mesaj, komutun kullanıldığı aydan farklı bir ayda gönderilmiş!`;
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setThumbnail('https://cdn.discordapp.com/icons/788355812774903809/aed39ddb08e850df0478a079c80d05b7.jpg')
            .setTitle('OwO MED OY SİSTEMİ')
            .setDescription(`**${targetUser.username}** kullanıcısının <#${TARGET_CHANNEL_ID}> kanalından yapılan son ödemesi${monthDifference}`)
            .addFields(
                { name: 'Mesaj', value: messageContent },
                { name: 'Ödenilmiş Oy Parası', value: oyCount || 'Bulunamadı' },
                { name: 'Toplam Ödenilmiş Oy Parası', value: obCount || 'Bulunamadı' },
                { name: 'Ödenilecek oy parası', value: otCount || 'Bulunamadı' },
                { name: 'Ödemeyi yapan', value: targetMessage.author.username },
                { name: 'Mesaj Bağlantısı', value: `[Mesaja Git](${targetMessage.url})` }
            )
            .setTimestamp(targetMessage.createdTimestamp)
            .setFooter({ text: `Mesaj ID: ${targetMessage.id}` });
        
        // Komutu çalıştıran kaynağa (mesaj ya da etkileşim) yanıt gönderme
        if (interactionOrMessage.isChatInputCommand()) {
            await interactionOrMessage.reply({ embeds: [embed] });
        } else {
            await interactionOrMessage.channel.send({ embeds: [embed] });
        }
    },

    // Prefix komutları için metot
    async execute(message, args) {
        if (!args.length) {
            return message.reply("Lütfen bir kullanıcı ID'si girin.").then(msg => {
                setTimeout(() => msg.delete(), 5000);
                message.delete().catch(err => console.error('Orijinal mesaj silinirken hata oluştu:', err));
            });
        }
        
        const targetUserId = args[0];
        let targetUser;
        try {
            targetUser = await message.client.users.fetch(targetUserId);
        } catch (error) {
            console.error(`Kullanıcı ID'si (${targetUserId}) alınırken hata oluştu:`, error);
            return message.channel.send("Girilen ID ile bir kullanıcı bulunamadı.");
        }

        if (!targetUser) {
            return message.channel.send("Girilen ID ile bir kullanıcı bulunamadı.");
        }
        
        await this.handleOyCommand(message, targetUser);
    },

    // Slash komutları için metot
    async interact(interaction) {
        const targetUser = interaction.options.getUser('kullanici');
        await this.handleOyCommand(interaction, targetUser);
    }
};
