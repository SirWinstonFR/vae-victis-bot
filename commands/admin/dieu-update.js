const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
} = require('discord.js');
const {
  findDieu,
  setDieu,
  removeDieu,
  buildPanelContent,
  getPanelMessageId,
  getPanelChannelId,
} = require('../../utils/dieux');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dieu-update')
    .setDescription('Assigner ou libérer un dieu')
    .addSubcommand(sub =>
      sub.setName('assigner')
        .setDescription('Assigner un dieu à un membre')
        .addStringOption(o => o.setName('dieu').setDescription('Nom du dieu').setRequired(true))
        .addUserOption(o => o.setName('membre').setDescription('Membre qui joue ce dieu').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('liberer')
        .setDescription('Libérer un dieu (le rendre disponible)')
        .addStringOption(o => o.setName('dieu').setDescription('Nom du dieu').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const sub    = interaction.options.getSubcommand();
    const nomDieu = interaction.options.getString('dieu');
    const found  = findDieu(nomDieu);

    if (!found) {
      return interaction.editReply({
        content: `❌ Dieu **${nomDieu}** introuvable. Vérifie l'orthographe.`,
      });
    }

    if (sub === 'assigner') {
      const membre = interaction.options.getMember('membre');
      setDieu(found.nom, membre.id, membre.user.tag);
      await interaction.editReply({
        content: `✅ **${found.nom}** (${found.faction}) assigné à ${membre}.`,
      });
    } else {
      removeDieu(found.nom);
      await interaction.editReply({
        content: `✅ **${found.nom}** (${found.faction}) est maintenant disponible.`,
      });
    }

    // Mettre à jour le panel
    const panelMsgId = getPanelMessageId();
    const channel    = interaction.guild.channels.cache.get(getPanelChannelId());

    if (panelMsgId && channel) {
      const panelMsg = await channel.messages.fetch(panelMsgId).catch(() => null);
      if (panelMsg) {
        const content = buildPanelContent(interaction.guild, true);
        const container = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ⚔️ Panthéons de Vae Victis\n` +
              `*Liste des divinités disponibles et de leurs joueurs.*\n\n` +
              content
            )
          );

        await panelMsg.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }
    }
  },
};
