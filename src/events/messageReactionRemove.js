module.exports = async (client, reaction, user) => {
    if (user.bot) return;

    try {
        const { message, emoji } = reaction;
        const MESSAGE_ID = client.config.MESSAGE_ID; // config'ten alıyoruz
        const ROLE_EMOJI_MAP = client.config.ROLE_EMOJI_MAP; // config'ten alıyoruz

        if (message.id !== MESSAGE_ID) return;

        const roleId = ROLE_EMOJI_MAP[emoji.name];
        if (!roleId) return;

        const member = message.guild.members.cache.get(user.id);
        if (member) {
            const role = message.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.remove(roleId);
                console.log(`Rol kaldırıldı: ${role.name} (${roleId})`);
            } else {
                console.error('Rol bulunamadı:', roleId);
            }
        } else {
            console.error('Üye bulunamadı:', user.id);
        }
    } catch (error) {
        console.error('Tepki işlenirken bir hata oluştu:', error);
    }
};