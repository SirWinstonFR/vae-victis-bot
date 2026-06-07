const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendTicketPanel } = require('../../utils/tickets');
const { channels } = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-tickets')
    .setDescription('Envoie le panel de tickets dans le channel dédié')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });

    const channel = interaction.guild.channels.cache.get(channels.ticketsPanel);
    if (!channel) return interaction.editReply({ content: '❌ Channel tickets introuvable.' });

    await sendTicketPanel(channel);
    await interaction.editReply({ content: `✅ Panel envoyé dans ${channel}` });
  },
};
