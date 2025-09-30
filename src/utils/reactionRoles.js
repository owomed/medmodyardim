// src/utils/reactionRoles.js

// 1. Düzeltme: Tüm config verilerini bir kez, doğru yoldan yükle. (../../config)
const { 
    ROLE_EMOJI_MAP, 
    REACTION_MESSAGE_ID, 
    REACTION_CHANNEL_ID // REACTION_CHANNEL_ID de buraya eklendi
} = require('../../config');
const { Events } = require('discord.js');

/**
 * Rol tepki (Reaction Roles) olay dinleyicilerini bot istemcisine kaydeder.
 * Loader bu fonksiyonu client objesi ile çağırır.
 * @param {Client} client - Discord bot istemcisi.
 */
module.exports = (client) => {

    // Tepkilerin önbelleğe alınması (Partial desteği için gereklidir)
    client.once(Events.ClientReady, async () => {
        // Hata buradaydı: Tekrar require etmeye gerek yok, yukarıdaki değişkeni kullanıyoruz.
        const channel = client.channels.cache.get(REACTION_CHANNEL_ID); 
        
        if (channel) {
            try {
                // Mesajı çekerek önbelleğe alıyoruz.
                await channel.messages.fetch(REACTION_MESSAGE_ID);
                console.log('✅ Rol tepki mesajı önbelleğe alındı.');
            } catch (error) {
                console.error('❌ Rol tepki mesajı önbelleğe alınamadı. Mesaj ID\'sini kontrol edin:', error.message);
            }
        }
    });

    // --- Tepki Eklendiğinde Rol Verme (Add) ---
    client.on(Events.MessageReactionAdd, async (reaction, user) => {
        if (user.bot || reaction.message.id !== REACTION_MESSAGE_ID) return;

        // Partial desteği: Eğer tepki önbellekte yoksa tamamını yükle
        if (reaction.partial) await reaction.fetch().catch(err => console.error(err));

        const emojiKey = reaction.emoji.id || reaction.emoji.name;

        if (ROLE_EMOJI_MAP[emojiKey]) {
            const roleId = ROLE_EMOJI_MAP[emojiKey];
            try {
                const guild = reaction.message.guild;
                const member = await guild.members.fetch(user.id);
                const role = guild.roles.cache.get(roleId);

                if (role && member) {
                    await member.roles.add(role);
                }
            } catch (error) {
                console.error(`❌ Rol verme hatası (${user.tag}):`, error);
            }
        }
    });

    // --- Tepki Kaldırıldığında Rol Alma (Remove) ---
    client.on(Events.MessageReactionRemove, async (reaction, user) => {
        if (user.bot || reaction.message.id !== REACTION_MESSAGE_ID) return;
        
        // Partial desteği
        if (reaction.partial) await reaction.fetch().catch(err => console.error(err));

        const emojiKey = reaction.emoji.id || reaction.emoji.name;

        if (ROLE_EMOJI_MAP[emojiKey]) {
            const roleId = ROLE_EMOJI_MAP[emojiKey];

            try {
                const guild = reaction.message.guild;
                const member = await guild.members.fetch(user.id);
                const role = guild.roles.cache.get(roleId);

                if (role && member) {
                    await member.roles.remove(role);
                }
            } catch (error) {
                console.error(`❌ Rol alma hatası (${user.tag}):`, error);
            }
        }
    });
};
