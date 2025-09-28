// src/events/messageReactionRemove.js - ROL KALDIRMA (GÜVENLİ VE ANLIK)

module.exports = async (client, reaction, user) => {
    // 1. Botun kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- BAŞLANGIÇ GÜVENLİK KONTROLLERİ ---
        if (!reaction || !reaction.message) return;
        
        // 2. KISMI VERİ ÇÖZÜMLEME
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();
        
        // 3. SENKRONİZASYON BYPASS
        if (reaction.message.partial) {
            await reaction.message.fetch().catch(() => {});
            if (reaction.message.id === client.config.MESSAGE_ID) return;
        }

        // 4. TEMEL FİLTRELER
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (reaction.message.id !== MESSAGE_ID) return;
        
        if (!reaction.emoji || !reaction.emoji.name) return;
        const roleId = client.config.ROLE_EMOJI_MAP[reaction.emoji.name];
        if (!roleId) return;

        // Log: İşleme başladığını gör.
        console.log(`[AKTİF REMOVE] Rol işlemi başladı: ${reaction.emoji.name} -> ${user.tag}`);

        // 5. ÜYEYİ ÇEKME VE ROL KALDIRMA
        const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);

        if (member) {
            const role = reaction.message.guild.roles.cache.get(roleId);
            if (role) {
                // Rol kaldırma işlemini hata yakalayıcı ile sarar.
                await member.roles.remove(role).then(() => {
                    console.log(`[BAŞARILI] Rol kaldırıldı: ${role.name} (${user.tag})`);
                }).catch(err => {
                    console.error(`[ROL HATA] Rol kaldırılamadı (İzinler/Hiyerarşi): ${user.tag}`, err.message);
                });
            } else {
                console.error(`[CONFIG HATA] Rol ID'si (${roleId}) sunucuda bulunamadı.`);
            }
        } else {
            return;
        }
    } catch (error) {
        const userTag = user?.tag || 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Kaldırma) işlenirken genel hata oluştu: (${userTag})`, error);
    }
};
