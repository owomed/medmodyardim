// src/events/messageReactionAdd.js - RADİKAL ÇÖZÜM

module.exports = async (client, reaction, user) => {
    // 1. Botu yoksay (En kritik filtre)
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

        // TEST LOG 1: Eğer burayı görüyorsanız, sorun filtrededir.
        console.log(`[TEST 1] Tepki alındı, Mesaj ID kontrol ediliyor...`);

        // Mesaj ID Kontrolü (Hala gerekiyor!)
        if (reaction.message.id !== MESSAGE_ID) {
             console.log(`[ID FILTRESI] Yanlış mesaj ID: ${reaction.message.id}`);
             return; // Farklı bir mesajdan geliyorsa dur.
        }
        
        // TEST LOG 2: Eğer burayı görüyorsanız, ID'leriniz doğru!
        console.log(`[TEST 2] Mesaj ID eşleşti. Emoji: ${reaction.emoji.name}`);

        const roleId = ROLE_EMOJI_MAP[reaction.emoji.name];
        if (!roleId) return;

        const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);

        if (member) {
            const role = reaction.message.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(roleId).then(() => {
                    console.log(`[BAŞARILI] Rol eklendi: ${role.name} (${user.tag})`);
                }).catch(err => {
                    console.error(`[ROL HATA] Rol eklenemedi (İzinler/Hiyerarşi): ${user.tag} - Hata: ${err.message}`);
                });
            } else {
                console.error(`[CONFIG HATA] Rol bulunamadı: ${roleId}`);
            }
        }
    } catch (error) {
        const userTag = user?.tag || 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken genel hata oluştu: (${userTag})`, error);
    }
};
