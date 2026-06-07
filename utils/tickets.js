const { channels } = require('../config/config');

async function openTicket(interaction, client) {
  await interaction.deferReply({ flags: 64 });

  const existing = interaction.guild.channels.cache.find(
    c => c.name === `ticket-${interaction.user.id}`
  );
  if (existing) {
    return interaction.editReply({ content: `❌ Tu as déjà un ticket ouvert : ${existing}` });
  }

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.id}`,
    parent: channels.tickets,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: ['ViewChannel'] },
      { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
    ],
  });

  await channel.send(`👋 Bonjour ${interaction.user} ! Un modérateur va te répondre bientôt.`);
  await interaction.editReply({ content: `✅ Ticket créé : ${channel}` });
}

async function closeTicket(interaction, client) {
  await interaction.deferReply({ flags: 64 });
  await interaction.editReply({ content: '🔒 Fermeture du ticket dans 5 secondes...' });
  setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
}

module.exports = { openTicket, closeTicket };
