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

    // Bu komutun işleyeceği ana fonksiyon
    async handleCommand(interactionOrMessage) {
        const client = interactionOrMessage.client;

        // Rol kontrolü: Prefix komutu için senin orijinal isteğini koruyoruz.
        if (!interactionOrMessage.isChatInputCommand()) {
            if (!interactionOrMessage.member.roles.cache.has(allowedRoleId)) {
                return interactionOrMessage.channel.send('Bu komutu kullanma izniniz yok.');
            }
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
        
        // Global puan değişkenini sıfırla ve dosyaya kaydet
        if (fs.existsSync(pointsFilePath)) {
            fs.unlinkSync(pointsFilePath); // Dosyayı silerek sıfırlama
        }
        
        const successMessage = 'Puan tablosu sıfırlandı.';
        if (interactionOrMessage.isChatInputCommand()) {
            // İlk yanıtı düzenle veya yeni bir yanıt gönder
            await interactionOrMessage.followUp({ content: successMessage, ephemeral: false });
        } else {
            await interactionOrMessage.channel.send(successMessage);
        }
    },

    // Prefix komutları için metot
    async execute(client, message) {
        await this.handleCommand(message);
    },

    // Slash komutları için metot
    async interact(interaction) {
        await this.handleCommand(interaction);
    }
};

// Not: Bu dosyada bulunan `resetGame` ve `revealNumber` fonksiyonları
// ana `execute` akışınızın bir parçası değildir. Bu fonksiyonlar,
// botunuzun ana dosyasındaki (index.js) bir oyun döngüsü tarafından
// yönetilmelidir. Bu dosya sadece komutun kendisini içerir.
// Eğer bu fonksiyonları kullanacaksanız, ana dosyanızda
// `client` objesi üzerinde yönettiğinizden emin olun.
