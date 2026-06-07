const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ouvrir un ticket de support'),

  async execute(interaction) {
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 🎫 Support Vae Victis\nUn modérateur te répondra dès que possible.`
        )
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_open')
        .setLabel('Ouvrir un ticket')
        .setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2 | 64,
    });
  },
};
