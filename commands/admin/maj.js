const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { openMajModal } = require('../../utils/maj');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maj')
    .setDescription('Publier une mise à jour du site/bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await openMajModal(interaction);
  },
};
