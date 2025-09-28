// src/events/messageReactionAdd.js - Sadece AKTİF duruma odaklanma

module.exports = async (client, reaction, user) => {
    // 1. Botların kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- KRİTİK KONTROLLER (Kullanıcı, Tepki, Mesaj Bütünlüğü) ---
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();
        if (!reaction.emoji || !reaction.emoji.name) return;
        if (!reaction.message) return;
        if (reaction.message.partial) await reaction.message.fetch();
        // -----------------------------------------------------------

        const { message, emoji } = reaction;
        
        // 2. Mesaj ve Rol Eşleşme Kontrolleri
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        // 3. Üyeyi Bulma (Doğrudan API'dan)
        const guild = message.guild;
        const member = await guild.members.fetch(user.id).catch(err => {
            // Üye bulunamazsa, (muhtemelen sunucudan ayrıldığı için) null döndür.
            // Bu, aşağıdaki 'if (member)' kontrolünde yakalanacaktır.
            return null;
        });

        if (member) {
            // ÜYE BAŞARIYLA BULUNDU (AKTİF KULLANICI)
            const role = guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);
                console.log(`[ROL EKLEME BAŞARILI] Rol: ${role.name} - Kullanıcı: ${user.tag}`);
            } else {
                console.error(`[HATA] Rol ID'si (${roleId}) Config'de tanımlı ama sunucuda yok.`);
            }
        } else {
            // ÜYE BULUNAMADI (BOT BAŞLANGICINDAKİ ESKİ TEPKİLER)
            // Bu hatayı görmezden gelmek için konsola ÇIKTI VERMEYİN.
            // console.error(`[SYNC HATA] Rol verilecek üye sunucuda bulunamadı: ${user.id}`); // BU SATIRI KALDIRDIK!
            return; // İşlemi sessizce sonlandır.
        }
    } catch (error) {
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken genel hata oluştu: (${errorUserTag})`, error);
    }
};
