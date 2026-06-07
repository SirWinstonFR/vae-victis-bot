const {
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');
const { channels, roles } = require('../config/config');

async function openTicket(interaction, client) {
  await interaction.deferReply({ flags: 64 });

  // Nom du ticket = username Discord (pas l'ID)
  const ticketName = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const existing = interaction.guild.channels.cache.find(c => c.name === ticketName);
  if (existing) {
    return interaction.editReply({ content: `❌ Tu as déjà un ticket ouvert : ${existing}` });
  }

  const channel = await interaction.guild.channels.create({
    name: ticketName,
    parent: channels.tickets,
    permissionOverwrites: [
      { id: interaction.guild.id,   deny:  ['ViewChannel'] },
      { id: interaction.user.id,    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
      { id: roles.modo,             allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
    ],
  });

  // Message d'accueil dans le ticket
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🎫 Ticket de ${interaction.user.username}\n` +
        `Bonjour ${interaction.user} ! Explique ton problème, un modérateur va te répondre.`
      )
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('🔒 Fermer le ticket')
      .setStyle(ButtonStyle.Danger),
  );

  await channel.send({
    components: [container, row],
    flags: MessageFlags.IsComponentsV2,
  });

  await interaction.editReply({ content: `✅ Ticket créé : ${channel}` });
}

async function closeTicket(interaction, client) {
  await interaction.deferReply({ flags: 64 });
  await interaction.editReply({ content: '🔒 Fermeture du ticket dans 5 secondes...' });
  setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
}

/**
 * Envoie le panel permanent dans le channel tickets
 * À appeler une fois via /setup-tickets
 */
async function sendTicketPanel(channel) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🎫 Support Vae Victis\n` +
        `Tu as une question, un problème ou une demande ?\n` +
        `Clique sur le bouton ci-dessous pour ouvrir un ticket privé avec l'équipe.`
      )
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_open')
      .setLabel('📩 Ouvrir un ticket')
      .setStyle(ButtonStyle.Primary),
  );

  await channel.send({
    components: [container, row],
    flags: MessageFlags.IsComponentsV2,
  });
}

module.exports = { openTicket, closeTicket, sendTicketPanel };
