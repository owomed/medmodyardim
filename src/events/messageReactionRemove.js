// src/events/messageReactionRemove.js

module.exports = async (client, reaction, user) => {
    // Botların kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // Eğer tepki kısmi (partial) ise, tam objesini getirmeye çalış
        if (reaction.partial) {
            await reaction.fetch();
        }

        // 🚨 YENİ VE KRİTİK KONTROL: message nesnesi var mı?
        if (!reaction.message) return; // Mesaj nesnesi yoksa işlemi sonlandır!

        // Mesajın da kısmi olup olmadığını kontrol edin ve tamamlayın
        if (reaction.message.partial) {
            await reaction.message.fetch();
        }

        const { message, emoji } = reaction;

        // Belirli mesajı kontrol et.
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        // ... kodunuzun geri kalanı (rol kaldırma mantığı)
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];

        if (!roleId) return;

        const guild = message.guild;
        const member = await guild.members.fetch(user.id);

        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.remove(role);
console.log(`[BAŞARILI GÖRÜNÜYOR] Rol kaldırma komutu gönderildi.`); // <-- YENİ LOG EKLE
console.log(`Rol kaldırıldı: ${role.name} (${roleId}) - ${user.tag}`);
            } else {
                console.error(`Rol bulunamadı: ${roleId}`);
            }
        } else {
            console.error('Üye bulunamadı:', user.id);
        }
    } catch (error) {
        console.error('Tepki işlenirken bir hata oluştu:', error);
    }
};
