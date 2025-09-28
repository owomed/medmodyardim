// src/events/messageReactionAdd.js

module.exports = async (client, reaction, user) => {
    // Botların kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // Eğer tepki kısmi (partial) ise, tam objesini getirmeye çalış
        if (reaction.partial) {
            await reaction.fetch();
        }

        // 🚨 ÖNEMLİ EKLEME: Mesajı da tam objesine getir!
        if (reaction.message.partial) {
            await reaction.message.fetch();
        }

        const { message, emoji } = reaction;
        
        // Bu noktada "message" nesnesi GUARANTİD tam bir mesaj objesidir.

        // Belirli mesajı kontrol et.
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return; // message'ın artık kesinlikle bir "id"si var.

        // ... kodunuzun geri kalanı
        // Rol ve emoji eşleşmesini config'ten al
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        
        // Eşleşen bir rol yoksa dur
        if (!roleId) return;

        // Üyeyi getir. Eğer kısmi (partial) ise tam objesini getir.
        const guild = message.guild;
        const member = await guild.members.fetch(user.id);

        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                // Üyeye rolü ekle
                await member.roles.add(role);
                console.log(`Rol eklendi: ${role.name} (${roleId}) - ${user.tag}`);
            } else {
                console.error(`Rol bulunamadı: ${roleId} (Sunucuda mevcut değil)`);
            }
        } else {
            console.error('Üye bulunamadı:', user.id);
        }
    } catch (error) {
        console.error('Tepki işlenirken bir hata oluştu:', error);
    }
};
