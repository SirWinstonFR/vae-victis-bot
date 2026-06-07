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
  MessageFlags,
} = require('discord.js');

const CHANNEL_RESA    = '1512195690523000832';
const CHANNEL_STAFF   = '1512195689176764508';

// Stocker les réservations en attente : Map<staffMessageId, { userId, choices, resaChannelId }>
const pendingResa = new Map();

/**
 * Envoie le panel de réservation dans #réservation
 */
async function sendResaPanel(channel) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ⚔️ Système de réservation\n\n` +
        `Pour rejoindre Vae Victis en tant que divinité, tu dois réserver ton personnage.\n\n` +
        `**Comment ça fonctionne ?**\n` +
        `> Tu proposes **3 choix de divinités** par ordre de préférence.\n` +
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

/**
 * Ouvre la modal de réservation
 */
async function openResaModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('resa_submit')
    .setTitle('⚔️ Réservation de personnage');

  const choix1 = new TextInputBuilder()
    .setCustomId('choix1')
    .setLabel('1er choix (priorité haute)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Athéna')
    .setRequired(true);

  const choix2 = new TextInputBuilder()
    .setCustomId('choix2')
    .setLabel('2ème choix')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Zeus')
    .setRequired(true);

  const choix3 = new TextInputBuilder()
    .setCustomId('choix3')
    .setLabel('3ème choix (priorité basse)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Poséidon')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(choix1),
    new ActionRowBuilder().addComponents(choix2),
    new ActionRowBuilder().addComponents(choix3),
  );

  await interaction.showModal(modal);
}

/**
 * Traite la soumission de la modal
 */
async function handleResaSubmit(interaction) {
  await interaction.deferReply({ flags: 64 });

  const choix1 = interaction.fields.getTextInputValue('choix1');
  const choix2 = interaction.fields.getTextInputValue('choix2');
  const choix3 = interaction.fields.getTextInputValue('choix3');

  const guild        = interaction.guild;
  const staffChannel = guild.channels.cache.get(CHANNEL_STAFF);
  const resaChannel  = guild.channels.cache.get(CHANNEL_RESA);

  if (!staffChannel) return interaction.editReply({ content: '❌ Channel staff introuvable.' });

  // Message staff avec les 3 options
  const staffContainer = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 📋 Nouvelle réservation\n` +
        `**Joueur :** ${interaction.user} (${interaction.user.tag})\n\n` +
        `**1er choix :** ${choix1}\n` +
        `**2ème choix :** ${choix2}\n` +
        `**3ème choix :** ${choix3}`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Sélectionne le meilleur choix pour l'équilibre des factions.*`)
    );

  const staffRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`resa_valid:1`)
      .setLabel(`✅ Valider "${choix1}"`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`resa_valid:2`)
      .setLabel(`✅ Valider "${choix2}"`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`resa_valid:3`)
      .setLabel(`✅ Valider "${choix3}"`)
      .setStyle(ButtonStyle.Success),
  );

  const refusRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`resa_refus`)
      .setLabel('❌ Refuser la réservation')
      .setStyle(ButtonStyle.Danger),
  );

  const staffMsg = await staffChannel.send({
    components: [staffContainer, staffRow, refusRow],
    flags: MessageFlags.IsComponentsV2,
  });

  // Stocker la réservation en attente
  pendingResa.set(staffMsg.id, {
    userId:       interaction.user.id,
    userTag:      interaction.user.tag,
    choices:      [choix1, choix2, choix3],
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

/**
 * Traite la validation ou le refus par le staff
 */
async function handleResaValidation(interaction) {
  await interaction.deferUpdate();

  const [, choixIndex] = interaction.customId.split(':');
  const staffMsgId = interaction.message.id;
  const entry = pendingResa.get(staffMsgId);

  if (!entry) {
    return interaction.followUp({ content: '❌ Réservation introuvable ou déjà traitée.', flags: 64 });
  }

  pendingResa.delete(staffMsgId);

  const guild      = interaction.guild;
  const resaChannel = guild.channels.cache.get(entry.resaChannelId);
  const member     = await guild.members.fetch(entry.userId).catch(() => null);

  const choixValide = entry.choices[parseInt(choixIndex) - 1];

  // Publier le résultat dans #réservation
  if (resaChannel) {
    const resultContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ✅ Réservation validée !\n\n` +
          `**Joueur :** ${member ? member : entry.userTag}\n` +
          `**Personnage retenu :** **${choixValide}**\n\n` +
          `*Validé par ${interaction.user}*`
        )
      );

    await resaChannel.send({
      components: [resultContainer],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  // Désactiver les boutons sur le message staff
  await interaction.message.edit({ components: [] }).catch(() => {});
}

/**
 * Traite le refus par le staff
 */
async function handleResaRefus(interaction) {
  await interaction.deferUpdate();

  const staffMsgId = interaction.message.id;
  const entry = pendingResa.get(staffMsgId);

  if (!entry) {
    return interaction.followUp({ content: '❌ Réservation introuvable ou déjà traitée.', flags: 64 });
  }

  pendingResa.delete(staffMsgId);

  const guild      = interaction.guild;
  const resaChannel = guild.channels.cache.get(entry.resaChannelId);
  const member     = await guild.members.fetch(entry.userId).catch(() => null);

  if (resaChannel) {
    const refusContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ❌ Réservation refusée\n\n` +
          `**Joueur :** ${member ? member : entry.userTag}\n\n` +
          `Ta réservation a été refusée par le staff. N'hésite pas à contacter un modérateur pour plus d'informations.`
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
};
