// src/events/messageReactionAdd.js - ROL EKLEME (GÜVENLİ VE ANLIK)

module.exports = async (client, reaction, user) => {
    // 1. Botun kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- BAŞLANGIÇ GÜVENLİK KONTROLLERİ ---
        // Gelen nesnelerin varlığını garanti altına alır.
        if (!reaction || !reaction.message) return;
        
        // 2. KISMI VERİ ÇÖZÜMLEME
        // Eğer tepki veya kullanıcı tam veri değilse, API'dan çek.
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();
        
        // 3. SENKRONİZASYON BYPASS
        // Eğer mesaj hala kısmi ise, bu büyük olasılıkla botun açılışındaki eski tepkidir. Atla.
        if (reaction.message.partial) {
            // Mesajı fetch et ki ID'sine ulaşabilelim. Hata durumunda yoksay.
            await reaction.message.fetch().catch(() => {});
            
            // Eğer rol verme mesajımızın ID'si ile eşleşiyorsa, eski tepkiyi işleme.
            if (reaction.message.id === client.config.MESSAGE_ID) return;
        }

        // 4. TEMEL FİLTRELER
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (reaction.message.id !== MESSAGE_ID) return; // Yanlış mesajsa dur.
        
        if (!reaction.emoji || !reaction.emoji.name) return;
        const roleId = client.config.ROLE_EMOJI_MAP[reaction.emoji.name];
        if (!roleId) return; // Eşleşen rol yoksa dur.

        // Log: İşleme başladığını gör.
        console.log(`[AKTİF ADD] Rol işlemi başladı: ${reaction.emoji.name} -> ${user.tag}`);

        // 5. ÜYEYİ ÇEKME VE ROL EKLEME
        const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);

        if (member) {
            const role = reaction.message.guild.roles.cache.get(roleId);
            if (role) {
                // Rol verme işlemini hata yakalayıcı ile sarar.
                await member.roles.add(role).then(() => {
                    console.log(`[BAŞARILI] Rol eklendi: ${role.name} (${user.tag})`);
                }).catch(err => {
                    console.error(`[ROL HATA] Rol eklenemedi (İzinler/Hiyerarşi): ${user.tag}`, err.message);
                });
            } else {
                console.error(`[CONFIG HATA] Rol ID'si (${roleId}) sunucuda bulunamadı.`);
            }
        } else {
            // Sessizce dön (Sunucudan ayrılmış eski kullanıcılar)
            return; 
        }
    } catch (error) {
        const userTag = user?.tag || 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken genel hata oluştu: (${userTag})`, error);
    }
};
