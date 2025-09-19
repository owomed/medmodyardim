const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

// Puan tablosu dosyasının yolu
const pointsFilePath = './points.json';

// Komutu kullanabilecek rolün ID'si
const allowedRoleId = '1236317902295138304';

// Komut objesi
module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('tablosf')
        .setDescription('Puan tablosunu gösterir ve ardından sıfırlar.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // Yalnızca yöneticilerin kullanabilmesini sağlar

    // Prefix komutu için ad
    name: 'agayapsuisi',
    description: 'Puan tablosunu gösterir ve ardından sıfırlar',
    aliases: ['tablosf'], // Slash komutu adını takma ad olarak ekler

    // Bu komutun işleyeceği ana fonksiyon
    async handleCommand(interactionOrMessage) {
        const client = interactionOrMessage.client;

        // Rol kontrolü: Prefix komutu için orijinal yetki kontrolünü koruyoruz.
        if (!interactionOrMessage.member.roles.cache.has(allowedRoleId) && !interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const replyMessage = 'Bu komutu kullanma izniniz yok.';
            if (interactionOrMessage.isChatInputCommand()) {
                await interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(replyMessage);
                await interactionOrMessage.delete().catch(console.error);
            }
            return;
        }

        // Puanları JSON dosyasından yükle
        let points = {};
        if (fs.existsSync(pointsFilePath)) {
            const fileContent = fs.readFileSync(pointsFilePath, 'utf-8');
            if (fileContent.trim()) {
                try {
                    points = JSON.parse(fileContent);
                } catch (error) {
                    console.error('Puan dosyası okunurken JSON ayrıştırma hatası:', error);
                    points = {};
                }
            }
        }

        const currentPoints = { ...points };

        const embed = new EmbedBuilder()
            .setTitle('Puan Tablosu')
            .setDescription('Tahmin oyunundaki güncel puan durumu:')
            .setColor('Red')
            .addFields(
                {
                    name: 'Puanlar',
                    value: Object.entries(currentPoints).length > 0
                        ? Object.entries(currentPoints)
                            .map(([userId, data]) => `<@${userId}>: ${data.score} puan`)
                            .join('\n')
                        : 'Henüz kimse puan kazanmadı.'
                }
            );

        // Puan tablosunu göster
        if (interactionOrMessage.isChatInputCommand()) {
            await interactionOrMessage.reply({ embeds: [embed] });
        } else {
            await interactionOrMessage.channel.send({ embeds: [embed] });
        }
        
        // Global puan değişkenini sıfırla ve dosyayı silerek kaydet
        if (fs.existsSync(pointsFilePath)) {
            fs.unlinkSync(pointsFilePath); // Dosyayı silerek sıfırlama
        }
        
        const successMessage = 'Puan tablosu sıfırlandı.';
        if (interactionOrMessage.isChatInputCommand()) {
            await interactionOrMessage.followUp({ content: successMessage, ephemeral: false });
        } else {
            await interactionOrMessage.channel.send(successMessage);
        }
    },

    /**
     * Prefix komutları için metot
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        await this.handleCommand(message);
    },

    /**
     * Slash komutları için metot
     * @param {import('discord.js').Interaction} interaction
     */
    async interact(interaction) {
        await this.handleCommand(interaction);
    }
};
