const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, StringSelectMenuBuilder } = require('discord.js');
const { createWriteStream } = require('fs');

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
    if (interaction.isSelectMenu()) {
        // Renk rolü etkileşimini işle
        if (customId === 'colorSelect') {
            await colorRolesCommand.handleInteraction(client, interaction);
            return;
        }

        // Bilgi rolü etkileşimini işle
        if (customId === 'BilgiSelect') {
            await infoRolesCommand.handleInteraction(client, interaction);
            return;
        }
    }

    // --- ÖNCELİK 2: BUTON Etkileşimlerini İşle (Ticket Sistemi Butonları) ---
    if (interaction.isButton()) {
        const categoryId = '1268509251911811175'; // Ticket Kategori ID'si

        switch (req) {
            case 'createTicket': {
                client.emit('ticketsLogs', req, interaction.guild, interaction.user); // interaction.member.user yerine interaction.user

                const existingTicket = interaction.guild.channels.cache.find(
                    c => c.type === ChannelType.GuildText &&
                        c.topic &&
                        c.topic.includes(`Bilet ${interaction.user.username}`) &&
                        !c.name.startsWith('closed-')
                );

                if (existingTicket) {
                    return interaction.reply({ content: `Zaten açık bir biletiniz var: <#${existingTicket.id}>`, ephemeral: true });
                }

                const channel = await interaction.guild.channels.create({
                    name: `ticket-${ticketCounter}`,
                    type: ChannelType.GuildText,
                    topic: `Bilet ${interaction.user.username} tarafından oluşturuldu. ${new Date().toLocaleString()}`,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
                        },
                        {
                            id: client.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
                        }
                    ],
                    parent: categoryId
                });

                ticketCounter++;

                const ticketEmbed = new EmbedBuilder()
                    .setColor('Green')
                    .setAuthor({ name: `Biletiniz başarıyla oluşturuldu ${interaction.user.username} ✅` })
                    .setDescription('*Mevcut bileti kapatmak için aşağıdaki butona tıklayın, dikkat geri dönemeyeceksiniz!*');

                await channel.send(`<@${interaction.user.id}>`);
                const closeButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('Bu bileti kapat')
                    .setCustomId(`closeTicket_${interaction.user.id}`);

                const row = new ActionRowBuilder().addComponents(closeButton);

                return interaction.reply({ content: `Biletiniz Açıldı <#${channel.id}> ✅`, components: [], ephemeral: true });
            }

            case 'closeTicket': {
                const userId = customId.split('_')[1];
                client.emit('ticketsLogs', req, interaction.guild, interaction.user);
                const channel = interaction.guild.channels.cache.get(interaction.channelId);

                await channel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: userId, // Bilet sahibine VIEW_CHANNEL iznini kapat
                            deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
                        },
                        {
                            id: client.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
                        }
                    ],
                    name: `closed-${channel.name}`
                });

                const ticketEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({ name: `${interaction.user.username} bu bileti kapatmaya karar verdi ❌` })
                    .setDescription('*Bileti kalıcı olarak silmek veya bileti yeniden açmak için aşağıdaki butona tıklayın.*');

                const reopenButton = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Bu bileti yeniden aç').setCustomId(`reopenTicket_${userId}`);
                const saveButton = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Bu bileti kaydet').setCustomId(`saveTicket_${userId}`);
                const deleteButton = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Bu bileti sil').setCustomId('deleteTicket');
                const row = new ActionRowBuilder().addComponents(reopenButton, saveButton, deleteButton);

                return interaction.reply({ embeds: [ticketEmbed], components: [row] });
            }

            case 'reopenTicket': {
                const userId = customId.split('_')[1];
                client.emit('ticketsLogs', req, interaction.guild, interaction.user);
                const channel = interaction.guild.channels.cache.get(interaction.channelId);

                await channel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: userId, // Bilet sahibine tekrar izin ver
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
                        },
                        {
                            id: client.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
                        }
                    ],
                    name: channel.name.replace('closed-', '')
                });

                const ticketEmbed = new EmbedBuilder()
                    .setColor('Green')
                    .setAuthor({ name: `Bilet yeniden açıldı ✅` })
                    .setDescription('*Mevcut bileti kapatmak için aşağıdaki butona tıklayın, dikkat geri dönemeyeceksiniz!*');

                const closeButton = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Bu bileti kapat').setCustomId(`closeTicket_${userId}`);
                const row = new ActionRowBuilder().addComponents(closeButton);

                return interaction.reply({ embeds: [ticketEmbed], components: [row] });
            }

            case 'deleteTicket': {
                client.emit('ticketsLogs', req, interaction.guild, interaction.user);
                const channel = interaction.guild.channels.cache.get(interaction.channelId);
                return channel.delete();
            }

            case 'saveTicket': {
                const userId = customId.split('_')[1];
                client.emit('ticketsLogs', req, interaction.guild, interaction.user);
                const channel = interaction.guild.channels.cache.get(interaction.channelId);

                await interaction.deferReply({ ephemeral: true });

                const messages = await channel.messages.fetch({ limit: 100 });
                const ticketMessages = messages.filter(msg => !msg.author.bot).map(m => {
                    const date = new Date(m.createdTimestamp).toLocaleString();
                    const user = `${m.author.tag}${m.author.id === userId ? ' (ticket creator)' : ''}`;
                    return `${date} - ${user} : ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`;
                }).reverse().join('\n');

                const fileContent = ticketMessages.length > 0 ?
                    `Kullanıcı bileti ${userId} (channel #${channel.name})\n\n${ticketMessages}\n\nLogs ${new Date().toLocaleString()}` :
                    `Bu bilette mesaj yok.`;

                const ticketID = Date.now();
                const fileName = `./data/ticket-${ticketID}.txt`;

                await new Promise((resolve, reject) => {
                    const stream = createWriteStream(fileName);
                    stream.on('finish', resolve);
                    stream.on('error', reject);
                    stream.write(fileContent);
                    stream.end();
                });

                await interaction.followUp({ files: [fileName], ephemeral: true });
                break;
            }
        }
    }
};
