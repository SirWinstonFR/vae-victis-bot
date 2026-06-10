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
    .setName('setup-roles')
    .setDescription('Envoie le panel de sélection des rôles de notification')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const channel = interaction.guild.channels.cache.get('1514294989016793108');
    if (!channel) return interaction.editReply({ content: '❌ Channel introuvable.' });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 🔔 Notifications & Pings\n\n` +
          `Choisis les notifications que tu souhaites recevoir.\n` +
          `Clique sur un bouton pour obtenir ou retirer le rôle correspondant.`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `🤝 **Partenariat** — Annonces des nouveaux partenaires\n` +
          `🌐 **Mise à jour (Site)** — Nouvelles fonctionnalités sur vae-victis.fr\n` +
          `⚔️ **Cycle (État du RP)** — Ouverture et clôture des cycles de jeu`
        )
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('role_toggle:1514293199915450368')
        .setLabel('🤝 Partenariat')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('role_toggle:1514294464200572949')
        .setLabel('🌐 Mise à jour (Site)')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('role_toggle:1514294535105155203')
        .setLabel('⚔️ Cycle (État du RP)')
        .setStyle(ButtonStyle.Secondary),
    );

    await channel.send({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2,
    });

    await interaction.editReply({ content: `✅ Panel de rôles envoyé dans ${channel}` });
  },
};
