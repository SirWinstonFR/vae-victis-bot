const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const {
  ContainerBuilder,
  TextDisplayBuilder,
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

    // 1. Envoi initial SANS mentions (pas de ping de masse)
    const contentSansMention = buildPanelContent(interaction.guild, false);

    const containerSansMention = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ⚔️ Panthéons de Vae Victis\n` +
          `*Liste des divinités disponibles et de leurs joueurs.*\n\n` +
          contentSansMention
        )
      );

    const msg = await channel.send({
      components: [containerSansMention],
      flags: MessageFlags.IsComponentsV2,
    });

    setPanelMessageId(msg.id);

    // 2. Édition après quelques secondes AVEC mentions (edit ne ping pas)
    setTimeout(async () => {
      const contentAvecMention = buildPanelContent(interaction.guild, true);
      const containerAvecMention = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# ⚔️ Panthéons de Vae Victis\n` +
            `*Liste des divinités disponibles et de leurs joueurs.*\n\n` +
            contentAvecMention
          )
        );

      await msg.edit({
        components: [containerAvecMention],
        flags: MessageFlags.IsComponentsV2,
      }).catch(() => {});
    }, 3000);

    await interaction.editReply({ content: `✅ Panel des dieux envoyé dans ${channel}` });
  },
};
