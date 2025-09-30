// utils/reactionRoles.js VEYA events/reactionRoles.js (Aşağıdaki Loader Güncellemesine göre yerini seçin)

const { ROLE_EMOJI_MAP, REACTION_MESSAGE_ID } = require('../../config');
const { Events } = require('discord.js');

/**
 * Rol tepki (Reaction Roles) olay dinleyicilerini bot istemcisine kaydeder.
 * Loader bu fonksiyonu client objesi ile çağırır.
 * @param {Client} client - Discord bot istemcisi.
 */
module.exports = (client) => {

    // Tepkilerin önbelleğe alınması (Partial desteği için gereklidir)
    client.once(Events.ClientReady, async () => {
        const { REACTION_CHANNEL_ID } = require('../config');
        const channel = client.channels.cache.get(REACTION_CHANNEL_ID);
        if (channel) {
            try {
                // Mesajı çekerek önbelleğe alıyoruz.
                await channel.messages.fetch(REACTION_MESSAGE_ID);
                console.log('Rol tepki mesajı önbelleğe alındı.');
            } catch (error) {
                console.error('Rol tepki mesajı önbelleğe alınamadı:', error);
            }
        }
    });

    // --- Tepki Eklendiğinde Rol Verme ---
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
                    // console.log(`[ROL VERİLDİ] ${user.tag} -> ${role.name}`);
                }
            } catch (error) {
                console.error(`Rol verme hatası:`, error);
            }
        }
    });

    // --- Tepki Kaldırıldığında Rol Alma ---
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
                    // console.log(`[ROL ALINDI] ${user.tag} <- ${role.name}`);
                }
            } catch (error) {
                console.error(`Rol alma hatası:`, error);
            }
        }
    });
};
