// src/commands/syncReactions.js

const { PermissionFlagsBits } = require('discord.js');
const { ROLE_EMOJI_MAP, REACTION_MESSAGE_ID, REACTION_CHANNEL_ID } = require('../../config');

module.exports = {
    // Komut adı (Prefix'ten sonra kullanılacak)
    name: 'reaksiyon-sync', 
    // Diğer isimler (isteğe bağlı)
    aliases: ['rsync', 'syncreactions'], 
    description: 'Rol tepki mesajındaki tüm reaksiyonları temizler ve config dosyasındakileri yeniden ekler.',
    // Sadece Rolleri Yönet yetkisi olanlar kullanabilir
    permissions: [PermissionFlagsBits.ManageRoles], 
    
    /**
     * Komutu çalıştırır.
     * @param {Client} client - Discord bot istemcisi.
     * @param {Message} message - Komutun gönderildiği mesaj objesi.
     * @param {string[]} args - Komut argümanları.
     */
    async execute(client, message, args) {
        
        // Komutu çalıştıran kullanıcının yetkisini kontrol et
        if (!message.member.permissions.has(this.permissions)) {
            return message.reply({ content: 'Bu komutu kullanmak için `Rolleri Yönet` yetkisine sahip olmalısın.', ephemeral: true });
        }

        try {
            // Tepkileri temizleme işleminin başladığını bildir
            const syncingMessage = await message.reply('🔄 Rol tepkilerini temizliyor ve yeniden ekliyorum...');

            // Kanalı ve Mesajı Çek
            const channel = message.guild.channels.cache.get(REACTION_CHANNEL_ID);
            if (!channel) {
                return syncingMessage.edit(`Hata: Kanal ID'si (\`${REACTION_CHANNEL_ID}\`) bulunamadı.`);
            }

            const reactionMessage = await channel.messages.fetch(REACTION_MESSAGE_ID);
            if (!reactionMessage) {
                return syncingMessage.edit(`Hata: Mesaj ID'si (\`${REACTION_MESSAGE_ID}\`) bulunamadı. ID'yi kontrol edin.`);
            }

            // 1. ADIM: Mevcut Tüm Tepkileri Kaldır
            await reactionMessage.reactions.removeAll();
            console.log(`[SYNC] ${REACTION_MESSAGE_ID} mesajındaki tüm reaksiyonlar temizlendi.`);

            // 2. ADIM: Config'deki Emojileri Sırayla Tekrar Ekle
            const emojis = Object.keys(ROLE_EMOJI_MAP);
            let successCount = 0;
            
            for (const emoji of emojis) {
                try {
                    await reactionMessage.react(emoji);
                    successCount++;
                } catch (e) {
                    // Botun o emojiyi ekleyememesi (genellikle özel emojilerde olur)
                    console.error(`[SYNC HATA] Emoji ${emoji} eklenirken hata:`, e.message);
                }
            }

            // Başarılı Yanıtı Güncelle
            await syncingMessage.edit({ 
                content: `✅ Rol tepki mesajı başarıyla senkronize edildi!\n\n**Toplam Tepki:** \`${successCount} / ${emojis.length}\` tepki eklendi.`
            });

        } catch (error) {
            console.error('Reaksiyon senkronizasyon hatası:', error);
            await message.reply({ 
                content: 'İşlem sırasında beklenmedik bir hata oluştu. Lütfen botun izinlerini kontrol edin (Tepkileri Yönet yetkisi).'
            });
        }
    },
};
