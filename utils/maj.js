const {
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
  MessageFlags,
} = require('discord.js');

const CHANNEL_MAJ = '1515740335853142016'; // channel d'annonces MAJ
const ROLE_MAJ    = '1514294464200572949'; // rôle "Mise à jour (Site)"

// Map<staffUserId, { titre, description, changements }>
const pendingMaj = new Map();

// ── Ouvre la modal de rédaction ────────────────────────────────────────────
async function openMajModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('maj_submit')
    .setTitle('📢 Nouvelle mise à jour');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('maj_titre')
        .setLabel('Titre de la mise à jour')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Base site suite V2')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('maj_description')
        .setLabel('Description générale')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Résumé de la mise à jour...')
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('maj_changements')
        .setLabel('Liste des changements')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('- Ajout de...\n- Correction de...\n- Amélioration de...')
        .setRequired(true)
    ),
  );

  await interaction.showModal(modal);
}

// ── Traitement de la modal → demande images ───────────────────────────────
async function handleMajSubmit(interaction) {
  await interaction.deferReply({ flags: 64 });

  const titre        = interaction.fields.getTextInputValue('maj_titre');
  const description  = interaction.fields.getTextInputValue('maj_description');
  const changements  = interaction.fields.getTextInputValue('maj_changements');

  pendingMaj.set(interaction.user.id, { titre, description, changements, images: [] });

  await interaction.editReply({
    content:
      `✅ Texte enregistré !\n\n` +
      `Uploade maintenant **1 ou 2 images** dans ce channel pour illustrer la mise à jour, ` +
      `ou tape **\`skip\`** pour publier sans image.\n\n` +
      `*(Délai : 2 minutes)*`,
  });

  setTimeout(async () => {
    if (pendingMaj.has(interaction.user.id)) {
      pendingMaj.delete(interaction.user.id);
      await interaction.followUp({ content: '⏱️ Délai dépassé. Relance `/maj`.', flags: 64 }).catch(() => {});
    }
  }, 120_000);
}

// ── Réception des images ou "skip" ─────────────────────────────────────────
async function handleMajMessage(message) {
  if (!pendingMaj.has(message.author.id)) return false;

  const entry = pendingMaj.get(message.author.id);

  // "skip" → publier sans image
  if (message.content.trim().toLowerCase() === 'skip') {
    pendingMaj.delete(message.author.id);
    await publishMaj(message, entry);
    await message.react('✅').catch(() => {});
    return true;
  }

  // Image uploadée
  if (message.attachments.size > 0) {
    message.attachments.forEach(att => {
      if (entry.images.length < 2) entry.images.push(att.url);
    });

    if (entry.images.length >= 2) {
      pendingMaj.delete(message.author.id);
      await publishMaj(message, entry);
      await message.react('✅').catch(() => {});
    } else {
      await message.react('📷').catch(() => {});
      const msg = await message.channel.send(
        `📷 1ère image reçue ! Uploade la **2ème image** ou tape \`skip\` pour publier avec une seule image.`
      );
      setTimeout(() => msg.delete().catch(() => {}), 8000);
    }
    return true;
  }

  return false;
}

// ── Publication finale ─────────────────────────────────────────────────────
async function publishMaj(message, entry) {
  const guild   = message.guild;
  const channel = guild.channels.cache.get(CHANNEL_MAJ);
  if (!channel) return;

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`<@&${ROLE_MAJ}>`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 📢 ${entry.titre}`)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(entry.description)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### 🔧 Changements\n${entry.changements}`)
    );

  // Ajouter les images si présentes
  if (entry.images.length > 0) {
    const gallery = new MediaGalleryBuilder();
    entry.images.forEach(url => {
      gallery.addItems(new MediaGalleryItemBuilder().setURL(url));
    });
    container
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addMediaGalleryComponents(gallery);
  }

  container
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Publié par ${message.author}*`)
    );

  await channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { roles: [ROLE_MAJ] },
  });
}

module.exports = {
  openMajModal,
  handleMajSubmit,
  handleMajMessage,
};


// ============================================================
// BIENVENUE DIEU — handler image depuis messageCreate
// ============================================================
async function handleBienvenueImage(message) {
  const { pendingBienvenue, CHANNEL_GENERAL, CHANNEL_DEMANDE } = require('../commands/admin/bienvenue-dieu');

  if (!pendingBienvenue.has(message.author.id)) return false;
  if (message.attachments.size === 0) return false;

  const attachment = message.attachments.first();
  const entry      = pendingBienvenue.get(message.author.id);
  pendingBienvenue.delete(message.author.id);

  const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
  } = require('discord.js');

  const guild   = message.guild;
  const channel = guild.channels.cache.get(CHANNEL_GENERAL);
  if (!channel) return false;

  const joueur = await guild.members.fetch(entry.joueurId).catch(() => null);

  const container = new ContainerBuilder()
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(attachment.url)
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ⚔️ Nouvelle divinité validée !\n\n` +
        `${joueur ?? entry.joueurId} a été validé(e). Il/Elle incarnera **${entry.dieu}** et ses informations sont retrouvables sur le site de **Vae Victis**.\n\n` +
        `Nous comptons sur vous pour lui trouver quelques liens via le salon <#${CHANNEL_DEMANDE}>, et d'attendre l'ouverture ce **${entry.date}** pour débuter l'aventure Vae Victis.\n\n` +
        `Nous comptons sur votre engagement pour rester proche du serveur et vous manifester de temps en temps ❤️\n\n` +
        `*Le staff de Vae Victis*`
      )
    );

  await channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { users: [entry.joueurId] },
  });

  await message.react('✅').catch(() => {});
  return true;
}

module.exports.handleBienvenueImage = handleBienvenueImage;
