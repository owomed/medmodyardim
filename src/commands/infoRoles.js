// Bilgi rolleri komutu ve etkileşimleri
module.exports = async (client, message) => {
    if (message.content === '.bilgi') {
        const roles = [
            { label: 'Autohunt Hakkında Bilgi İçin', value: '1235288469413302306', emoji: '<:Autohunt:1238391358809706528>' },
            { label: 'Silahlar Hakkında Bilgi İçin', value: '1235289050517340241', emoji: '<:Silahlar:1235694153816473741>' },
            { label: 'Gemler Hakkında Bilgi İçin', value: '1235288028709257226', emoji: '<:Gemler:1237844439708340275>' },
        ];

        const roleOptions = roles.map(role => ({
            label: role.label,
            value: role.value,
            emoji: role.emoji,
        }));

        const row = new client.discord.MessageActionRow().addComponents(
            new client.discord.MessageSelectMenu()
                .setCustomId('BilgiSelect')
                .setPlaceholder('Bilgi Rolleri')
                .setMinValues(0)
                .setMaxValues(roleOptions.length)
                .addOptions(roleOptions)
        );

        message.channel.send({ content: 'Aşağıdaki menüden Bilgi rollerinizi seçebilirsiniz <:med_owo1:1242166689551093800>', components: [row] });
    }
};

// Bilgi rolü etkileşimlerini burada işliyoruz.
// interactionCreate olayına eklenecek kısım
module.exports.handleInteraction = async (client, interaction) => {
    if (!interaction.isSelectMenu() || interaction.customId !== 'BilgiSelect') return;

    const { values, member, guild } = interaction;
    const selectedRoleIDs = values;
    const BilgiRoleMap = client.config.BilgiRoleMap; // config'ten alıyoruz

    for (const roleID of Object.keys(BilgiRoleMap)) {
        const role = guild.roles.cache.get(roleID);
        if (!role) continue;

        if (selectedRoleIDs.includes(roleID)) {
            if (!member.roles.cache.has(roleID)) {
                await member.roles.add(roleID);
            }
        } else {
            if (member.roles.cache.has(roleID)) {
                await member.roles.remove(roleID);
            }
        }
    }

    await interaction.reply({ content: 'Rolleriniz güncellendi.', ephemeral: true });
};