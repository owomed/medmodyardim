// src/events/messageReactionAdd.js

module.exports = async (client, reaction, user) => {
    // Botun kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- KRİTİK KULLANICI KONTROLÜ ---
        // Kullanıcı nesnesinin kısmi olma ihtimaline karşı fetch yap
        if (user.partial) {
            await user.fetch();
        }
        // messageReactionAdd.js içine de ekleyin
// ...
// 1. Tepkinin kendisi kısmi ise tam veriye çek
if (reaction.partial) {
    await reaction.fetch();
}

// 🚨 KRİTİK KONTROL
if (!reaction.emoji || !reaction.emoji.name) return; 

console.log(`[DEBUG] Add Tepki olayı başladı: ${reaction.emoji.name} / ${user.tag}`);
// ...

        // 2. Mesaj nesnesi var mı? Yoksa işlemi sonlandır
        if (!reaction.message) return;

        // 3. Mesaj kısmi ise tam veriye çek
        if (reaction.message.partial) {
            await reaction.message.fetch();
        }
        // -----------------------------

        const { message, emoji } = reaction;
        
        // 4. Doğru mesajda tepki verilip verilmediğini kontrol et
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        // 5. Emojinin eşleştiği bir rol var mı?
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        // 6. Üyeyi getir ve rol atama işlemini yap
        const guild = message.guild;
        const member = await guild.members.fetch(user.id);
        
        // Üyenin sunucuda olduğundan emin ol
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
        // Hatanın oluştuğu kullanıcıyı/emoji'yi yakalamaya çalış
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken bir hata oluştu: (${errorUserTag})`, error);
    }
};
