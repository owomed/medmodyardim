const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');

// Rol ID'leri ve isimleri tanımlandı
const ROLES = {
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
        ids: ['1236294590626267197', '1236395447711694940'],
        name: 'T Moderatör'
    },
    moderator: {
        ids: ['1236314485547860069', '1236396201180659803'],
        name: 'Moderatör'
    },
    admin: {
        ids: ['1236317902295138304'],
        name: 'Admin'
    }
};

const ALLOWED_ROLE_IDS = ['1236317902295138304', '1216094391060529393'];

// Select Menu için seçenekler oluşturuldu
const ROLE_OPTIONS = [
    { label: 'Kayıt Yetkilisi', description: 'Kayıt yetkisi verilecek', value: 'kayit' },
    { label: 'Görevli', description: 'Görevli yetkisi verilecek', value: 'gorevli' },
    { label: 'Menajer', description: 'Sunucu menajer yetkisi verilecek', value: 'menajer' },
    { label: 'Yetkili', description: 'Sunucu yetkili yetkisi verilecek', value: 'yetkili' },
    { label: 'Gardiyan', description: 'Sunucu gardiyan yetkisi verilecek', value: 'gardiyan' },
    { label: 'T Moderatör', description: 'Sunucu T Moderatör yetkisi verilecek', value: 'tmoderator' },
    { label: 'Moderatör', description: 'Sunucu Moderatör yetkisi verilecek', value: 'moderator' },
    { label: 'Admin', description: 'Sunucu Admin yetkisi verilecek', value: 'admin' },
];

module.exports = {
    // Slash komutu verisi
    data: new SlashCommandBuilder()
        .setName('yetkiver')
        .setDescription('Belirtilen kişiye yetki verir')
        .addMentionableOption(option =>
            option.setName('kullanici')
                .setDescription('Yetki verilecek kullanıcı')
                .setRequired(true)),

    // Prefix komutu için isim ve açıklama
    name: 'yetkiver',
    description: 'Belirtilen kişiye yetki verir.',

    // Komutun ana mantığını yürüten bir fonksiyon
    async handleYetkiVerCommand(interactionOrMessage, target) {
        const author = interactionOrMessage.author || interactionOrMessage.user;

        if (!target) {
            const replyMessage = 'Lütfen geçerli bir kullanıcı etiketleyin veya ID girin.';
            if (interactionOrMessage.isChatInputCommand?.()) {
                await interactionOrMessage.reply({ content: replyMessage, ephemeral: true });
            } else {
                await interactionOrMessage.channel.send(replyMessage);
            }
            return;
        }

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('roleSelect')
                .setPlaceholder('Bir yetki seçin...')
                .addOptions(ROLE_OPTIONS)
        );

        const initialEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Yetki Verme Menüsü')
            .setDescription(`${target} kişisine vermek istediğiniz yetkiyi seçin.`);

        const messageToCollect = await (interactionOrMessage.isChatInputCommand?.()
            ? interactionOrMessage.reply({ embeds: [initialEmbed], components: [row], ephemeral: true, fetchReply: true })
            : interactionOrMessage.channel.send({ embeds: [initialEmbed], components: [row] })
        );
        
        const collector = messageToCollect.createMessageComponentCollector({
            filter: (i) => i.customId === 'roleSelect' && i.user.id === author.id,
            time: 60000,
        });

        collector.on('collect', async (interaction) => {
            const selectedRoleKey = interaction.values[0];
            const selectedRoleInfo = ROLES[selectedRoleKey];

            if (selectedRoleInfo) {
                try {
                    await target.roles.add(selectedRoleInfo.ids);

                    const grantedRolesList = selectedRoleInfo.ids
                        .map(id => {
                            const role = interaction.guild.roles.cache.get(id);
                            return role ? `${role.toString()}` : `<@&${id}> (Rol bulunamadı)`;
                        })
                        .join('\n');

                    const successEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('Yetki Verme Tamamlandı!')
                        .setDescription(`${target} kişisine aşağıdaki yetkiler verildi:\n${grantedRolesList}`);

                    await interaction.update({
                        embeds: [successEmbed],
                        components: [],
                    });
                } catch (error) {
                    console.error("Rol atarken bir hata oluştu:", error);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Yetki Verme Hatası!')
                        .setDescription(`Bir hata oluştu ve ${selectedRoleInfo.name} yetkisi ${target} kişisine verilemedi. Lütfen botun izinlerini ve rol hiyerarşisini kontrol edin.`);

                    await interaction.update({
                        embeds: [errorEmbed],
                        components: [],
                    });
                }
            } else {
                const invalidEmbed = new EmbedBuilder()
                    .setColor('#ffcc00')
                    .setTitle('⚠️ Geçersiz Seçim!')
                    .setDescription('Geçersiz bir yetki seçimi yapıldı. Lütfen tekrar deneyin.');

                await interaction.update({
                    embeds: [invalidEmbed],
                    components: [],
                });
            }
            collector.stop();
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#ffcc00')
                    .setTitle('⏱️ İşlem Zaman Aşımına Uğradı!')
                    .setDescription('Yetki seçme işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.');

                if (messageToCollect.editable) {
                    await messageToCollect.edit({ embeds: [timeoutEmbed], components: [] }).catch(console.error);
                }
            }
        });
    },

    // Prefix komutları için metot
    async execute(client, message, args) {
        if (!message.guild) {
            return;
        }

        const member = await message.guild.members.fetch(message.author.id).catch(err => {
            console.error("Yetkiver komutunda üye çekme hatası:", err);
            return null;
        });
        if (!member) {
            return message.channel.send('Üye bilgileri alınırken bir hata oluştu.');
        }

        if (!member.roles.cache.some(role => ALLOWED_ROLE_IDS.includes(role.id))) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }

        const target = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        await this.handleYetkiVerCommand(message, target);
    },

    // Slash komutları için metot
    async interact(interaction) {
        if (!interaction.guild) {
            return;
        }

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(err => {
            console.error("Yetkiver komutunda üye çekme hatası:", err);
            return null;
        });
        if (!member) {
            return interaction.reply({ content: 'Üye bilgileri alınırken bir hata oluştu.', ephemeral: true });
        }
        
        if (!member.roles.cache.some(role => ALLOWED_ROLE_IDS.includes(role.id))) {
            return interaction.reply({ content: 'Bu komutu kullanma yetkiniz yok.', ephemeral: true });
        }
        
        const target = interaction.options.getMentionable('kullanici');
        await this.handleYetkiVerCommand(interaction, target);
    },
};
