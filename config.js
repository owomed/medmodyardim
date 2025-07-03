// Bu dosya doğrudan botun token'ını içerebilir.
// Ancak hassas bilgileri .env dosyalarında tutmak daha güvenlidir.
// Bu durumda, sadece token'ı process.env.TOKEN'dan çekeriz.
module.exports = {
    token: process.env.TOKEN,
    
    // Diğer global ayarlar veya sabitler buraya gelebilir.
    // Ancak kodunuzdaki mevcut sabitler index.js'te tutulmuş.
};