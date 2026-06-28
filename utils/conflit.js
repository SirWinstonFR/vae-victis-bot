const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ThumbnailBuilder,
  SectionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');

// ── Modal unique → stocker et demander images ──────────────────────────────
async function handleConflitModal1(interaction) {
  await interaction.deferReply({ flags: 64 });

  const { pendingConflit } = require('../commands/admin/conflit');

  const pre = pendingConflit.get(`pre_${interaction.user.id}`);
  if (!pre) return interaction.editReply({ content: '❌ Session expirée, relance `/conflit`.' });

  const lieu        = interaction.fields.getTextInputValue('lieu');
  const description = interaction.fields.getTextInputValue('description');
  const idees       = interaction.fields.getTextInputValue('idees')?.trim() || null;
  const pnjNom      = interaction.fields.getTextInputValue('pnj_nom')?.trim() || null;
  const pnjBio      = interaction.fields.getTextInputValue('pnj_bio')?.trim() || null;

  pendingConflit.set(interaction.user.id, {
    attaquant: pre.attaquant,
    defenseur: pre.defenseur,
    lieu,
    description,
    idees,
    pnjNom,
    pnjBio,
    images: [],
  });
  pendingConflit.delete(`pre_${interaction.user.id}`);

  const hasPnj = !!pnjNom;

  await interaction.editReply({
    content:
      `✅ Infos enregistrées !\n\n` +
      `Uploade maintenant dans le channel staff :\n` +
      `**1.** L'image de couverture du post\n` +
      (hasPnj ? `**2.** L'image du PNJ **${pnjNom}**\n` : '') +
      `\nOu tape \`skip\` pour publier sans image.\n*(Délai : 3 minutes)*`,
  });

  setTimeout(async () => {
    if (pendingConflit.has(interaction.user.id)) {
      pendingConflit.delete(interaction.user.id);
      await interaction.followUp({ content: '⏱️ Délai dépassé. Relance `/conflit`.', flags: 64 }).catch(() => {});
    }
  }, 180_000);
}

// ── Réception images ou skip ───────────────────────────────────────────────
async function handleConflitMessage(message) {
  const { pendingConflit } = require('../commands/admin/conflit');
  if (!pendingConflit.has(message.user?.id || message.author.id)) return false;

  const userId = message.author.id;
  const entry  = pendingConflit.get(userId);
  if (!entry) return false;

  const hasPnj      = !!entry.pnjNom;
  const needsImages = hasPnj ? 2 : 1;

  // skip → publier sans image
  if (message.content.trim().toLowerCase() === 'skip' && entry.images.length === 0) {
    pendingConflit.delete(userId);
    await publishConflit(message, entry, null, null);
    await message.react('✅').catch(() => {});
    return true;
  }

  // Image reçue
  if (message.attachments.size > 0) {
    message.attachments.forEach(att => {
      if (entry.images.length < needsImages) entry.images.push(att.url);
    });

    if (entry.images.length >= needsImages) {
      pendingConflit.delete(userId);
      const coverImage = entry.images[0] || null;
      const pnjImage   = hasPnj ? (entry.images[1] || null) : null;
      await publishConflit(message, entry, coverImage, pnjImage);
      await message.react('✅').catch(() => {});
    } else {
      await message.react('📷').catch(() => {});
      const msg = await message.channel.send(
        `📷 Image reçue ! Uploade maintenant l'image du PNJ **${entry.pnjNom}**.`
      );
      setTimeout(() => msg.delete().catch(() => {}), 8000);
    }
    return true;
  }

  return false;
}

// ── Publication dans le forum ──────────────────────────────────────────────
async function publishConflit(message, entry, coverImage, pnjImage) {
  const { CHANNEL_FORUM } = require('../commands/admin/conflit');
  const guild   = message.guild;
  const forum   = guild.channels.cache.get(CHANNEL_FORUM);
  if (!forum) return;

  const { attaquant, defenseur, lieu, description, idees, pnjNom, pnjBio } = entry;

  const title = `⚔️ ${attaquant.user.username} vs ${defenseur.user.username} — ${lieu}`;

  // Dédupliquer les IDs (cas où attaquant = défenseur en test)
  const mentionUsers = [...new Set([attaquant.id, defenseur.id])];

  // ── Container principal ────────────────────────────────────────────
  const main = new ContainerBuilder();

  // Bannière / image de couverture
  if (coverImage) {
    main.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(coverImage)
      )
    );
    main.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
  }

  // Header du conflit — ligne VS + détails
  main.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ⚔️ Conflit — ${lieu}\n\n` +
      `${attaquant} ⚔️ **VS** ⚔️ ${defenseur}\n\n` +
      `> **Attaquant :** ${attaquant}\n` +
      `> **Défenseur :** ${defenseur}`
    )
  );

  main.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // Description
  main.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `### 📜 Situation\n` +
      description.split('\n').map(l => `> ${l}`).join('\n')
    )
  );

  // Idées si présentes
  if (idees) {
    main.addSeparatorComponents(
      new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small)
    );
    main.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### 💡 Pistes & raisons possibles\n` +
        idees.split('\n').map(l => `> ${l}`).join('\n')
      )
    );
  }

  // ── Container PNJ (optionnel) ──────────────────────────────────────
  let pnjContainer = null;

  if (pnjNom) {
    pnjContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### 👤 PNJ impliqué — ${pnjNom}`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      );

    if (pnjBio || pnjImage) {
      const section = new SectionBuilder();

      section.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(pnjBio || '*Aucune description.*')
      );

      if (pnjImage) {
        section.setThumbnailAccessory(
          new ThumbnailBuilder().setURL(pnjImage).setDescription(pnjNom)
        );
      }

      pnjContainer.addSectionComponents(section);
    }
  }

  // ── Publier dans le forum ──────────────────────────────────────────
  const components = pnjContainer
    ? [main, pnjContainer]
    : [main];

  const thread = await forum.threads.create({
    name: title,
    message: {
      components,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        users: mentionUsers,
      },
    },
  });

  // Épingler le premier message automatiquement
  try {
    const starterMessage = await thread.fetchStarterMessage();
    if (starterMessage) await starterMessage.pin();
  } catch (e) {
    console.warn('[CONFLIT] Épinglage échoué :', e.message);
  }
}

module.exports = {
  handleConflitModal1,
  handleConflitMessage,
};
