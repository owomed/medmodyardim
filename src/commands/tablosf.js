// src/commands/tablosf.js
const { MessageEmbed } = require('discord.js'); // Orijinal kodunuzdaki gibi MessageEmbed kullanıldı
const fs = require('fs'); // fs modülü dosya okuma/yazma için gerekli

// Puan tablosu dosyasının yolu
const pointsFilePath = './points.json'; // Orijinal yol korundu, botun çalıştığı ana dizine göre './'

// Komutu kullanabilecek rolün ID'si
const allowedRoleId = '1236317902295138304'; 

// Puan tablosunu JSON dosyasından yükle
function loadPoints() {
    let points = {};
    if (fs.existsSync(pointsFilePath)) {
        const fileContent = fs.readFileSync(pointsFilePath, 'utf-8');
        if (fileContent.trim()) { // Dosya içeriği boş değilse
            try {
                points = JSON.parse(fileContent);
            } catch (error) {
                console.error('Puan dosyası okunurken JSON ayrıştırma hatası:', error);
                // Hatalı JSON durumunda boş bir obje döndür veya varsayılan değerleri kullan
                points = {}; 
            }
        }
    }
    return points;
}

// Puan tablosunu JSON dosyasına kaydet
function savePoints(points) {
    try {
        fs.writeFileSync(pointsFilePath, JSON.stringify(points, null, 2));
    } catch (error) {
        console.error('Puan dosyası kaydedilirken hata oluştu:', error);
    }
}

// Global puan tablosu değişkeni
// Bu değişkenin, botun her yeniden başlatılışında dosyadan yüklenmesini sağlar.
let points = loadPoints();

// Bu fonksiyonlar, botun ana döngüsünde veya başka bir yerde tanımlanmış olmalı
// ve burada sadece referans olarak verilmiştir. `client.channels.cache.get(logChannelId)`
// gibi kısımlar için `logChannelId`'nin tanımlı olması gerekir.
// Eğer bu fonksiyonlar bu komut dosyasının dışında kullanılıyorsa, burada olmaları sorun yaratmaz.
// Ancak komutun kendi `execute` fonksiyonu ile doğrudan alakalı değiller.

// Varsayılan değerler, bu değişkenlerin tanımlandığı asıl yerden gelmeli
let currentNumber = 0; // Bu değişkenin dışarıdan yönetilmesi beklenir
let currentGuesses = {}; // Bu değişkenin dışarıdan yönetilmesi beklenir
const logChannelId = 'YOUR_LOG_CHANNEL_ID_HERE'; // Lütfen buraya doğru log kanal ID'sini girin

function resetGame() {
    currentNumber = Math.floor(Math.random() * 11);
    currentGuesses = {}; // Yeni tur başladığında tahminleri sıfırla

    // Eğer logChannelId tanımlı ve geçerli bir kanal ise mesaj gönder
    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel) {
        logChannel.send(`Yeni sayıyı tuttum, tahminlerinizi yapabilirsiniz!`);
    } else {
        console.warn(`Log kanalı (${logChannelId}) bulunamadı veya geçersiz.`);
    }
    
    // setTimeout'un client objesinde tanımlı olduğundan emin olun veya global setTimeout kullanın.
    setTimeout(() => revealNumber(), 15000);
}

function revealNumber() {
    let correctGuessers = [];

    for (let userId in currentGuesses) {
        if (currentGuesses[userId] === currentNumber) {
            correctGuessers.push(`<@${userId}>`);
            if (!points[userId]) {
                points[userId] = { score: 0 };
            }
            points[userId].score += 1;
        }
    }

    const embed = new MessageEmbed()
        .setTitle('Tahmin Sonuçları')
        .setDescription(
            `Tuttuğum sayı: **${currentNumber}**\n\n${
                correctGuessers.length > 0
                    ? `Bu kullanıcılar doğru tahmin etti: ${correctGuessers.join(', ')}`
                    : 'Hiç kimse doğru tahmin edemedi.'
            }`
        )
        .setColor('BLUE')
        .addField(
            'Puan Tablosu',
            Object.entries(points)
                .map(([userId, data]) => `<@${userId}>: ${data.score} puan`)
                .join('\n') || 'Henüz kimse puan kazanmadı.'
        );

    // Eğer logChannelId tanımlı ve geçerli bir kanal ise embed gönder
    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel) {
        logChannel.send({ embeds: [embed] });
    } else {
        console.warn(`Log kanalı (${logChannelId}) bulunamadı veya geçersiz.`);
    }

    savePoints(points); // Puanları kaydet
    resetGame();
}

// Export edilen komut objesi
module.exports = {
    name: 'agayapsuisi', // Komut adı
    description: 'Puan tablosunu gösterir ve ardından sıfırlar',
    async execute(client, message) {
        // Rol kontrolünü en başta yap
        // Orijinal kodunuzdaki message.member.roles.cache.has(allowedRoleId) kullanımı olduğu gibi bırakıldı.
        if (!message.member.roles.cache.has(allowedRoleId)) {
            return message.channel.send('Bu komutu kullanma izniniz yok.');
        }

        // Komut çalıştırılmadan önce rol kontrolü geçildiğinde devam eder
        // Not: currentPoints'e kopyalama, sıfırlama işlemi sırasında orijinalin anlık görüntüsünü almanızı sağlar.
        const currentPoints = { ...points }; 

        const embed = new MessageEmbed()
            .setTitle('Puan Tablosu')
            .setDescription('Tahmin oyunundaki güncel puan durumu:')
            .setColor('RED')
            .addField(
                'Puanlar',
                Object.entries(currentPoints).length > 0
                    ? Object.entries(currentPoints)
                          .map(([userId, data]) => `<@${userId}>: ${data.score} puan`)
                          .join('\n')
                    : 'Henüz kimse puan kazanmadı.'
            );

        // Puan tablosunu göster
        await message.channel.send({ embeds: [embed] });

        // Global points değişkenini ve JSON dosyasını sıfırla
        points = {}; // Bellekteki points objesini sıfırla
        savePoints(points); // Değişikliği points.json dosyasına kaydet
        message.channel.send('Puan tablosu sıfırlandı.');
    },
    // Eğer `resetGame` ve `revealNumber` fonksiyonlarına dışarıdan erişilmesi gerekiyorsa
    // veya bu komut dosyası bir oyunun yönetimini yapıyorsa, onları da export edebilirsiniz.
    // Ancak bu haliyle sadece komutun execute fonksiyonu export ediliyor.
    // Örneğin: resetGame, revealNumber
};

// Bu kısım, `module.exports` dışında kalan ve sadece bu dosya içinde geçerli olan fonksiyonları içerir.
// Eğer bu fonksiyonların botun diğer kısımlarından (örneğin bir cron job'dan) çağrılması gerekiyorsa,
// bunları ya `module.exports` objesinin bir parçası yapmalı ya da loader'da direkt olarak bu dosyayı
// çağırırken dönen objeden erişmelisiniz (eğer export edilmişlerse).
// Şu anki durum, bu fonksiyonların bu dosya içinde diğer bazı mekanizmalar tarafından çağrıldığını varsayar.