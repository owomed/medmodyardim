module.exports = async (client, reaction, user) => {
    // Botların kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // Eğer tepki kısmi (partial) ise, tam objesini getirmeye çalış
        if (reaction.partial) {
            await reaction.fetch();
        }

        const { message, emoji } = reaction;

        // Belirli mesajı kontrol et.
        // Mesajın önbellekte olmaması durumunu da kontrol et.
        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (!message || message.id !== MESSAGE_ID) return;

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
