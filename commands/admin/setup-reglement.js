const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-reglement')
    .setDescription('Envoie le bouton de validation du règlement')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const channel = interaction.guild.channels.cache.get('1512195689378218196');
    if (!channel) return interaction.editReply({ content: '❌ Channel règlement introuvable.' });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 📜 Validation du règlement\n\n` +
          `En cliquant sur le bouton ci-dessous, tu confirmes avoir lu et accepté l'ensemble du règlement de **Vae Victis**.\n\n` +
          `*Toute infraction au règlement pourra entraîner des sanctions.*`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('reglement_accept')
        .setLabel('✅ J\'ai lu et j\'accepte le règlement')
        .setStyle(ButtonStyle.Success),
    );

    await channel.send({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2,
    });

    await interaction.editReply({ content: `✅ Bouton de validation envoyé dans ${channel}` });
  },
};
