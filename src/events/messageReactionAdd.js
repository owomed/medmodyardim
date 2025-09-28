// src/events/messageReactionAdd.js
module.exports = async (client, reaction, user) => {
    // 1. Botların kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- KRİTİK KONTROLLER (Kısmi Veri Yönetimi) ---

        // 2. KULLANICI KONTROLÜ: Kullanıcının kendisi kısmi ise tam veriye çek
        if (user.partial) {
            await user.fetch();
        }

        // 3. TEPKİ KONTROLÜ: Tepkinin kendisi kısmi ise tam veriye çek
        if (reaction.partial) {
            await reaction.fetch();
        }

        // 4. EMOJİ KONTROLÜ: Emoji nesnesi tanımsız (undefined) ise işlemi durdur
        if (!reaction.emoji || !reaction.emoji.name) return;
        
        console.log(`[DEBUG] Add Tepki olayı başladı: ${reaction.emoji.name} / ${user.tag}`);

        // 5. MESAJ KONTROLÜ: Mesaj nesnesi var mı? Yoksa işlemi sonlandır
        if (!reaction.message) return;

        // 6. MESAJ KISMI KONTROLÜ: Mesaj kısmi ise tam veriye çek
        if (reaction.message.partial) {
            await reaction.message.fetch();
        }
        // ----------------------------------------------

        const { message, emoji } = reaction;

        // 7. Doğru mesajda tepki verilip verilmediğini kontrol et
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        // 8. Emojinin eşleştiği bir rol var mı?
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        // 9. Üyeyi getir ve rol atama işlemini yap
        const guild = message.guild;
        const member = await guild.members.fetch(user.id);
        
        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                // Rolü ekle
                await member.roles.add(role);
                console.log(`[ROL EKLEME BAŞARILI] Rol: ${role.name} - Kullanıcı: ${user.tag}`);
            } else {
                console.error(`[HATA] Rol bulunamadı: ${roleId} (Config'de tanımlı ama sunucuda yok)`);
            }
        } else {
            console.error(`[HATA] Üye bulunamadı: ${user.id}`);
        }
    } catch (error) {
        // Hata durumunda DEBUG amaçlı daha fazla bilgi logla
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken kritik bir hata oluştu: (${errorUserTag})`, error);
    }
};
