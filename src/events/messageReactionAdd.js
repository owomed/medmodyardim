// src/events/messageReactionAdd.js - ROL EKLEME KESİN ÇÖZÜM

module.exports = async (client, reaction, user) => {
    // Botun kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- KRİTİK KISIM 1: VERİ BÜTÜNLÜĞÜNÜ SAĞLAMA (Kısmi Veri Hatalarını Engelle) ---
        
        // Kullanıcıyı ve Tepkiyi tam veriye çek
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();
        
        // Mesaj, emoji ve rol eşleşme kontrolü için hemen veriyi çekin.
        if (!reaction.emoji || !reaction.emoji.name) return;
        if (!reaction.message) return;
        if (reaction.message.partial) await reaction.message.fetch();

        // Debug logunu buraya koyalım ki, fetch işlemi tamamlandıktan sonra çalışsın.
        console.log(`[DEBUG] Add Tepki olayı başladı: ${reaction.emoji.name} / ${user.tag}`);

        // --- KRİTİK KISIM 2: ROL EŞLEŞMESİ KONTROLÜ ---
        
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (reaction.message.id !== MESSAGE_ID) return;

        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[reaction.emoji.name];
        if (!roleId) return; // Eşleşen rol ID'si yoksa dur.

        // --- KRİTİK KISIM 3: ÜYEYİ BULMA VE ROL VERME ---

        const guild = reaction.message.guild;
        
        // Üyeyi sunucuda bul (Doğrudan API'dan çekiyor, önbellek bypass ediliyor)
        const member = await guild.members.fetch(user.id).catch(err => {
            // Sadece bu logu tutalım. Eğer hata verirse yine intent sorunu var demektir.
            console.error(`[FATAL HATA] Üye fetch işlemi başarısız: ${user.id}`, err.message);
            return null;
        });

        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                // Rolü ekle
                await member.roles.add(role);
                console.log(`[ROL EKLEME BAŞARILI] Rol: ${role.name} - Kullanıcı: ${user.tag}`);
            } else {
                console.error(`[CONFIG HATA] Rol ID'si (${roleId}) sunucuda bulunamadı.`);
            }
        } else {
            console.error(`[SYNC HATA] Rol verilecek üye sunucuda bulunamadı (Intent kapalı/Limit Aşımı): ${user.id}`);
        }
    } catch (error) {
        // Hata durumunda DEBUG amaçlı daha fazla bilgi logla
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken genel hata oluştu: (${errorUserTag})`, error);
    }
};
