// src/events/messageReactionAdd.js - HATA TESPİT VERSİYONU

module.exports = async (client, reaction, user) => {
    // 1. Botların kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- BAŞLANGIÇ GÜVENLİK DUVARI (Yeni Hata Çözümü) ---
        if (!reaction) return;
        if (!reaction.message) return;
        // ---------------------------------------------------

        // HATA TESPİT LOGU: Bu satırı görüyor muyuz?
        console.log(`[TEST LOG 1] Tepki alındı, işleniyor: ${user.tag}`);

        // 2. KISMI VERİ ÇÖZÜMLEME
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();
        
        // 3. SENKRONİZASYON BYPASS
        if (reaction.message.partial) {
            await reaction.message.fetch().catch(() => {});
            // Eğer message.id eşleşiyorsa (yani rol mesajıysa), eski tepki olabilir. ATLA.
            const MESSAGE_ID = client.config.MESSAGE_ID;
            // *Bu satırı da kaldırıp sadece ID kontrolü yapalım, belki sorun buradadır.*
            // if (reaction.message.id === MESSAGE_ID) return; 
        }

        // HATA TESPİT LOGU: Bu satırı görüyor muyuz?
        console.log(`[TEST LOG 2] Kısmi veriler çözüldü.`);
        
        // 4. KRİTİK FİLTRE: Mesaj ID Eşleşmesi
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (reaction.message.id !== MESSAGE_ID) {
            console.log(`[FILTRE KESİNTİSİ] Mesaj ID eşleşmiyor: ${reaction.message.id}`);
            return;
        }

        // 5. EMOJİ KONTROLÜ
        if (!reaction.emoji || !reaction.emoji.name) return;
        
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[reaction.emoji.name];
        if (!roleId) {
            console.log(`[FILTRE KESİNTİSİ] Emoji için rol ID'si bulunamadı: ${reaction.emoji.name}`);
            return; 
        }

        // HATA TESPİT LOGU: Bu satırı görüyor muyuz?
        console.log(`[AKTİF TEPKİ] Rol verme işlemine başlanıyor: ${reaction.emoji.name} / ${user.tag}`);

        // --- ROL VERME İŞLEMİ (Eğer buraya ulaştıysa, izin hatası olabilir) ---

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id).catch(() => {
             console.error(`[MEMBER HATA] Üye fetch edilemedi (Sunucudan ayrılmış olabilir): ${user.id}`);
             return null;
        }); 

        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                // ROL VERME ATILIRKEN HATA YAKALAYICI EKLEYELİM
                await member.roles.add(role).then(() => {
                    console.log(`[ROL EKLEME BAŞARILI] Rol: ${role.name} - Kullanıcı: ${user.tag}`);
                }).catch(err => {
                    // İZİN HATASI: Bot rol hiyerarşisinde düşüktür.
                    console.error(`[İZİN HATASI] Rol verme başarısız: ${role.name}. Hata: ${err.message}`);
                });
            } else {
                console.error(`[CONFIG HATA] Rol ID'si (${roleId}) sunucuda bulunamadı.`);
            }
        } else {
            return; 
        }
    } catch (error) {
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken genel hata oluştu: (${errorUserTag})`, error);
    }
};
