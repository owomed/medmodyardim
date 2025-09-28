// src/events/messageReactionAdd.js - Hata Düzeltmeleri Uygulanmış, Kararlı Versiyon

module.exports = async (client, reaction, user) => {
    // Botun kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // 1. KULLANICI KONTROLÜ (Tepkiyi veren kişi)
        if (user.partial) await user.fetch();
        
        // 2. TEPKİ KONTROLÜ
        if (reaction.partial) await reaction.fetch();
        
        // 3. EMOJİ KONTROLÜ (Emoji nesnesinin varlığını garanti altına alır)
        if (!reaction.emoji || !reaction.emoji.name) return;
        
        // 4. MESAJ KONTROLÜ (Message nesnesinin bütünlüğünü garanti altına alır)
        if (!reaction.message) return;
        if (reaction.message.partial) await reaction.message.fetch();
        
        // --- BU NOKTADAN SONRA TÜM NESNELER GÜVENLİDİR ---

        const { message, emoji } = reaction;

        // Debug logu artık güvenli bir şekilde çalışır
        console.log(`[DEBUG] Add Tepki olayı başladı: ${emoji.name} / ${user.tag}`);

        // 5. Mesaj ID Kontrolü
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        // 6. Rol Eşleşme Kontrolü
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        // 7. ÜYEYİ ÇEKME (Düzeltildi: user.id kullanılıyor)
        const guild = message.guild;
        
        // Rolü vereceğimiz kişiyi (Tepkiyi Veren Kişiyi) API'dan çağırıyoruz
        const member = await guild.members.fetch(user.id).catch(() => { 
            // Üye bulunamazsa (sunucudan ayrılmışsa) sessizce döndür
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
            // Sessizce ayrıl (Bot açılışındaki eski tepkiler veya ayrılanlar)
            return;
        }
    } catch (error) {
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken kritik bir hata oluştu: (${errorUserTag})`, error);
    }
};
