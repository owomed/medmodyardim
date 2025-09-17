const fs = require('fs');
const { EmbedBuilder, ChannelType } = require('discord.js');

const COUNTER_SETTINGS_PATH = './messageCounterSettings.json';
const TARGET_CHANNEL_ID = '788355813244403735'; // İltifatın gönderileceği hedef kanal ID'si
const MESSAGE_THRESHOLD = 200; // Kaç mesajda bir iltifat atılacağı

// İltifatlar listesi
const iltifatlar = [
    'Günün nasıl geçtiğini merak ediyorum, umarım çok iyi geçiyordur!',
    'Seninle konuşmak her zaman bir zevk!',
    'Sen, tanıdığım en cesur insansın. Keşke senin gibi olabilseydim.',
    'Sen tanıdığım en tatlı insansın.',
    'Seninle konuşmak, ferah bir nefes almak gibidir.',
    'Bugün harika iş çıkardın. Seninle çalışmayı çok seviyorum.',
    'Enerjinin bulaşıcı olduğunu kendi gözlerimle gördüm. Sen mükemmel bir insansın.',
    'O kadar nazik ve anlayışlısın ki etrafındaki herkesi daha iyi bir insan yapmayı başarıyorsun.',
    'En kötü durumları bile eğlenceli bir hale dönüştürmene bayılıyorum.',
    'Keşke senin kadar mükemmel bir insan olabilseydim.',
    'Yaratıcılığın çok yüksek bir seviyede.',
    'İnsanlara güvenmeni seviyorum. Bu anlayışının bir kısmını bana gönderir misin?',
    'Ünlü olduğun zaman, hayran kulübünün tek başkanı olmak istiyorum.',
    'Çocuklarına çok iyi örnek oluyorsun. Her şeyi doğru yapmana bayılıyorum.',
    'Sen yeri doldurulamaz bir insansın.',
    'Farkında olduğundan daha harikasın.',
    'Senin gibi bir arkadaşımın olması özel hissetmeme neden oluyor.',
    'Beni hiçbir zaman hayal kırıklığına uğratmıyorsun. Ne olursa olsun sana güvenebileceğimi biliyorum.',
    'Kalbinin güzelliği, dış görünüşünden bile daha büyüleyici. Senin gibi içten ve güzel bir insana rastlamak benim için bir şans.',
    'Sadece güzelliğinle değil, aynı zamanda içtenliğinle de parlıyorsun. Seninle birlikte olmak, her anımı özel kılıyor.',
    'Bakışların, bir milyon sözcüğün anlamını taşıyor. Gözlerinde kaybolmak, en güzel macera.',
    'Sadece dış güzelliğinle değil, aynı zamanda iç güzelliğinle de ayakta alkışlanmayı hak ediyorsun. Her yönünle mükemmel bir insansın.',
    'Her adımında zarafet fışkırıyor. Seninle yürümek, dünyanın en güzel yolculuğu.',
    'Sana baktıkça, hayatın ne kadar güzel olduğunu hatırlıyorum. Etrafına ışık saçan bir güneş gibisin.',
    'Sesin, en tatlı melodilere ilham olur. Konuştuğunda, tüm dünya sustuğunda sadece senin sözlerini duymak istiyorum.',
    'Gülüşün, tüm karanlığı aydınlatan bir ışık huzmesi gibi. Seninle birlikte olduğumda, her şeyin daha güzel olduğunu hissediyorum.',
    'Kendine olan güvenin ve kararlılığın beni her zaman etkiliyor. Seninle birlikte olduğumda, kendimi daha da güçlü hissediyorum.',
    'Senin yanında zaman duruyor, dünya kayboluyor. Her anın, seninle geçirdiğim en değerli an.',
    'Düşüncelerin, en karmaşık problemlere bile çözüm bulabilecek bir zeka ve derinlik taşıyor. Seninle olan sohbetlerim, beni her zaman zenginleştiriyor.',
    'Sana baktığımda, hayata olan inancım güçleniyor. Seninle her şey daha da anlamlı hale geliyor.',
    'İçtenliğin, sıcaklığın ve sevecenliğin ile dünyayı daha güzel bir yer haline getiriyorsun.',
    'Her zaman pozitif enerjin ve neşenle etrafındaki herkesi etkiliyorsun. Seninle birlikteyken her anı dolu dolu yaşıyorum.',
    'Seninle birlikteyken, her anımızın bir fotoğraf karesine dönüşmesini istiyorum. Çünkü seninle her an ölümsüzleşiyor.'
];

// Sayaç ayarlarını yükleme ve kaydetme
function loadCounterSettings() {
    if (fs.existsSync(COUNTER_SETTINGS_PATH)) {
        try {
            const data = fs.readFileSync(COUNTER_SETTINGS_PATH, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Mesaj sayacı ayarları okunurken hata oluştu:', e);
            return { [TARGET_CHANNEL_ID]: { count: 0, lastComplimentRecipient: null } };
        }
    }
    return { [TARGET_CHANNEL_ID]: { count: 0, lastComplimentRecipient: null } };
}

function saveCounterSettings(settings) {
    try {
        fs.writeFileSync(COUNTER_SETTINGS_PATH, JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error('Mesaj sayacı ayarları kaydedilirken hata oluştu:', e);
    }
}

let counterSettings = loadCounterSettings();

module.exports = (client) => {
    client.on('messageCreate', async message => {
        // Bot kendi mesajlarını veya DM'leri saymasın
        if (message.author.bot || message.channel.type === ChannelType.DM) return;

        // Sadece hedef kanalda sayım yap
        if (message.channel.id === TARGET_CHANNEL_ID) {
            if (!counterSettings[TARGET_CHANNEL_ID]) {
                counterSettings[TARGET_CHANNEL_ID] = { count: 0, lastComplimentRecipient: null };
            }

            counterSettings[TARGET_CHANNEL_ID].count++;
            saveCounterSettings(counterSettings);

            console.log(`Kanal ${TARGET_CHANNEL_ID} mesaj sayısı: ${counterSettings[TARGET_CHANNEL_ID].count}`);

            // Belirlenen mesaj eşiğine ulaşıldıysa
            if (counterSettings[TARGET_CHANNEL_ID].count >= MESSAGE_THRESHOLD) {
                const recipient = message.author;

                if (recipient.id !== counterSettings[TARGET_CHANNEL_ID].lastComplimentRecipient) {
                    const iltifat = iltifatlar[Math.floor(Math.random() * iltifatlar.length)];
                    
                    const embed = new EmbedBuilder()
                        .setColor('#b4e5af')
                        .setTitle('Harika Bir İş Çıkardın!')
                        .setDescription(`${recipient}, ${iltifat}`)
                        .setThumbnail(recipient.displayAvatarURL({ dynamic: true, size: 1024 }))
                        .setFooter({
                            text: 'MED ilgimatik :D',
                            iconURL: client.user.displayAvatarURL()
                        });

                    try {
                        await message.channel.send({ embeds: [embed] });
                        counterSettings[TARGET_CHANNEL_ID].count = 0;
                        counterSettings[TARGET_CHANNEL_ID].lastComplimentRecipient = recipient.id;
                        saveCounterSettings(counterSettings);
                        console.log(`Kanal ${TARGET_CHANNEL_ID} için otomatik iltifat gönderildi.`);
                    } catch (error) {
                        console.error('Otomatik iltifat gönderilirken hata oluştu:', error);
                    }
                } else {
                    console.log(`Aynı kişiye arka arkaya iltifat edilmedi: ${recipient.tag}`);
                    counterSettings[TARGET_CHANNEL_ID].count = 0;
                    saveCounterSettings(counterSettings);
                }
            }
        }
    });
};
