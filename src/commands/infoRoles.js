const { ActionRowBuilder, SelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Slash komutu için veri
    data: new SlashCommandBuilder()
        .setName('bilgi')
        .setDescription('Bilgi rolleri menüsünü gönderir.'),
    
    // Prefix komutu için ad
    name: 'bilgi',

    // Hem prefix hem de slash için çalışacak fonksiyon
    async execute(interactionOrMessage) {
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

        const row = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('BilgiSelect')
                .setPlaceholder('Bilgi Rolleri')
                .setMinValues(0)
                .setMaxValues(roleOptions.length)
                .addOptions(roleOptions)
        );

        const content = 'Aşağıdaki menüden Bilgi rollerinizi seçebilirsiniz <:med_owo1:1242166689551093800>';
        
        // Komutun türüne göre farklı yanıtlar veriyoruz
        if (interactionOrMessage.isChatInputCommand()) {
            await interactionOrMessage.reply({ content, components: [row] });
        } else {
            await interactionOrMessage.channel.send({ content, components: [row] });
        }
    },
    
    // Bilgi rolü etkileşimlerini burada işliyoruz.
    // interactionCreate olayına eklenecek kısım
    async handleInteraction(client, interaction) {
        if (!interaction.isSelectMenu() || interaction.customId !== 'BilgiSelect') return;

        const { values, member, guild } = interaction;
        const selectedRoleIDs = values;
        
        // config dosyan yoksa veya kullanmıyorsan buradaki örnek verileri kullanabilirsin
        const BilgiRoleMap = {
            '1235288469413302306': 'Autohunt',
            '1235289050517340241': 'Silahlar',
            '1235288028709257226': 'Gemler',
        };

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
    },
};
