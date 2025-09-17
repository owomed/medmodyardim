const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // Slash komutu için veri
    data: new SlashCommandBuilder()
        .setName('ilgi')
        .setDescription('Etiketlenen kişiye rastgele bir iltifat eder.')
        .addUserOption(option =>
            option.setName('kullanıcı')
                .setDescription('İltifat edilecek kullanıcıyı etiketleyin.')
                .setRequired(true)),

    // Prefix komutu için ad
    name: 'ilgi',

    async execute(interactionOrMessage, args) {
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

        // Komutun türüne göre kullanıcıyı al
        let user;
        if (interactionOrMessage.isChatInputCommand) {
            user = interactionOrMessage.options.getUser('kullanıcı');
        } else {
            user = interactionOrMessage.mentions.users.first();
            if (!user) {
                await interactionOrMessage.channel.send('Lütfen bir kişiyi etiketleyin.');
                return;
            }
        }

        const iltifat = iltifatlar[Math.floor(Math.random() * iltifatlar.length)];

        const embed = new EmbedBuilder()
            .setColor('#b4e5af')
            .setTitle('❤❤❤')
            .setDescription(`${user.tag}, ${iltifat}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({
                text: 'Developed by Kazolegendd/ Nostalgically edited by hicckimse',
                iconURL: 'https://cdn.discordapp.com/avatars/1149394269061271562/a_c1715253097d7f531489af59abb3ea05.gif?size=1024'
            });

        // Komutun türüne göre farklı yanıtlar veriyoruz
        if (interactionOrMessage.isChatInputCommand) {
            await interactionOrMessage.reply({ embeds: [embed] });
        } else {
            await interactionOrMessage.channel.send({ embeds: [embed] });
            // Prefix komutunda mesajı silme işlevini koruyoruz
            try {
                await interactionOrMessage.delete();
            } catch (error) {
                console.error('Mesaj silinirken bir hata oluştu:', error);
            }
        }
    },
};
