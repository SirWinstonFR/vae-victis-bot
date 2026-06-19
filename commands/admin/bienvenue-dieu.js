const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require('discord.js');

const CHANNEL_GENERAL = '1517633786253148333';
const CHANNEL_DEMANDE = '1512195690523000835';
const CHANNEL_STAFF   = '1512195689176764508';

// Map<staffUserId, { joueurId, dieu, date }>
const pendingBienvenue = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bienvenue-dieu')
    .setDescription('Annonce la validation d\'un joueur dans le général')
    .addUserOption(o =>
      o.setName('joueur').setDescription('Le membre validé').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('dieu').setDescription('Nom du dieu incarné').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('date').setDescription('Date d\'ouverture (ex: Vendredi 26/06)').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const joueur = interaction.options.getMember('joueur');
    const dieu   = interaction.options.getString('dieu');
    const date   = interaction.options.getString('date') || 'Vendredi 26/06';

    pendingBienvenue.set(interaction.user.id, {
      joueurId: joueur.id,
      dieu,
      date,
    });

    await interaction.editReply({
      content:
        `✅ Infos enregistrées — **${joueur.user.username}** / **${dieu}**\n\n` +
        `Uploade maintenant la **bannière** dans ce channel. *(2 minutes)*`,
    });

    setTimeout(async () => {
      if (pendingBienvenue.has(interaction.user.id)) {
        pendingBienvenue.delete(interaction.user.id);
        await interaction.followUp({ content: '⏱️ Délai dépassé. Relance `/bienvenue-dieu`.', flags: 64 }).catch(() => {});
      }
    }, 120_000);
  },

  pendingBienvenue,
  CHANNEL_GENERAL,
  CHANNEL_DEMANDE,
  CHANNEL_STAFF,
};
