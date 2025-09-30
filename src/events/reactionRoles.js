// reactionRoles.js

const { ROLE_EMOJI_MAP, REACTION_MESSAGE_ID } = require('./config');
const { Events } = require('discord.js');

/**
 * Rol tepki (Reaction Roles) olay dinleyicilerini bot istemcisine kaydeder.
 * @param {Client} client - Discord bot istemcisi.
 */
function initializeReactionRoles(client) {

    // --- Tepki Eklendiğinde Rol Verme (Events.MessageReactionAdd) ---
    client.on(Events.MessageReactionAdd, async (reaction, user) => {
        // Eğer tepki mesajı önbellekte yoksa (kısmi tepki), tam veriyi yükle.
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Tepkiyi çekerken hata:', error);
                return;
            }
        }

        // 1. Kontrol: Botun kendisi veya doğru mesaj değilse işlemi durdur.
        if (user.bot || reaction.message.id !== REACTION_MESSAGE_ID) return;

        // 2. Kontrol: Emoji'yi al (özel emoji ise ID, standart ise adı).
        const emojiKey = reaction.emoji.id || reaction.emoji.name;

        // 3. Kontrol: Emoji haritamızda tanımlı mı?
        if (ROLE_EMOJI_MAP[emojiKey]) {
            const roleId = ROLE_EMOJI_MAP[emojiKey];
            
            try {
                // Üyeyi ve sunucuyu (guild) al.
                const guild = reaction.message.guild;
                const member = await guild.members.fetch(user.id);
                const role = guild.roles.cache.get(roleId);

                // Rol ve üye var mı kontrol et.
                if (role && member) {
                    await member.roles.add(role);
                    console.log(`[ROL VERİLDİ] ${user.tag} -> ${role.name}`);
                }
            } catch (error) {
                console.error(`Rol verme hatası (${user.tag}):`, error);
            }
        }
    });

    // --- Tepki Kaldırıldığında Rol Alma (Events.MessageReactionRemove) ---
    client.on(Events.MessageReactionRemove, async (reaction, user) => {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Tepkiyi çekerken hata:', error);
                return;
            }
        }

        // 1. Kontrol: Botun kendisi veya doğru mesaj değilse işlemi durdur.
        if (user.bot || reaction.message.id !== REACTION_MESSAGE_ID) return;
        
        // 2. Kontrol: Emoji'yi al.
        const emojiKey = reaction.emoji.id || reaction.emoji.name;

        // 3. Kontrol: Emoji haritamızda tanımlı mı?
        if (ROLE_EMOJI_MAP[emojiKey]) {
            const roleId = ROLE_EMOJI_MAP[emojiKey];

            try {
                // Üyeyi ve sunucuyu (guild) al.
                const guild = reaction.message.guild;
                const member = await guild.members.fetch(user.id);
                const role = guild.roles.cache.get(roleId);
                
                // Rol ve üye var mı kontrol et.
                if (role && member) {
                    await member.roles.remove(role);
                    console.log(`[ROL ALINDI] ${user.tag} <- ${role.name}`);
                }
            } catch (error) {
                console.error(`Rol alma hatası (${user.tag}):`, error);
            }
        }
    });

}

module.exports = { initializeReactionRoles };
