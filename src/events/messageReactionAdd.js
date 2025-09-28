// src/events/messageReactionAdd.js - SADECE YENİ TEPKİLERE ODAKLANMA

module.exports = async (client, reaction, user) => {
    // 1. Botların kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- KRİTİK KONTROLLER (Kısmi Veri Yönetimi) ---
        
        // Kullanıcıyı ve Tepkiyi tam veriye çek
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();
        
        // Mesaj Kısmi İse ve Sunucuda Değilse (Yani Senkronizasyon Sırasında Geliyorsa) İŞLEMİ DURDUR.
        // Bu, botun açılırkenki eski tepkileri işleme isteğini engeller.
        if (reaction.message.partial && !reaction.message.inGuild()) return; 
        
        // Diğer kontroller (Hata olmaması için zorunlu)
        if (!reaction.emoji || !reaction.emoji.name) return;
        if (!reaction.message) return;
        if (reaction.message.partial) await reaction.message.fetch();
        // -----------------------------------------------------------
        
        const { message, emoji } = reaction;

        // Debug logunu burada tutalım
        console.log(`[DEBUG] Add Tepki olayı başladı: ${emoji.name} / ${user.tag}`);

        // 2. Mesaj ve Rol Eşleşme Kontrolleri
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        // 3. Üyeyi Bulma ve Rol Verme
        const guild = message.guild;
        const member = await guild.members.fetch(user.id).catch(() => {
            // Üye bulunamadıysa (sunucudan ayrılmışsa), hata logu vermeden null döndür.
            return null; 
        });

        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);
                console.log(`[ROL EKLEME BAŞARILI] Rol: ${role.name} - Kullanıcı: ${user.tag}`);
            } else {
                console.error(`[HATA] Rol ID'si (${roleId}) sunucuda bulunamadı.`);
            }
        } else {
            // Üye bulunamadığı için sessizce dön (eski kullanıcı tepkileri)
            return;
        }
    } catch (error) {
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken genel hata oluştu: (${errorUserTag})`, error);
    }
};
