// src/events/messageReactionRemove.js - V14 Uyumlu ve Stabil

module.exports = async (client, reaction, user) => {
    if (user.bot) return;

    try {
        // --- V14 KRİTİK KONTROLLER ---
        if (!reaction || !reaction.message) return;
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();

        // Senkronizasyon (Eski Tepki) Atlatma
        if (reaction.message.partial) {
            await reaction.message.fetch().catch(() => {});
            if (reaction.message.id === client.config.MESSAGE_ID) return;
        }
        // -----------------------------
        
        const { message, emoji } = reaction;
        const MESSAGE_ID = client.config.MESSAGE_ID;
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;

        if (message.id !== MESSAGE_ID) return;

        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        // Üyeyi GÜNCEL veriden çek
        const member = await message.guild.members.fetch(user.id).catch(() => null);
        
        if (member) {
            const role = message.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.remove(roleId).then(() => {
                    console.log(`[ROL KALDIRMA BAŞARILI] Rol kaldırıldı: ${role.name} (${user.tag})`);
                }).catch(err => {
                    console.error(`[ROL HATA] Rol kaldırılamadı (İzinler/Hiyerarşi): ${user.tag}`, err.message);
                });
            } else {
                console.error(`[CONFIG HATA] Rol bulunamadı: ${roleId}`);
            }
        } else {
            return;
        }
    } catch (error) {
        const userTag = user?.tag || 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Kaldırma) işlenirken kritik bir hata oluştu: (${userTag})`, error);
    }
};
