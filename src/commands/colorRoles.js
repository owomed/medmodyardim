const { ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Slash komutu için gerekli veri
    data: new SlashCommandBuilder()
        .setName('rol')
        .setDescription('Renk rolünüzü seçebileceğiniz menüyü gönderir.'),

    // Prefix komutu için ad
    name: 'rol',
    aliases: ['colors', 'renkler'],

    /**
     * Hem prefix hem de slash komutları için ana işlevi çalıştırır.
     * @param {import('discord.js').Interaction|import('discord.js').Message} interactionOrMessage
     */
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
            new StringSelectMenuBuilder()
                .setCustomId('colorSelect')
                .setPlaceholder('Renkler')
                .addOptions(roleOptions)
        );

        // Komutun türüne göre farklı yanıt ver
        if (interactionOrMessage.isChatInputCommand()) {
            await interactionOrMessage.reply({ content: 'Aşağıdaki menüden renk rolünüzü seçebilirsiniz 🌸', components: [row], ephemeral: false });
        } else {
            // Eğer bir mesajdan geliyorsa
            await interactionOrMessage.channel.send({ content: 'Aşağıdaki menüden renk rolünüzü seçebilirsiniz 🌸', components: [row] });
        }
    },
    
    /**
     * Slash komut etkileşimlerini işlemek için kullanılan metot.
     * execute() metodunu çağırır.
     * @param {import('discord.js').Interaction} interaction 
     */
    async interact(interaction) {
        await this.execute(interaction);
    },

    /**
     * Renk rolü seçme menüsü etkileşimini işler.
     * Bu metot, interactionCreate event'i tarafından çağrılacaktır.
     * @param {import('discord.js').Client} client
     * @param {import('discord.js').StringSelectMenuInteraction} interaction 
     */
    async handleInteraction(client, interaction) {
        const { values, member, guild } = interaction;
        const selectedValue = values[0];

        if (!guild) {
            console.error('Guild bulunamadı');
            await interaction.reply({ content: 'Bu etkileşim bir sunucuda yapılmalı.', ephemeral: true });
            return;
        }

        const allowedRoles = ['1242100437226881105', '1246385623980445756', '1238494451937054761', '1238464695300522117', '1238464471471620136', '1238463055583514654', '1238462654717235272', '1238462176633819158', '1238461730900676709', '1238461314406416424'];
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

        const hasAllowedRole = allowedRoles.some(roleID => member.roles.cache.has(roleID));

        if (!hasAllowedRole) {
            await interaction.reply({ content: 'Bu işlemi yapabilmek için Booster veya Donor olmanız gerekiyor.', ephemeral: true });
            return;
        }

        const allColorRoles = Object.keys(colorRoleMap);
        const rolesToRemove = member.roles.cache.filter(role => allColorRoles.includes(role.id));
        
        if (selectedValue === 'clear') {
            try {
                if (rolesToRemove.size > 0) {
                    await member.roles.remove(rolesToRemove);
                }
            } catch (error) {
                console.error(`Rol kaldırma hatası: ${error.message}`);
                await interaction.reply({ content: 'Rol kaldırma işlemi sırasında bir hata oluştu.', ephemeral: true });
                return;
            }
        } else {
            try {
                if (!member.roles.cache.has(selectedValue)) {
                    await member.roles.add(selectedValue);
                }
            } catch (error) {
                console.error(`Rol ekleme hatası: ${error.message}`);
                await interaction.reply({ content: 'Rol ekleme işlemi sırasında bir hata oluştu.', ephemeral: true });
                return;
            }
            
            const otherColorRoles = rolesToRemove.filter(role => role.id !== selectedValue);
            try {
                if (otherColorRoles.size > 0) {
                    await member.roles.remove(otherColorRoles);
                }
            } catch (error) {
                console.error(`Rol kaldırma hatası: ${error.message}`);
                await interaction.reply({ content: 'Diğer rolleri kaldırma işlemi sırasında bir hata oluştu.', ephemeral: true });
                return;
            }
        }

        await interaction.reply({ content: 'Renk rolünüz güncellendi.', ephemeral: true });
    },
};
