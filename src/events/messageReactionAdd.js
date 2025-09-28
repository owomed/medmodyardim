// src/events/messageReactionAdd.js - SENKRONİZASYON DURDURULDU

module.exports = async (client, reaction, user) => {
    // Botun kendi tepkilerini göz ardı et
    if (user.bot) return;

    try {
        // --- SENKRONİZASYON BYPASS KONTROLÜ ---
        // Mesaj kısmi ise, tepki bot açıldıktan sonra oluşmamıştır (senkronizasyondur). İŞLEME.
        if (reaction.message.partial) {
            // Sadece bot açıldıktan SONRA atılan tepkilere odaklanmak için, eski tepkileri atlıyoruz.
            // Bu, botun açılışındaki 3 dakikalık yavaşlamayı yok eder.
            // Ancak, önce mesajın tam verisini çekelim ki message.id'ye erişebilelim.
            await reaction.message.fetch().catch(() => {});
            
            const MESSAGE_ID = client.config.MESSAGE_ID;
            // Eğer mesaj ID'si eşleşiyorsa, bu büyük ihtimalle eski tepkidir. Atlıyoruz.
            if (reaction.message.id === MESSAGE_ID) return;
        }
        // ------------------------------------

        // Diğer zorunlu kontroller
        if (user.partial) await user.fetch();
        if (reaction.partial) await reaction.fetch();
        if (!reaction.emoji || !reaction.emoji.name) return;
        if (!reaction.message) return;

        const { message, emoji } = reaction;

        // DEBUG: Sadece yeni tepkileri göreceğiz.
        console.log(`[AKTİF TEPKİ] Rol Ekleme başladı: ${emoji.name} / ${user.tag}`);

        const MESSAGE_ID = client.config.MESSAGE_ID;
        if (message.id !== MESSAGE_ID) return;

        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP;
        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        const guild = message.guild;
        // Üyeyi çekme mantığı düzgün: tepkiyi veren kişiye rol verilir.
        const member = await guild.members.fetch(user.id).catch(() => null); 

        if (member) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);
                console.log(`[ROL EKLEME BAŞARILI] Rol: ${role.name} - Kullanıcı: ${user.tag}`);
            } else {
                console.error(`[HATA] Rol ID'si (${roleId}) sunucuda bulunamadı.`);
            }
        } else {
            return; // Sunucudan ayrılanları görmezden gel.
        }
    } catch (error) {
        const errorUserTag = user && user.tag ? user.tag : 'Bilinmeyen Kullanıcı';
        console.error(`Tepki (Ekleme) işlenirken kritik bir hata oluştu: (${errorUserTag})`, error);
    }
};
