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

// Stockage temporaire des données entre les deux modals
// Map<userId, { choix1, choix2 }>
const pendingModal = new Map();

// Stockage des réservations en attente de validation staff
// Map<staffMessageId, { userId, userTag, choices: [{nom, image}x3], resaChannelId }>
const pendingResa = new Map();

// ── Modal 1 : Choix 1 + Choix 2 ───────────────────────────────────────────
async function openResaModal1(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('resa_modal1')
    .setTitle('⚔️ Réservation — Choix 1 & 2');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('choix1_nom')
        .setLabel('1er choix — Nom du dieu')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Athéna')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('choix1_image')
        .setLabel('1er choix — URL de l\'apparence')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('https://...')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('choix2_nom')
        .setLabel('2ème choix — Nom du dieu')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Zeus')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('choix2_image')
        .setLabel('2ème choix — URL de l\'apparence')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('https://...')
        .setRequired(true)
    ),
  );

  await interaction.showModal(modal);
}

// ── Traitement Modal 1 → ouvre Modal 2 ────────────────────────────────────
async function handleModal1(interaction) {
  const choix1_nom   = interaction.fields.getTextInputValue('choix1_nom');
  const choix1_image = interaction.fields.getTextInputValue('choix1_image');
  const choix2_nom   = interaction.fields.getTextInputValue('choix2_nom');
  const choix2_image = interaction.fields.getTextInputValue('choix2_image');

  // Stocker les deux premiers choix
  pendingModal.set(interaction.user.id, { choix1_nom, choix1_image, choix2_nom, choix2_image });

  // Ouvrir la modal 2
  const modal = new ModalBuilder()
    .setCustomId('resa_modal2')
    .setTitle('⚔️ Réservation — Choix 3');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('choix3_nom')
        .setLabel('3ème choix — Nom du dieu (priorité basse)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Poséidon')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('choix3_image')
        .setLabel('3ème choix — URL de l\'apparence')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('https://...')
        .setRequired(true)
    ),
  );

  await interaction.showModal(modal);
}

// ── Traitement Modal 2 → envoi staff ──────────────────────────────────────
async function handleModal2(interaction) {
  await interaction.deferReply({ flags: 64 });

  const stored = pendingModal.get(interaction.user.id);
  if (!stored) return interaction.editReply({ content: '❌ Session expirée, recommence.' });
  pendingModal.delete(interaction.user.id);

  const choix3_nom   = interaction.fields.getTextInputValue('choix3_nom');
  const choix3_image = interaction.fields.getTextInputValue('choix3_image');

  const choices = [
    { nom: stored.choix1_nom, image: stored.choix1_image },
    { nom: stored.choix2_nom, image: stored.choix2_image },
    { nom: choix3_nom,        image: choix3_image },
  ];

  const guild        = interaction.guild;
  const staffChannel = guild.channels.cache.get(CHANNEL_STAFF);
  const resaChannel  = guild.channels.cache.get(CHANNEL_RESA);

  if (!staffChannel) return interaction.editReply({ content: '❌ Channel staff introuvable.' });

  // Message staff avec les 3 choix + images
  const staffContainer = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 📋 Nouvelle réservation\n**Joueur :** ${interaction.user} (${interaction.user.tag})`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

  for (let i = 0; i < 3; i++) {
    const c = choices[i];
    staffContainer
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${i + 1}${i === 0 ? 'er' : 'ème'} choix — ${c.nom}**`)
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(c.image).setDescription(c.nom)
        )
      );
    if (i < 2) {
      staffContainer.addSeparatorComponents(
        new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small)
      );
    }
  }

  staffContainer
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Sélectionne le meilleur choix pour l'équilibre des factions.*`)
    );

  const staffRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('resa_valid:1')
      .setLabel(`✅ "${choices[0].nom}"`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('resa_valid:2')
      .setLabel(`✅ "${choices[1].nom}"`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('resa_valid:3')
      .setLabel(`✅ "${choices[2].nom}"`)
      .setStyle(ButtonStyle.Success),
  );

  const refusRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('resa_refus')
      .setLabel('❌ Refuser la réservation')
      .setStyle(ButtonStyle.Danger),
  );

  const staffMsg = await staffChannel.send({
    components: [staffContainer, staffRow, refusRow],
    flags: MessageFlags.IsComponentsV2,
  });

  pendingResa.set(staffMsg.id, {
    userId:        interaction.user.id,
    userTag:       interaction.user.tag,
    choices,
    resaChannelId: CHANNEL_RESA,
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

// ── Validation staff ───────────────────────────────────────────────────────
async function handleResaValidation(interaction) {
  await interaction.deferUpdate();

  const [, choixIndex] = interaction.customId.split(':');
  const entry = pendingResa.get(interaction.message.id);

  if (!entry) {
    return interaction.followUp({ content: '❌ Réservation introuvable ou déjà traitée.', flags: 64 });
  }

  pendingResa.delete(interaction.message.id);

  const guild      = interaction.guild;
  const resaChannel = guild.channels.cache.get(entry.resaChannelId);
  const member     = await guild.members.fetch(entry.userId).catch(() => null);
  const choix      = entry.choices[parseInt(choixIndex) - 1];

  if (resaChannel) {
    const resultContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ✅ Réservation validée !\n\n` +
          `**Joueur :** ${member ?? entry.userTag}\n` +
          `**Personnage retenu : ${choix.nom}**`
        )
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(choix.image).setDescription(choix.nom)
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Validé par ${interaction.user}*`)
      );

    await resaChannel.send({
      components: [resultContainer],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  await interaction.message.edit({ components: [] }).catch(() => {});
}

// ── Refus staff ────────────────────────────────────────────────────────────
async function handleResaRefus(interaction) {
  await interaction.deferUpdate();

  const entry = pendingResa.get(interaction.message.id);
  if (!entry) {
    return interaction.followUp({ content: '❌ Réservation introuvable ou déjà traitée.', flags: 64 });
  }

  pendingResa.delete(interaction.message.id);

  const guild      = interaction.guild;
  const resaChannel = guild.channels.cache.get(entry.resaChannelId);
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

// ── Panel #réservation ─────────────────────────────────────────────────────
async function sendResaPanel(channel) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ⚔️ Système de réservation\n\n` +
        `Pour rejoindre Vae Victis en tant que divinité, tu dois réserver ton personnage.\n\n` +
        `**Comment ça fonctionne ?**\n` +
        `> Tu proposes **3 choix de divinités** par ordre de préférence, avec l'apparence choisie.\n` +
        `> Le staff examine tes propositions et sélectionne celle qui équilibre le mieux les factions.\n` +
        `> Tu seras notifié dans ce salon dès que ta réservation est traitée.\n\n` +
        `*Assure-toi d'avoir lu le contexte et les factions avant de réserver.*`
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

module.exports = {
  sendResaPanel,
  openResaModal1,
  handleModal1,
  handleModal2,
  handleResaValidation,
  handleResaRefus,
};
