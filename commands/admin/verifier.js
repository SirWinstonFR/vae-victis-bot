const {
  SlashCommandBuilder,
  PermissionFlagsBits,
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
    .setName('verifier')
    .setDescription('Vérifie un membre et lui attribue son rôle')
    .addUserOption(o => o.setName('membre').setDescription('Membre à vérifier').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const target = interaction.options.getMember('membre');

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🔍 Vérification de ${target.user.tag}`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Compte créé le :** <t:${Math.floor(target.user.createdTimestamp / 1000)}:D>\n` +
          `**A rejoint le :** <t:${Math.floor(target.joinedTimestamp / 1000)}:D>`
        )
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`verify_accept:${target.id}`)
        .setLabel('✅ Valider')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`verify_kick:${target.id}`)
        .setLabel('❌ Expulser')
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.reply({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2 | 64,
    });
  },
};
