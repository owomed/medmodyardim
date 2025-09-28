// src/events/messageReactionAdd.js - HER ŞEYE DAYANIKLI VERSİYON

module.exports = async (client, reaction, user) => {
    // 1. Botların kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- KRİTİK BAŞLANGIÇ GÜVENLİK DUVARI (Yeni Hata Çözümü) ---
        // Eğer reaction nesnesinin kendisi bile gelmediyse, hemen dur.
        if (!reaction) return;
        
        // Eğer tepkinin ait olduğu mesaj nesnesi yoksa, hemen dur.
        if (!reaction.message) return;
        // -----------------------------------------------------------

        // --- KISMI VERİ ÇÖZÜMLEME (Daha Önceki Hatalar) ---
        
        // 2. KULLANICI KONTROLÜ
        if (user.partial) await user.fetch();
        
        // 3. TEPKİ KONTROLÜ
        if (reaction.partial) await reaction.fetch();
        
        // 4. MESAJ KONTROLÜ (Bu noktada reaction.message'in var olduğunu biliyoruz)
        // SENKRONİZASYON BYPASS: Eski tepkileri atlamak için fetch öncesinde kontrol ediyoruz.
        if (reaction.message.partial) {
            await reaction.message.fetch().catch(() => {});
            // Eğer message.id hala eşleşiyorsa, büyük ihtimalle bot açılışından gelen eski tepkidir. Atla.
            const MESSAGE_ID = client.config.MESSAGE_ID;
            if (reaction.message.id === MESSAGE_ID) return; 
        }

        // 5. EMOJİ KONTROLÜ
        if (!reaction.emoji || !reaction.emoji.name) return;
        
        // --- BU NOKTADAN SONRA TÜM NESNELER GÜVENLİDİR ---

        const { message, emoji } = reaction;

        // DEBUG: Sadece yeni tepkileri göreceğiz.
        console.log(`[AKTİF TEPKİ] Rol Ekleme başladı: ${emoji.name} / ${user.tag}`);

        // 6. Mesaj ID Kontrolü (Tekrar kontrol etsek bile, bypass'tan kaçan olabilir)
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        // 7. Rol Eşleşme Kontrolü
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        // 8. Üyeyi Çekme ve Rol Verme
        const guild = message.guild;
        const member = await guild.members.fetch(user.id).catch(() => null); 

        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);
                console.log(`[ROL EKLEME BAŞARILI] Rol: ${role.name} - Kullanıcı: ${user.tag}`);
            } else {
                console.error(`[HATA] Rol ID'si (${roleId}) sunucuda bulunamadı.`);
            }
        } else {
            return; // Sunucudan ayrılanları sessizce atla.
        }
    } catch (error) {
        // Hata yakalama bloğunu daha güvenli hale getir
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken kritik bir hata oluştu: (${errorUserTag})`, error);
    }
};
