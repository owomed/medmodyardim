const fs = require('fs');

const settingsFilePath = './settings.json';

// JSON dosyasını yükleme ve kaydetme fonksiyonları
function loadSettings() {
    if (fs.existsSync(settingsFilePath)) {
        try {
            const data = fs.readFileSync(settingsFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Error reading settings file:', e);
            return {};
        }
    }
    return {};
}

function saveSettings(settings) {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
}

// 1 saat sonra ayarları temizleme
function scheduleClearChannel(client, channelId) {
    setTimeout(() => {
        const settings = loadSettings();
        if (settings[channelId]) {
            delete settings[channelId];
            saveSettings(settings);
            console.log(`Kanal ${channelId} için emoji oyunu ayarları temizlendi.`);
        }
    }, 3600000);
}

// Yeni emoji türleri
const emojiTypes = {
    1: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😶‍🌫️', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '🙂‍↔️', '🙂‍↕️', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😮‍💨', '😵', '😵‍💫', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'],
    2: ['🤝', '🤲', '👐', '🙌', '👏', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🖕', '✍️', '🙏', '🦶', '🦵'],
    3: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🐦‍⬛', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🦓', '🐆', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🦙', '🐑', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐕‍🦺', '🐈', '🐈‍⬛'],
    4: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍋‍🟩', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🍭', '🍬', '🍡', '🍢', '🍫', '🍿', '🍩', '🍪'],
    5: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '🏂', '🪂', '🎨', '🎯', '🎳', '🎮', '🎼']
};

// allEmojis yerine, artık seçilen türe göre emoji alacağız.
// Bu `allEmojis` değişkenine artık ihtiyacımız kalmayacak veya daha dinamik hale getirebiliriz.
// Şimdilik sadece emojiTypes objesini kullanacağız.

module.exports = (client) => {
    // .emoji komutu
    client.on('messageCreate', message => {
        if (message.content.startsWith('.emoji')) {
            const settings = loadSettings();
            const channelId = message.channel.id;

            // Etkinlik bitiş zamanını hesapla (1 saat sonra)
            const endTime = Date.now() + 3600000; // ms cinsinden 1 saat

            if (settings[channelId] && Date.now() - settings[channelId].lastUsed < 3600000) {
                return message.channel.send('Bu komutu tekrar kullanamazsınız, lütfen 1 saat bekleyin.');
            }

            // Mevcut emoji türünü al, yoksa rastgele bir tür seç
            let currentEmojiType = settings[channelId]?.currentEmojiType;
            if (!currentEmojiType || !emojiTypes[currentEmojiType]) {
                const availableTypes = Object.keys(emojiTypes);
                currentEmojiType = parseInt(availableTypes[Math.floor(Math.random() * availableTypes.length)]);
            }

            const selectedTypeEmojis = emojiTypes[currentEmojiType];
            const emojis = [];
            while (emojis.length < 5) {
                const randomEmoji = selectedTypeEmojis[Math.floor(Math.random() * selectedTypeEmojis.length)];
                if (!emojis.includes(randomEmoji)) {
                    emojis.push(randomEmoji);
                }
            }

            const emojiStocks = Array(emojis.length).fill(1);

            // Ayarlara 'endTime' ve 'currentEmojiType' bilgisini ekle/güncelle
            settings[channelId] = { emojis, emojiStocks, lastUsed: Date.now(), endTime: endTime, currentEmojiType: currentEmojiType };
            saveSettings(settings);

            const formattedEndTime = `<t:${Math.floor(endTime / 1000)}:t>`; // hh:mm AM/PM formatı için 't'

            const normalMessageContent = `## İyi Günler OwO MED Ailesi <a:owo:1235316485942022185>

Saat **${formattedEndTime}**'a kadar <#1238045899360309289> <#1277593114269454396> <#1277593211363262546> ve <#1277593298047078460> kanallarında OwO oynuyoruz.

> OwO yazarak <@519287796549156864> 'un verdiği tepkilerden ${emojis.join(', ')} emojilerini bulanlara
> 
**STOK:**
${emojis.map((emoji, index) => `\`${emoji}\` **=>** *75.000* <:Med_cowoncy:1235298123971170417> **(${emojiStocks[index]})**`).join('\n')}

> <a:med_alert:1235237329799614619> Özel reminder sahibi olanlar oynamaya başlamadan önce **!r item, sonrasında ise !r g disable {owo reminder ID}** yazsın.

> - Emoji çıkan kişiler; Ödül alabilmeniz için sunucu içinde __**en az 100 OwO statınız olması gerekiyor.**__
> <:med_pinkdot:1272463632772632638> Stat ne demek bilmiyorsanız <:med_pinkquestionmark:1277529121504890891> **!rr** yazdığınızda en üstteki __Today__ bölümü en least 100 olması gerekiyor.
> <a:med_alert:1235237329799614619> <@519287796549156864>'tan owo bildirimi almak için **!r owo** yazdıktan sonra *owo yazan buton kırmızıysa tıklayarak yeşil hale getirmeniz gerekiyor!* Eğer yeşilse bir şey yapmanıza gerek yok!
> <a:med_alert:1235237329799614619> Sunucu hatırlatıcısını kullanmayan ödül kazanamaz!
> **BOL ŞANSLAR** <a:med_opucuk:1242802775281369140>`;

            message.channel.send(normalMessageContent);

            scheduleClearChannel(client, channelId);
        }
    });

    // .türdeğiş komutu
    client.on('messageCreate', message => {
        if (message.content.startsWith('.türdeğiş')) {
            const settings = loadSettings();
            const channelId = message.channel.id;
            const channelSettings = settings[channelId];

            if (!channelSettings) {
                return message.channel.send('Bu kanalda aktif bir emoji oyunu bulunamadı. Lütfen önce `.emoji` komutunu kullanarak bir oyun başlatın.');
            }

            const usedType = channelSettings.currentEmojiType;
            const availableTypes = Object.keys(emojiTypes).map(Number); // Tür numaralarını al
            const unusedTypes = availableTypes.filter(type => type !== usedType);

            if (unusedTypes.length === 0) {
                return message.channel.send('Değiştirecek başka emoji türü kalmadı! Tüm türler kullanılıyor.');
            }

            // Kalan türler arasından rastgele birini seç
            const newType = unusedTypes[Math.floor(Math.random() * unusedTypes.length)];
            
            // Yeni türü ve buna bağlı olarak yeni emojileri belirle
            const selectedTypeEmojis = emojiTypes[newType];
            const newEmojis = [];
            while (newEmojis.length < 5) {
                const randomEmoji = selectedTypeEmojis[Math.floor(Math.random() * selectedTypeEmojis.length)];
                if (!newEmojis.includes(randomEmoji)) {
                    newEmojis.push(randomEmoji);
                }
            }
            const newEmojiStocks = Array(newEmojis.length).fill(1);
            const newEndTime = Date.now() + 3600000; // Tür değiştiğinde bitiş süresini de sıfırla

            // Ayarları güncelle
            channelSettings.currentEmojiType = newType;
            channelSettings.emojis = newEmojis;
            channelSettings.emojiStocks = newEmojiStocks;
            channelSettings.endTime = newEndTime;
            channelSettings.lastUsed = Date.now(); // Komutun kullanıldığı zamanı da güncelle

            saveSettings(settings);

            message.channel.send(`Emoji türü başarıyla **Tür ${newType}** olarak değiştirildi! Yeni emojiler ve stoklar yüklendi.`)
            
            // Yeni emojileri ve stokları da göstermek için .stok komutunun içeriğini buraya da koyabiliriz.
            // Veya sadece .stok komutunu tekrar çalıştırmasını söyleyebiliriz.
            // Örnek: message.channel.send(`Emoji türü başarıyla **Tür ${newType}** olarak değiştirildi! Lütfen `.stok` yazarak yeni emojileri görün.`);

            // Yeni emojileri göstermek için .stok komutunun mesajını tekrar oluşturup gönderelim:
            const remainingEmojisList = newEmojis.join(' ');
            const stockInfo = newEmojis.map((emoji, index) =>
                `\`${emoji}\` **=>** *75.000* <:Med_cowoncy:1235298123971170417> **(${newEmojiStocks[index]})**`
            ).join('\n');
            const eventEndTimeText = newEndTime ? `<t:${Math.floor(newEndTime / 1000)}:R>` : 'Bilinmiyor';

            const newStokMessage = `**OwO Emoji Etkinliği**

**Kalan Emojiler:**
${remainingEmojisList}

**Stok:**
${stockInfo}

**Etkinlik Bitiş Zamanı:**
${eventEndTimeText}

**Bol Şanslar!**`;

            message.channel.send(newStokMessage);
        }
    });

    // .değiş komutu (mevcut türdeki emojileri değiştirecek şekilde güncellendi)
    client.on('messageCreate', message => {
        if (message.content.startsWith('.değiş')) {
            const settings = loadSettings();
            const channelSettings = settings[message.channel.id];

            if (!channelSettings || !channelSettings.currentEmojiType) {
                return message.channel.send('Bu kanalda aktif bir emoji oyunu bulunamadı veya emoji türü belirlenmemiş. Lütfen önce `.emoji` komutunu kullanarak bir oyun başlatın.');
            }

            const currentEmojiType = channelSettings.currentEmojiType;
            const selectedTypeEmojis = emojiTypes[currentEmojiType]; // Mevcut türden emoji çek

            const emojis = [];
            while (emojis.length < 5) {
                const randomEmoji = selectedTypeEmojis[Math.floor(Math.random() * selectedTypeEmojis.length)];
                if (!emojis.includes(randomEmoji)) {
                    emojis.push(randomEmoji);
                }
            }

            const endTime = Date.now() + 3600000; // .değiş yapıldığında da bitiş süresi güncellenmeli

            channelSettings.emojis = emojis;
            channelSettings.emojiStocks = Array(emojis.length).fill(1);
            channelSettings.endTime = endTime; // endTime'ı da güncelle
            saveSettings(settings);

            const formattedEndTime = `<t:${Math.floor(endTime / 1000)}:t>`; // hh:mm AM/PM formatı için 't'

            const normalMessageContent = `## İyi Günler OwO MED Ailesi <a:owo:1235316485942022185>

Saat **${formattedEndTime}**'a kadar <#1238045899360309289> <#1277593114269454396> <#1277593211363262546> ve <#1277593298047078460> kanallarında OwO oynuyoruz.

> OwO yazarak <@519287796549156864> 'un verdiği tepkilerden ${emojis.join(', ')} emojilerini bulanlara
> 
**STOK:**
${emojis.map((emoji, index) => `\`${emoji}\` **=>** *75.000* <:Med_cowoncy:1235298123971170417> **(${channelSettings.emojiStocks[index]})**`).join('\n')}

> <a:med_alert:1235237329799614619> Özel reminder sahibi olanlar oynamaya başlamadan önce **!r item, sonrasında ise !r g disable {owo reminder ID}** yazsın.

> - Emoji çıkan kişiler; Ödül alabilmeniz için sunucu içinde __**en az 100 OwO statınız olması gerekiyor.**__
> <:med_pinkdot:1272463632772632638> Stat ne demek bilmiyorsanız <:med_pinkquestionmark:1277529121504890891> **!rr** yazdığınızda en üstteki __Today__ bölümü en least 100 olması gerekiyor.
> <a:med_alert:1235237329799614619> <@519287796549156864>'tan owo bildirimi almak için **!r owo** yazdıktan sonra *owo yazan buton kırmızıysa tıklayarak yeşil hale getirmeniz gerekiyor!* Eğer yeşilse bir şey yapmanıza gerek yok!
> <a:med_alert:1235237329799614619> Sunucu hatırlatıcısını kullanmayan ödül kazanamaz!
> **BOL ŞANSLAR** <a:med_opucuk:1242802775281369140>`;

            message.channel.send(normalMessageContent);
        }
    });

    // .stok komutu (Değişiklik yok, önceki güncellemede yapılmıştı)
    client.on('messageCreate', message => {
        if (message.content.startsWith('.stok')) {
            const settings = loadSettings();
            const channelSettings = settings[message.channel.id];

            if (!channelSettings) {
                return message.channel.send('Bu kanalda aktif bir emoji oyunu yok.');
            }

            const { emojis, emojiStocks, endTime, currentEmojiType } = channelSettings;

            const remainingEmojisList = emojis.join(' ');

            const stockInfo = emojis.map((emoji, index) =>
                `\`${emoji}\` **=>** *75.000* <:Med_cowoncy:1235298123971170417> **(${emojiStocks[index]})**`
            ).join('\n');

            const eventEndTimeText = endTime ? `<t:${Math.floor(endTime / 1000)}:R>` : 'Bilinmiyor';

            const normalMessageContent = `**OwO Emoji Etkinliği** (Aktif Tür: **${currentEmojiType || 'Belirlenmedi'}**)

**Kalan Emojiler:**
${remainingEmojisList}

**Stok:**
${stockInfo}

**Etkinlik Bitiş Zamanı:**
${eventEndTimeText}

**Bol Şanslar!**`;

            message.channel.send(normalMessageContent);
        }
    });

    // Mesaj sabitleme ve stok güncelleme (Değişiklik yok)
    client.on('messageCreate', async message => {
        if (message.author.bot || message.channel.type === 'dm') return;

        const settings = loadSettings();

        if (settings[message.channel.id]) {
            const { emojis, emojiStocks } = settings[message.channel.id];

            const contentEmojis = Array.from(message.content).filter(char => emojis.includes(char));

            if (message.author.id === '519287796549156864') {
                let stokChanged = false;
                contentEmojis.forEach(emoji => {
                    const index = emojis.indexOf(emoji);
                    if (index !== -1 && emojiStocks[index] > 0) {
                        emojiStocks[index] -= 1;
                        stokChanged = true;
                    }
                });

                if (contentEmojis.length > 0) {
                    try {
                        await message.pin();
                        console.log('Mesaj sabitlendi:', message.content);
                    } catch (e) {
                        console.error('Mesaj sabitlenemedi:', e);
                    }
                }

                if (stokChanged) {
                    saveSettings(settings);
                }
            }
        }
    });
};