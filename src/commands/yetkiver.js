// src/commands/yetkiver.js
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: 'yetkiver',
    description: 'Belirtilen kişiye yetki verir',
    async execute(client, message, args) {
        const allowedRoleIDs = ['1236317902295138304', '1216094391060529393'];

        // Kullanıcının yetkili rollerden herhangi birine sahip olup olmadığını kontrol et
        if (!message.member || !message.member.roles.cache.some(role => allowedRoleIDs.includes(role.id))) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!target) {
            return message.channel.send('Lütfen geçerli bir kullanıcı etiketleyin veya ID girin.');
        }

        // Rol ID'leri ve isimleri tanımlandı
        const roles = {
            kayit: {
                ids: ['1189127683653783552', '1236394142788091995'],
                name: 'Kayıt Yetkilisi'
            },
            gorevli: {
                ids: ['1236282803675467776', '1238598132745506856'],
                name: 'Görevli'
            },
            menajer: {
                ids: ['1236290869716455495', '1238598537948954824', '1234829842889838643'],
                name: 'Menajer'
            },
            yetkili: {
                ids: ['833410743951949825'],
                name: 'Yetkili'
            },
            gardiyan: {
                ids: ['1236297871020658751', '1236391984415903815'],
                name: 'Gardiyan'
            },
            tmoderator: {
                ids: ['1236294590626267197','1236395447711694940'],
                name: 'T Moderatör'
            },
            moderator: { // Bu, önceki "moderator" anahtarını geçersiz kılacaktır.
                ids: ['1236314485547860069', '1236396201180659803'],
                name: 'Moderatör'
            },
            admin: {
                ids: ['1236317902295138304'],
                name: 'Admin'
            }
        };

        // Select Menu için seçenekler oluşturuldu
        const roleOptions = [
            { label: 'Kayıt Yetkilisi', description: 'Kayıt yetkisi verilecek', value: 'kayit' },
            { label: 'Görevli', description: 'Görevli yetkisi verilecek', value: 'gorevli' },
            { label: 'Menajer', description: 'Sunucu menajer yetkisi verilecek', value: 'menajer' },
            { label: 'Yetkili', description: 'Sunucu yetkili yetkisi verilecek', value: 'yetkili' },
            { label: 'Gardiyan', description: 'Sunucu gardiyan yetkisi verilecek', value: 'gardiyan' },
            { label: 'T Moderatör', description: 'Sunucu T Moderatör yetkisi verilecek', value: 'tmoderator' },
            { label: 'Moderatör', description: 'Sunucu Moderatör yetkisi verilecek', value: 'moderator' },
            { label: 'Admin', description: 'Sunucu Admin yetkisi verilecek', value: 'admin' },
        ];

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('roleSelect')
                .setPlaceholder('Bir yetki seçin...')
                .addOptions(roleOptions)
        );

        const initialEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Yetki Verme Menüsü')
            .setDescription(`${target} kişisine vermek istediğiniz yetkiyi seçin.`);

        const msg = await message.channel.send({
            embeds: [initialEmbed],
            components: [row],
        });

        const filter = (interaction) => {
            return (
                interaction.isSelectMenu() &&
                interaction.customId === 'roleSelect' &&
                interaction.user.id === message.author.id
            );
        };

        const collector = msg.createMessageComponentCollector({
            filter,
            time: 60000, // 60 saniye zaman aşımı
        });

        collector.on('collect', async (interaction) => {
            const selectedRoleKey = interaction.values[0];
            const selectedRoleInfo = roles[selectedRoleKey];

            if (selectedRoleInfo) {
                try {
                    await target.roles.add(selectedRoleInfo.ids);

                    // Başarıyla verilen yetkileri listeleyen bir embed oluşturuldu
                    const grantedRolesList = selectedRoleInfo.ids
                        .map(id => {
                            const role = message.guild.roles.cache.get(id);
                            return role ? `${role.toString()}` : `<@&${id}> (Rol bulunamadı)`;
                        })
                        .join('\n');

                    const successEmbed = new MessageEmbed()
                        .setColor('#00ff00') // Yeşil renk başarıyı gösterir
                        .setTitle('Yetki Verme Tamamlandı!')
                        .setDescription(`${target} kişisine aşağıdaki yetkiler verildi:\n${grantedRolesList}`);

                    await interaction.update({
                        embeds: [successEmbed], // Yeni embed'i gönder
                        components: [], // Menüyü kapat
                    });

                    // İşlem tamamlandığında collector'ı durdur
                    collector.stop('role_granted');

                } catch (error) {
                    console.error("Rol atarken bir hata oluştu:", error);
                    const errorEmbed = new MessageEmbed()
                        .setColor('#ff0000') // Kırmızı renk hatayı gösterir
                        .setTitle('❌ Yetki Verme Hatası!')
                        .setDescription(`Bir hata oluştu ve ${selectedRoleInfo.name} yetkisi ${target} kişisine verilemedi. Lütfen botun izinlerini ve rol hiyerarşisini kontrol edin.`);

                    await interaction.update({
                        embeds: [errorEmbed],
                        components: [],
                    });
                    collector.stop('error');
                }
            } else {
                const invalidEmbed = new MessageEmbed()
                    .setColor('#ffcc00') // Sarı renk uyarıyı gösterir
                    .setTitle('⚠️ Geçersiz Seçim!')
                    .setDescription('Geçersiz bir yetki seçimi yapıldı. Lütfen tekrar deneyin.');

                await interaction.update({
                    embeds: [invalidEmbed],
                    components: [],
                });
                collector.stop('invalid_selection');
            }
        });

        collector.on('end', async (collected, reason) => {
            // Eğer işlem "role_granted", "error" veya "invalid_selection" gibi başarılı bir şekilde durdurulduysa
            // "time" zaman aşımı mesajını gönderme.
            if (reason === 'time' && collected.size === 0) {
                const timeoutEmbed = new MessageEmbed()
                    .setColor('#ffcc00') // Sarı renk uyarıyı gösterir
                    .setTitle('⏱️ İşlem Zaman Aşımına Uğradı!')
                    .setDescription('Yetki seçme işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.');
                
                await msg.edit({ embeds: [timeoutEmbed], components: [] }).catch(console.error);
            }
        });
    },
};
