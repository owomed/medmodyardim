// src/events/messageReactionAdd.js - V14 Uyumlu ve Stabil

module.exports = async (client, reaction, user) => {
    if (user.bot) return;

    try {
        // --- V14 KRİTİK KONTROLLER ---
        // 1. Olası tüm eksik/kısmi verileri tam veriye dönüştür
        if (!reaction || !reaction.message) return;
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();

        // 2. Senkronizasyon (Eski Tepki) Atlatma: Mesaj ID'si eşleşiyorsa dur
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
        
        // 3. Üyeyi GÜNCEL veriden çek (cache değil fetch)
        const member = await message.guild.members.fetch(user.id).catch(() => null);
        
        if (member) {
            const role = message.guild.roles.cache.get(roleId);
            if (role) {
                // Rol verme işlemini hata yakalayıcı ile sarar (İzin/Hiyerarşi kontrolü)
                await member.roles.add(roleId).then(() => {
                    console.log(`[ROL EKLEME BAŞARILI] Rol eklendi: ${role.name} (${user.tag})`);
                }).catch(err => {
                    console.error(`[ROL HATA] Rol eklenemedi (İzinler/Hiyerarşi): ${user.tag}`, err.message);
                });
            } else {
                console.error(`[CONFIG HATA] Rol bulunamadı: ${roleId}`);
            }
        } else {
            // Sunucudan ayrılmış eski kullanıcıları sessizce yoksay
            return;
        }
    } catch (error) {
        const userTag = user?.tag || 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken kritik bir hata oluştu: (${userTag})`, error);
    }
};
