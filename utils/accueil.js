const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');

const CATEGORY_ACCUEIL = '1518367592476049490';
const ROLE_STAFF       = '1512195687243059371';
const BANNIERE         = 'https://i.imgur.com/l7AJ0WJ.png';

const CHANNEL_RESA     = '1512195690523000832';
const CHANNEL_CONTEXTE = '1512195689378218197';
const CHANNEL_REGLEMENT = '1512195689378218196';
const SITE_URL         = 'https://vae-victis.fr/app/';

async function createAccueilChannel(member) {
  const guild = member.guild;

  const channelName = `accueil-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  // Éviter les doublons
  const existing = guild.channels.cache.find(c => c.name === channelName);
  if (existing) return;

  const channel = await guild.channels.create({
    name: channelName,
    parent: CATEGORY_ACCUEIL,
    permissionOverwrites: [
      { id: guild.id,      deny:  ['ViewChannel'] },
      { id: member.id,     allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
      { id: ROLE_STAFF,    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
    ],
  }).catch(console.error);

  if (!channel) return;

  const container = new ContainerBuilder()
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(BANNIERE)
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ⚔️ Bienvenue sur Vae Victis, ${member} !\n\n` +
        `Nous sommes ravis de t'accueillir dans notre univers. ` +
        `Ce salon est le tien — un membre du staff passera bientôt pour répondre à toutes tes questions.\n\n` +
        `### 🌍 Qu'est-ce que Vae Victis ?\n` +
        `> Vae Victis est un jeu de rôle géopolitique et divin se déroulant en 2029. ` +
        `Tu incarnes une divinité issue de l'une des trois factions — **Olympiens**, **Sovereign** ou **Shemning** — ` +
        `et tu influences le monde à travers des territoires, des conflits et des alliances.\n\n` +
        `### 🎮 Le serveur est-il actif ?\n` +
        `> Absolument ! Même si le général peut sembler calme, le RP est vivant. ` +
        `Des conflits se jouent, des alliances se forment, et chaque divinité laisse sa marque sur le monde. ` +
        `Consulte notre site pour voir l'état actuel du jeu en temps réel.\n\n` +
        `### ⚔️ Comment rejoindre l'aventure ?\n` +
        `> **1.** Lis le contexte pour comprendre l'univers\n` +
        `> **2.** Choisis ta divinité parmi celles disponibles\n` +
        `> **3.** Fais ta réservation via le salon dédié\n` +
        `> **4.** Le staff valide ton choix et tu peux commencer !\n\n` +
        `*N'hésite pas à poser toutes tes questions ici — on est là pour toi.* ❤️\n\n` +
        `*Le staff de Vae Victis*`
      )
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('🌍 Lire le contexte')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${guild.id}/${CHANNEL_CONTEXTE}`),
    new ButtonBuilder()
      .setLabel('📜 Lire le règlement')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${guild.id}/${CHANNEL_REGLEMENT}`),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('⚔️ Réserver un personnage')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${guild.id}/${CHANNEL_RESA}`),
    new ButtonBuilder()
      .setLabel('🌐 Voir le site')
      .setStyle(ButtonStyle.Link)
      .setURL(SITE_URL),
  );

  await channel.send({
    components: [container, row1, row2],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { users: [member.id] },
  });
}

module.exports = { createAccueilChannel };
