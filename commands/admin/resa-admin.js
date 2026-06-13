const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require('discord.js');
const { handleStaffImage } = require('../../utils/reservation');

const CHANNEL_STAFF = '1512195689176764508';
const CHANNEL_RESA  = '1512195690523000832';

// Stockage temporaire en mémoire (courte durée, usage admin uniquement)
const pendingAdminResa = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resa-admin')
    .setDescription('Créer manuellement une réservation validée pour un joueur')
    .addUserOption(o =>
      o.setName('joueur')
        .setDescription('Le membre concerné par la réservation')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('choix1')
        .setDescription('1er choix — Dieu | Apparence')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('choix2')
        .setDescription('2ème choix — Dieu | Apparence')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('choix3')
        .setDescription('3ème choix — Dieu | Apparence')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const membre  = interaction.options.getMember('joueur');
    const parse   = (val) => {
      const parts = val.split('|').map(s => s.trim());
      return { nom: parts[0] || val.trim(), apparence: parts[1] || '—' };
    };

    const choices = [
      parse(interaction.options.getString('choix1')),
      parse(interaction.options.getString('choix2')),
      parse(interaction.options.getString('choix3')),
    ];

    const guild        = interaction.guild;
    const staffChannel = guild.channels.cache.get(CHANNEL_STAFF);
    if (!staffChannel) return interaction.editReply({ content: '❌ Channel staff introuvable.' });

    // Message staff avec les 3 choix
    const staffContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 📋 Réservation Admin\n` +
          `**Joueur :** ${membre} (${membre.user.tag})\n` +
          `*Créée manuellement par ${interaction.user}*`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );

    const labels = ['1er', '2ème', '3ème'];
    for (let i = 0; i < 3; i++) {
      const c = choices[i];
      staffContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${labels[i]} choix**\n> 🏛️ Dieu : **${c.nom}**\n> 🎭 Apparence : **${c.apparence}**`
        )
      );
      if (i < 2) staffContainer.addSeparatorComponents(
        new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small)
      );
    }

    staffContainer
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Valide le meilleur choix puis uploade l'image de l'apparence.*`)
      );

    const staffRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('resa_valid:1').setLabel(`✅ ${choices[0].nom}`).setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('resa_valid:2').setLabel(`✅ ${choices[1].nom}`).setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('resa_valid:3').setLabel(`✅ ${choices[2].nom}`).setStyle(ButtonStyle.Success),
    );

    const refusRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('resa_refus').setLabel('❌ Refuser').setStyle(ButtonStyle.Danger),
    );

    const staffMsg = await staffChannel.send({
      components: [staffContainer, staffRow, refusRow],
      flags: MessageFlags.IsComponentsV2,
    });

    // Stocker en mémoire (même format que pendingResa)
    const { pendingResa } = require('../../utils/reservation');
    const { saveResa }    = require('../../utils/store');

    pendingResa[staffMsg.id] = {
      userId:  membre.id,
      userTag: membre.user.tag,
      choices,
    };
    saveResa(pendingResa);

    await interaction.editReply({
      content: `✅ Réservation admin créée pour ${membre} — va valider dans le channel staff.`,
    });
  },
};
