const { ActionRowBuilder, SelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

// Prefix komutu için veri
module.exports = {
    // Slash komutu için veri
    data: new SlashCommandBuilder()
        .setName('rol')
        .setDescription('Renk rolünüzü seçebileceğiniz menüyü gönderir.'),
    
    // Prefix komutu için ad
    name: 'rol',
    
    // Hem prefix hem de slash için çalışacak fonksiyon
    async execute(interactionOrMessage) {
        const roles = [
            { label: 'Kırmızı', value: '1235226278311759883', emoji: '🔴' },
            { label: 'Yeşil', value: '1235226195734429887', emoji: '🟢' },
            { label: 'Mavi', value: '1235226003857735701', emoji: '🔵' },
            { label: 'Sarı', value: '1235226369995051110', emoji: '🟡' },
            { label: 'Kahverengi', value: '1235226635960324137', emoji: '🟤' },
            { label: 'Siyah', value: '1235225883787132948', emoji: '⚫' },
            { label: 'Beyaz', value: '1235225495663280139', emoji: '⚪' },
            { label: 'Turuncu', value: '1235226529286586540', emoji: '🟠' },
            { label: 'Mor', value: '1235226437552963624', emoji: '🟣' },
            { label: 'Rolü Kaldır', value: 'clear', emoji: '🗑️' }
        ];

        const roleOptions = roles.map(role => ({
            label: role.label,
            value: role.value,
            emoji: role.emoji,
        }));

        const row = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('colorSelect')
                .setPlaceholder('Renkler')
                .addOptions(roleOptions)
        );

        // Komutun türüne göre farklı yanıtlar veriyoruz
        if (interactionOrMessage.isChatInputCommand) {
            await interactionOrMessage.reply({ content: 'Aşağıdaki menüden renk rolünüzü seçebilirsiniz 🌸', components: [row] });
        } else {
            await interactionOrMessage.channel.send({ content: 'Aşağıdaki menüden renk rolünüzü seçebilirsiniz 🌸', components: [row] });
        }
    },
};

// Renk rolü etkileşimlerini burada işliyoruz.
// interactionCreate olayına eklenecek kısım
module.exports.handleInteraction = async (client, interaction) => {
    if (!interaction.isSelectMenu() || interaction.customId !== 'colorSelect') return;

    const { values, member, guild } = interaction;
    const selectedValue = values[0];

    if (!guild) {
        console.error('Guild bulunamadı');
        return;
    }
    
    // config dosyan yoksa veya kullanmıyorsan buradaki örnek verileri kullanabilirsin
    const allowedRoles = ['1242100437226881105', '1246385623980445756','1238494451937054761','1238464695300522117','1238464471471620136','1238463055583514654','1238462654717235272','1238462176633819158','1238461730900676709','1238461314406416424']; 
    const colorRoleMap = {
        '1235226278311759883': 'Kırmızı',
        '1235226195734429887': 'Yeşil',
        '1235226003857735701': 'Mavi',
        '1235226369995051110': 'Sarı',
        '1235226635960324137': 'Kahverengi',
        '1235225883787132948': 'Siyah',
        '1235225495663280139': 'Beyaz',
        '1235226529286586540': 'Turuncu',
        '1235226437552963624': 'Mor'
    };

    // Kullanıcının izin verilen rollerden birine sahip olup olmadığını kontrol et
    const hasAllowedRole = allowedRoles.some(roleID => member.roles.cache.has(roleID));

    if (!hasAllowedRole) {
        await interaction.reply({ content: 'Bu işlemi yapabilmek için Booster veya Donor olmanız gerekiyor.', ephemeral: true });
        return;
    }

    const allColorRoles = Object.keys(colorRoleMap);
    const rolesToRemove = member.roles.cache.filter(role => allColorRoles.includes(role.id));
    
    if (selectedValue === 'clear') {
        try {
            await member.roles.remove(rolesToRemove);
        } catch (error) {
            console.error(`Rol kaldırma hatası: ${error.message}`);
        }
    } else {
        if (!member.roles.cache.has(selectedValue)) {
            try {
                await member.roles.add(selectedValue);
            } catch (error) {
                console.error(`Rol ekleme hatası: ${error.message}`);
            }
        }
        
        const otherColorRoles = rolesToRemove.filter(role => role.id !== selectedValue);
        try {
            await member.roles.remove(otherColorRoles);
        } catch (error) {
            console.error(`Rol kaldırma hatası: ${error.message}`);
        }
    }

    await interaction.reply({ content: 'Renk rolünüz güncellendi.', ephemeral: true });
};
