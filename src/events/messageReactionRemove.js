// src/events/messageReactionRemove.js - SENKRONİZASYON DURDURULDU

module.exports = async (client, reaction, user) => {
    // Botun kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- SENKRONİZASYON BYPASS KONTROLÜ ---
        if (reaction.message.partial) {
            await reaction.message.fetch().catch(() => {});
            const MESSAGE_ID = client.config.MESSAGE_ID;
            if (reaction.message.id === MESSAGE_ID) return;
        }
        // ------------------------------------

        // Diğer zorunlu kontroller
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();
        if (!reaction.emoji || !reaction.emoji.name) return;
        if (!reaction.message) return;

        const { message, emoji } = reaction;

        console.log(`[AKTİF TEPKİ] Rol Kaldırma başladı: ${emoji.name} / ${user.tag}`);

        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        const guild = message.guild;
        const member = await guild.members.fetch(user.id).catch(() => null); 

        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.remove(role);
                console.log(`[ROL KALDIRMA BAŞARILI] Rol: ${role.name} - Kullanıcı: ${user.tag}`);
            } else {
                console.error(`[HATA] Rol ID'si (${roleId}) sunucuda bulunamadı.`);
            }
        } else {
            return;
        }
    } catch (error) {
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Kaldırma) işlenirken genel hata oluştu: (${errorUserTag})`, error);
    }
};
