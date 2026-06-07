const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendResaPanel } = require('../../utils/reservation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-resa')
    .setDescription('Envoie le panel de réservation dans #réservation')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const channel = interaction.guild.channels.cache.get('1512195690523000832');
    if (!channel) return interaction.editReply({ content: '❌ Channel réservation introuvable.' });
    await sendResaPanel(channel);
    await interaction.editReply({ content: `✅ Panel de réservation envoyé dans ${channel}` });
  },
};
