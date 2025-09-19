const { ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Slash komutu için veri
    data: new SlashCommandBuilder()
        .setName('bilgi')
        .setDescription('Bilgi rolleri menüsünü gönderir.'),
    
    // Prefix komutu için ad
    name: 'bilgi',
    aliases: ['bilgiler'],

    /**
     * Hem prefix hem de slash komutları için ana işlevi çalıştırır.
     * @param {import('discord.js').Interaction|import('discord.js').Message} interactionOrMessage
     * @param {string[]} args - Prefix komutu için argümanlar
     */
    async execute(interactionOrMessage, args) {
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
            new StringSelectMenuBuilder()
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
    
    /**
     * Slash komut etkileşimlerini işlemek için kullanılan metot.
     * execute() metodunu çağırır.
     * @param {import('discord.js').Interaction} interaction 
     */
    async interact(interaction) {
        await this.execute(interaction);
    },
    
    /**
     * Bilgi rolü seçme menüsü etkileşimini işler.
     * Bu metot, interactionCreate event'i tarafından çağrılacaktır.
     * @param {import('discord.js').Client} client
     * @param {import('discord.js').StringSelectMenuInteraction} interaction 
     */
    async handleInteraction(client, interaction) {
        if (!interaction.isStringSelectMenu() || interaction.customId !== 'BilgiSelect') return;

        const { values, member, guild } = interaction;
        const selectedRoleIDs = values;
        
        if (!guild) {
            await interaction.reply({ content: 'Bu etkileşim bir sunucuda yapılmalı.', ephemeral: true });
            return;
        }

        const BilgiRoleMap = {
            '1235288469413302306': 'Autohunt',
            '1235289050517340241': 'Silahlar',
            '1235288028709257226': 'Gemler',
        };

        for (const roleID of Object.keys(BilgiRoleMap)) {
            const role = guild.roles.cache.get(roleID);
            if (!role) {
                console.error(`Rol bulunamadı: ${BilgiRoleMap[roleID]} (${roleID})`);
                continue;
            }

            if (selectedRoleIDs.includes(roleID)) {
                if (!member.roles.cache.has(roleID)) {
                    await member.roles.add(roleID).catch(console.error);
                }
            } else {
                if (member.roles.cache.has(roleID)) {
                    await member.roles.remove(roleID).catch(console.error);
                }
            }
        }

        await interaction.reply({ content: 'Rolleriniz güncellendi.', ephemeral: true });
    },
};
