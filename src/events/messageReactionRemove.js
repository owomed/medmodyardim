// src/events/messageReactionRemove.js

module.exports = async (client, reaction, user) => {
    // Botun kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- KRİTİK KONTROLLER ---
        // Kullanıcı nesnesinin kısmi olma ihtimaline karşı fetch yap
        if (user.partial) {
            await user.fetch();
        }

        // 1. Tepkinin kendisi kısmi ise tam veriye çek
        if (reaction.partial) {
            await reaction.fetch();
        }
        
        // 🚨 YENİ KRİTİK KONTROL: Emoji nesnesi var mı?
        // Bu kontrol, önceki hatayı çözmelidir.
        if (!reaction.emoji || !reaction.emoji.name) return;
        
        console.log(`[DEBUG] Remove Tepki olayı başladı: ${reaction.emoji.name} / ${user.tag}`);

        // 2. Mesaj nesnesi var mı? Yoksa işlemi sonlandır
        if (!reaction.message) return;

        // 3. Mesaj kısmi ise tam veriye çek
        if (reaction.message.partial) {
            await reaction.message.fetch();
        }
        // -----------------------------

        const { message, emoji } = reaction; // Emoji burada artık garantili olarak var

        // 4. Doğru mesajda tepki kaldırılıp kaldırılmadığını kontrol et
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        // 5. Emojinin eşleştiği bir rol var mı?
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        // 6. Üyeyi getir ve rol kaldırma işlemini yap
        const guild = message.guild;
        const member = await guild.members.fetch(user.id);

        // Üyenin sunucuda olduğundan emin ol
        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                // Rolü kaldır
                await member.roles.remove(role);
                console.log(`[ROL KALDIRMA BAŞARILI] Rol: ${role.name} - Kullanıcı: ${user.tag}`);
            } else {
                console.error(`[HATA] Rol bulunamadı: ${roleId} (Config'de tanımlı ama sunucuda yok)`);
            }
        } else {
            console.error(`[HATA] Üye bulunamadı: ${user.id}`);
        }
    } catch (error) {
        // Hatanın oluştuğu kullanıcıyı/emoji'yi yakalamaya çalış
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Kaldırma) işlenirken bir hata oluştu: (${errorUserTag})`, error);
    }
};
