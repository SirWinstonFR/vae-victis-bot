const {
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

const CHANNEL_RESA  = '1512195690523000832';
const CHANNEL_STAFF = '1512195689176764508';

// Map<staffMessageId, { userId, userTag, choices: [{nom, apparence}x3] }>
const pendingResa = new Map();

// Map<staffUserId, { choix, entry }> — en attente d'image après validation
const pendingImage = new Map();

// ── Panel #réservation ─────────────────────────────────────────────────────
async function sendResaPanel(channel) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ⚔️ Système de réservation\n\n` +
        `Pour rejoindre Vae Victis en tant que divinité, tu dois réserver ton personnage.\n\n` +
        `**Comment ça fonctionne ?**\n` +
        `> Tu proposes **3 choix de divinités** par ordre de préférence.\n` +
        `> Pour chaque choix, indique le nom du dieu et le nom de l'apparence souhaitée.\n` +
        `> Le staff examine tes propositions et sélectionne celle qui équilibre le mieux les factions.\n` +
        `> Tu seras notifié dans ce salon dès que ta réservation est traitée.\n\n` +
        `*Format attendu : \`Nom du dieu | Nom de l'apparence\`*\n` +
        `*Exemple : \`Athéna | Margot Robbie\`*`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('resa_open')
      .setLabel('✨ Réserver un personnage')
      .setStyle(ButtonStyle.Primary),
  );

  await channel.send({
    components: [container, row],
    flags: MessageFlags.IsComponentsV2,
  });
}

// ── Modal unique ───────────────────────────────────────────────────────────
async function openResaModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('resa_submit')
    .setTitle('⚔️ Réservation de personnage');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('choix1')
        .setLabel('1er choix — Dieu | Apparence')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Athéna | Margot Robbie')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('choix2')
        .setLabel('2ème choix — Dieu | Apparence')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Zeus | Henry Cavill')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('choix3')
        .setLabel('3ème choix — Dieu | Apparence')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Poséidon | Jason Momoa')
        .setRequired(true)
    ),
  );

  await interaction.showModal(modal);
}

// ── Parsing d'un champ "Nom | Apparence" ──────────────────────────────────
function parseChoix(value) {
  const parts = value.split('|').map(s => s.trim());
  return {
    nom:       parts[0] || value.trim(),
    apparence: parts[1] || '—',
  };
}

// ── Traitement soumission modal ────────────────────────────────────────────
async function handleResaSubmit(interaction) {
  await interaction.deferReply({ flags: 64 });

  const choices = [
    parseChoix(interaction.fields.getTextInputValue('choix1')),
    parseChoix(interaction.fields.getTextInputValue('choix2')),
    parseChoix(interaction.fields.getTextInputValue('choix3')),
  ];

  const guild        = interaction.guild;
  const staffChannel = guild.channels.cache.get(CHANNEL_STAFF);
  const resaChannel  = guild.channels.cache.get(CHANNEL_RESA);

  if (!staffChannel) return interaction.editReply({ content: '❌ Channel staff introuvable.' });

  // Message staff
  const staffContainer = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 📋 Nouvelle réservation\n**Joueur :** ${interaction.user} (${interaction.user.tag})`
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

  pendingResa.set(staffMsg.id, {
    userId:  interaction.user.id,
    userTag: interaction.user.tag,
    choices,
  });

  // Confirmation dans #réservation
  if (resaChannel) {
    const confirm = await resaChannel.send(
      `${interaction.user} Ta réservation a bien été envoyée au staff ! ✅\n*Tu seras notifié ici dès qu'elle sera traitée.*`
    );
    setTimeout(() => confirm.delete().catch(() => {}), 10000);
  }

  await interaction.editReply({ content: '✅ Réservation envoyée !' });
}

// ── Validation staff → demande image ──────────────────────────────────────
async function handleResaValidation(interaction) {
  await interaction.deferReply({ flags: 64 });

  const [, choixIndex] = interaction.customId.split(':');
  const entry = pendingResa.get(interaction.message.id);

  if (!entry) return interaction.editReply({ content: '❌ Réservation introuvable ou déjà traitée.' });

  pendingResa.delete(interaction.message.id);
  const choix = entry.choices[parseInt(choixIndex) - 1];

  await interaction.message.edit({ components: [] }).catch(() => {});

  pendingImage.set(interaction.user.id, { choix, entry });

  await interaction.editReply({
    content: `✅ Choix **${choix.nom}** (${choix.apparence}) sélectionné.\n\nUploade maintenant l'image de l'apparence dans ce channel. *(2 minutes)*`,
  });

  setTimeout(async () => {
    if (pendingImage.has(interaction.user.id)) {
      pendingImage.delete(interaction.user.id);
      await interaction.followUp({ content: '⏱️ Délai dépassé. Relance la validation.', flags: 64 }).catch(() => {});
    }
  }, 120_000);
}

// ── Réception image staff ──────────────────────────────────────────────────
async function handleStaffImage(message) {
  if (!pendingImage.has(message.author.id)) return;
  if (message.channelId !== CHANNEL_STAFF) return;

  const attachment = message.attachments.first();
  if (!attachment) return;

  const { choix, entry } = pendingImage.get(message.author.id);
  pendingImage.delete(message.author.id);

  const guild      = message.guild;
  const resaChannel = guild.channels.cache.get(CHANNEL_RESA);
  const member     = await guild.members.fetch(entry.userId).catch(() => null);

  if (resaChannel) {
    const resultContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ✅ Réservation validée !\n\n` +
          `**Joueur :** ${member ?? entry.userTag}\n` +
          `**Dieu retenu : ${choix.nom}**\n` +
          `**Apparence : ${choix.apparence}**`
        )
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(attachment.url).setDescription(choix.apparence)
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Validé par ${message.author}*`)
      );

    await resaChannel.send({
      components: [resultContainer],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  await message.react('✅').catch(() => {});
}

// ── Refus staff ────────────────────────────────────────────────────────────
async function handleResaRefus(interaction) {
  await interaction.deferUpdate();

  const entry = pendingResa.get(interaction.message.id);
  if (!entry) return interaction.followUp({ content: '❌ Réservation introuvable.', flags: 64 });

  pendingResa.delete(interaction.message.id);

  const guild      = interaction.guild;
  const resaChannel = guild.channels.cache.get(CHANNEL_RESA);
  const member     = await guild.members.fetch(entry.userId).catch(() => null);

  if (resaChannel) {
    const refusContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ❌ Réservation refusée\n\n` +
          `**Joueur :** ${member ?? entry.userTag}\n\n` +
          `Ta réservation a été refusée par le staff. N'hésite pas à ouvrir un ticket pour plus d'informations.`
        )
      );

    await resaChannel.send({
      components: [refusContainer],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  await interaction.message.edit({ components: [] }).catch(() => {});
}

module.exports = {
  sendResaPanel,
  openResaModal,
  handleResaSubmit,
  handleResaValidation,
  handleResaRefus,
  handleStaffImage,
};
