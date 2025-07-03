// Renk rolleri komutu ve etkileşimleri
module.exports = async (client, message) => {
    if (message.content === '.rol') {
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

        const row = new client.discord.MessageActionRow().addComponents(
            new client.discord.MessageSelectMenu()
                .setCustomId('colorSelect')
                .setPlaceholder('Renkler')
                .addOptions(roleOptions)
        );

        message.channel.send({ content: 'Aşağıdaki menüden renk rolünüzü seçebilirsiniz 🌸', components: [row] });
    }
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

    const allowedRoles = client.config.allowedRoles; // config'ten alıyoruz
    const colorRoleMap = client.config.colorRoleMap; // config'ten alıyoruz

    // Kullanıcının izin verilen rollerden birine sahip olup olmadığını kontrol et
    const hasAllowedRole = allowedRoles.some(roleID => member.roles.cache.has(roleID));

    if (!hasAllowedRole) {
        await interaction.reply({ content: 'Bu işlemi yapabilmek için Booster veya Donor olmanız gerekiyor.', ephemeral: true });
        return;
    }

    if (selectedValue === 'clear') {
        // Temizle seçeneğine tıklandığında, tüm renk rollerini kaldır
        for (const roleID of Object.values(colorRoleMap)) {
            if (member.roles.cache.has(roleID)) {
                try {
                    await member.roles.remove(roleID);
                } catch (error) {
                    console.error(`Rol kaldırma hatası: ${error.message}`);
                }
            }
        }
    } else {
        // Renk rolü seçildiyse
        const selectedRoleID = selectedValue;

        // Mevcut rolleri kaldır
        for (const roleID of Object.values(colorRoleMap)) {
            if (member.roles.cache.has(roleID) && roleID !== selectedRoleID) {
                try {
                    await member.roles.remove(roleID);
                } catch (error) {
                    console.error(`Rol kaldırma hatası: ${error.message}`);
                }
            }
        }

        // Seçilen rolü ekle
        if (!member.roles.cache.has(selectedRoleID)) {
            try {
                await member.roles.add(selectedRoleID);
            } catch (error) {
                console.error(`Rol ekleme hatası: ${error.message}`);
            }
        }
    }

    await interaction.reply({ content: 'Renk rolünüz güncellendi.', ephemeral: true });
};