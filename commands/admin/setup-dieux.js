const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');
const { buildPanelContent, setPanelMessageId, getPanelChannelId } = require('../../utils/dieux');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-dieux')
    .setDescription('Envoie le panel des dieux disponibles')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const channel = interaction.guild.channels.cache.get(getPanelChannelId());
    if (!channel) return interaction.editReply({ content: '❌ Channel introuvable.' });

    const content = buildPanelContent(interaction.guild);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ⚔️ Panthéons de Vae Victis\n` +
          `*Liste des divinités disponibles et de leurs joueurs.*\n\n` +
          content
        )
      );

    const msg = await channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    setPanelMessageId(msg.id);
    await interaction.editReply({ content: `✅ Panel des dieux envoyé dans ${channel}` });
  },
};
