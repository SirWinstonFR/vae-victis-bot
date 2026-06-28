const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ThumbnailBuilder,
  MessageFlags,
} = require('discord.js');

const CHANNEL_FORUM  = '1520819101558243418';
const CHANNEL_STAFF  = '1512195689176764508';

// Map<userId, { attaquant, defenseur, lieu, description, idees, pnjNom, pnjBio, images: [] }>
const pendingConflit = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('conflit')
    .setDescription('Créer un post de conflit dans le forum RP')
    .addUserOption(o =>
      o.setName('attaquant').setDescription('Divinité attaquante').setRequired(true)
    )
    .addUserOption(o =>
      o.setName('defenseur').setDescription('Divinité défenseure').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const attaquant = interaction.options.getMember('attaquant');
    const defenseur = interaction.options.getMember('defenseur');

    // Stocker les membres avant la modal
    pendingConflit.set(`pre_${interaction.user.id}`, { attaquant, defenseur });

    // Ouvrir modal 1
    const modal = new ModalBuilder()
      .setCustomId('conflit_modal1')
      .setTitle('⚔️ Conflit — Infos générales');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('lieu')
          .setLabel('Lieu du conflit')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: Paris, France')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Description de la situation')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Décris le contexte du conflit...')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('idees')
          .setLabel('Idées / raisons possibles (optionnel)')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Ex: Conflit de ressources, trahison...')
          .setRequired(false)
      ),
    );

    await interaction.showModal(modal);
  },

  pendingConflit,
  CHANNEL_FORUM,
  CHANNEL_STAFF,
};
