module.exports = async (client, reaction, user) => {
    // Botların kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // Eğer tepki kısmi (partial) ise, tam objesini getirmeye çalış
        if (reaction.partial) {
            await reaction.fetch();
        }

        // 🚨 ÖNEMLİ EKLEME: Mesajı da tam objesine getir!
        // Aksi takdirde message.id okumaya çalışırken TypeError alabilirsiniz.
        if (reaction.message.partial) {
            await reaction.message.fetch();
        }

        const { message, emoji } = reaction;

        // Belirli mesajı kontrol et.
        const MESSAGE_ID = client.config.MESSAGE_ID;
        // Artık 'message' nesnesi garanti olarak tam veriye sahip olduğu için güvenle 'message.id' kullanabiliriz.
        if (message.id !== MESSAGE_ID) return;

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
                // Üyeden rolü kaldır
                await member.roles.remove(role);
                console.log(`Rol kaldırıldı: ${role.name} (${roleId}) - ${user.tag}`);
            } else {
                console.error(`Rol bulunamadı: ${roleId} (Sunucuda mevcut değil)`);
            }
        } else {
            console.error('Üye bulunamadı:', user.id);
        }
    } catch (error) {
        console.error('Tepki işlenirken bir hata oluştu:', error);
        // Hata durumunda DEBUG için hangi mesajda ve kimden geldiğini loglamak faydalı olabilir
        // console.error(`Hata Detayı: Mesaj ID: ${reaction.message.id || 'Bilinmiyor'}, Kullanıcı ID: ${user.id}`);
    }
};
