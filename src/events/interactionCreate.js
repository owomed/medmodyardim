// src/events/interactionCreate.js
const { Permissions, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { createWriteStream } = require('fs'); // saveTicket için gerekli

// Rol komutlarınızı import edin
const colorRolesCommand = require('../commands/colorRoles');
const infoRolesCommand = require('../commands/infoRoles');

let ticketCounter = 1; // Ticket sayacı (bot her başlatıldığında 1'e sıfırlanır)

module.exports = async (client, interaction) => {
    // Sadece Select Menu veya Button etkileşimlerini işle
    if (!interaction.isSelectMenu() && !interaction.isButton()) {
        return; 
    }

    const customId = interaction.customId;
    const req = customId.split('_')[0]; // Ticket sistemi customId'lerinin ilk kısmını alır

    // --- ÖNCELİK 1: SELECT MENU Etkileşimlerini İşle (Rol Alma Menüleri) ---
    // Eğer etkileşim bir Select Menu ise, bu kısım çalışır.
    if (interaction.isSelectMenu()) {
        // Renk rolü etkileşimini işle
        // customId'niz 'colorSelect' ile EŞLEŞMELİ
        if (customId === 'colorSelect') { 
            await colorRolesCommand.handleInteraction(client, interaction);
            return; // Rol etkileşimi işlendi, buradan çık
        }

        // Bilgi rolü etkileşimini işle
        // customId'niz 'BilgiSelect' ile EŞLEŞMELİ (Büyük 'B' ile)
        if (customId === 'BilgiSelect') { 
             await infoRolesCommand.handleInteraction(client, interaction);
             return; // Rol etkileşimi işlendi, buradan çık
        }
        
        // NOT: Ticket Sistemi'nin eski 'newTicket' select menüsü varsa, buraya eklenmeliydi.
        // Ama önceki kararımızla 'createTicket' direkt butonla kanal açtığı için bu kısım sadeleşti.
        // Eğer ticket sistemi için ileride tekrar bir select menu adımı eklerseniz, o kısmı buraya eklemeniz gerekecek.
    }

    // --- ÖNCELİK 2: BUTON Etkileşimlerini İşle (Ticket Sistemi Butonları) ---
    // Eğer etkileşim bir Button ise, bu kısım çalışır.
    if (interaction.isButton()) {
        const categoryId = '1268509251911811175'; // Ticket Kategori ID'si

        switch (req) {
            case 'createTicket': {
                client.emit('ticketsLogs', req, interaction.guild, interaction.member.user);

                const existingTicket = interaction.guild.channels.cache.find(
                    c => c.type === 'GUILD_TEXT' && 
                         c.topic && 
                         c.topic.includes(`Bilet ${interaction.member.user.username}`) &&
                         !c.name.startsWith('closed-') 
                );

                if (existingTicket) {
                    return interaction.reply({ content: `Zaten açık bir biletiniz var: <#${existingTicket.id}>`, ephemeral: true });
                }

                const channel = await interaction.guild.channels.create(`ticket-${ticketCounter}`, {
                    type: 'GUILD_TEXT',
                    topic: `Bilet ${interaction.member.user.username} tarafından oluşturuldu. ${new Date(Date.now()).toLocaleString()}`,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
                        { id: interaction.member.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'] },
                        { id: client.user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'] }
                    ],
                    parent: categoryId
                });

                ticketCounter++;

                const ticketEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setAuthor(`Biletiniz başarıyla oluşturuldu ${interaction.member.user.username} ✅`)
                    .setDescription('*Mevcut bileti kapatmak için aşağıdaki butona tıklayın, dikkat geri dönemeyeceksiniz!*');

                await channel.send(`<@${interaction.member.id}>`);
                const closeButton = new MessageButton()
                    .setStyle('DANGER')
                    .setLabel('Bu bileti kapat')
                    .setCustomId(`closeTicket_${interaction.member.id}`);

                const row = new MessageActionRow().addComponents(closeButton);

                await channel.send({ embeds: [ticketEmbed], components: [row] });
                return interaction.reply({ content: `Biletiniz Açıldı <@${interaction.member.id}> <#${channel.id}> ✅`, components: [], ephemeral: true });
            }

            case 'closeTicket': {
                client.emit('ticketsLogs', req, interaction.guild, interaction.member.user);
                const channel = interaction.guild.channels.cache.get(interaction.channelId);

                await channel.edit({
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
                        { id: interaction.customId.split('_')[1], deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'] },
                        { id: client.user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'] }
                    ],
                    name: `closed-${channel.name}` 
                });

                const ticketEmbed = new MessageEmbed()
                    .setColor('RED')
                    .setAuthor(`${interaction.member.user.username} bu bileti kapatmaya karar verdi ❌`)
                    .setDescription('*Bileti kalıcı olarak silmek veya bileti yeniden açmak için aşağıdaki butona tıklayın.*');

                const reopenButton = new MessageButton().setStyle('SUCCESS').setLabel('Bu bileti yeniden aç').setCustomId(`reopenTicket_${interaction.customId.split('_')[1]}`);
                const saveButton = new MessageButton().setStyle('SUCCESS').setLabel('Bu bileti kaydet').setCustomId(`saveTicket_${interaction.customId.split('_')[1]}`);
                const deleteButton = new MessageButton().setStyle('DANGER').setLabel('Bu bileti sil').setCustomId('deleteTicket');
                const row = new MessageActionRow().addComponents(reopenButton, saveButton, deleteButton);

                return interaction.reply({ embeds: [ticketEmbed], components: [row] });
            }

            case 'reopenTicket': {
                client.emit('ticketsLogs', req, interaction.guild, interaction.member.user);
                const channel = interaction.guild.channels.cache.get(interaction.channelId);

                await channel.edit({
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
                        { id: interaction.customId.split('_')[1], allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'] },
                        { id: client.user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'] }
                    ],
                    name: channel.name.replace('closed-', '')
                });

                const ticketEmbed = new MessageEmbed()
                    .setColor('GREEN')
                    .setAuthor(`Bilet yeniden açıldı ✅`)
                    .setDescription('*Mevcut bileti kapatmak için aşağıdaki butona tıklayın, dikkat geri dönemeyeceksiniz!*');

                const closeButton = new MessageButton().setStyle('DANGER').setLabel('Bu bileti kapat').setCustomId(`closeTicket_${interaction.customId.split('_')[1]}`);
                const row = new MessageActionRow().addComponents(closeButton);

                return interaction.reply({ embeds: [ticketEmbed], components: [row] });
            }

            case 'deleteTicket': {
                client.emit('ticketsLogs', req, interaction.guild, interaction.member.user);
                const channel = interaction.guild.channels.cache.get(interaction.channelId);
                return channel.delete();
            }

            case 'saveTicket': {
                client.emit('ticketsLogs', req, interaction.guild, interaction.member.user);
                const channel = interaction.guild.channels.cache.get(interaction.channelId);

                await channel.messages.fetch().then(async msg => {
                    let messages = msg.filter(msg => msg.author.bot !== true).map(m => {
                        const date = new Date(m.createdTimestamp).toLocaleString();
                        const user = `${m.author.tag}${m.author.id === interaction.customId.split('_')[1] ? ' (ticket creator)' : ''}`;
                        return `${date} - ${user} : ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`;
                    }).reverse().join('\n');

                    if (messages.length < 1) messages = 'Bu bilette mesaj yok... garip';

                    const ticketID = Date.now();
                    const stream = createWriteStream(`./data/${ticketID}.txt`); 

                    stream.once('open', () => {
                        stream.write(`Kullanıcı bileti ${interaction.customId.split('_')[1]} (channel #${channel.name})\n\n`);
                        stream.write(`${messages}\n\nLogs ${new Date(ticketID).toLocaleString()}`);
                        stream.write(`\n\nTicket kapatma işlemi: ${interaction.user.tag} (${interaction.user.id}) tarafından ${new Date().toLocaleString()}`);
                        stream.end();
                    });

                    stream.on('finish', () => interaction.reply({ files: [`./data/${ticketID}.txt`] }));
                });
                break; 
            }
        }
    }
};