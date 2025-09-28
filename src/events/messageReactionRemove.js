// src/events/messageReactionRemove.js - RADİKAL ÇÖZÜM

module.exports = async (client, reaction, user) => {
    if (user.bot) return;

    try {
        // --- GÜVENLİK KONTROLLERİ ---
        if (!reaction || !reaction.message) return;
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch().catch(() => {});
        // --------------------------
        
        const MESSAGE_ID = client.config.MESSAGE_ID;
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;

        // TEST LOG 1: Geri Bildirim
        console.log(`[TEST REMOVE 1] Tepki alındı, Mesaj ID kontrol ediliyor...`);

        if (reaction.message.id !== MESSAGE_ID) {
             console.log(`[ID FILTRESI REMOVE] Yanlış mesaj ID: ${reaction.message.id}`);
             return;
        }

        // TEST LOG 2: Geri Bildirim
        console.log(`[TEST REMOVE 2] Mesaj ID eşleşti. Emoji: ${reaction.emoji.name}`);

        const roleId = ROLE_EMOJI_MAP[reaction.emoji.name];
        if (!roleId) return;

        const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);

        if (member) {
            const role = reaction.message.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.remove(roleId).then(() => {
                    console.log(`[BAŞARILI] Rol kaldırıldı: ${role.name} (${user.tag})`);
                }).catch(err => {
                    console.error(`[ROL HATA] Rol kaldırılamadı (İzinler/Hiyerarşi): ${user.tag} - Hata: ${err.message}`);
                });
            } else {
                console.error(`[CONFIG HATA] Rol bulunamadı: ${roleId}`);
            }
        }
    } catch (error) {
        const userTag = user?.tag || 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Kaldırma) işlenirken genel hata oluştu: (${userTag})`, error);
    }
};
