const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require('discord.js');

const BANNERS = [
  'https://i.imgur.com/MxNv4Bx.png',
  'https://i.imgur.com/it5cs1p.png',
];

const FOOTER_BANNER = 'https://i.imgur.com/Nl1IjbP.png';

const CHANNELS = {
  reglement:  '1512195689378218196',
  contexte:   '1512195689378218197',
  site:       '1512195689378218199',
  personnage: '1512195690523000832',
};

async function sendWelcomeGeneral(member) {
  const guild   = member.guild;
  const channel = guild.channels.cache.get('1512195689952841859');
  if (!channel) return console.error('[WELCOME] Channel général introuvable');

  const banner = BANNERS[Math.floor(Math.random() * BANNERS.length)];

  const container = new ContainerBuilder()
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(banner)
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ⚔️ Bienvenue ${member} !\n` +
        `**${member.user.username}** vient de rejoindre **Vae Victis** !\n\n` +
        `Nous te souhaitons la bienvenue et t'invitons à prendre le temps de lire l'ensemble des informations avant de commencer.`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(FOOTER_BANNER)
      )
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('📜 Lire le règlement')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${guild.id}/${CHANNELS.reglement}`),
    new ButtonBuilder()
      .setLabel('🌍 Lire le contexte')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${guild.id}/${CHANNELS.contexte}`),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('🌐 Notre site')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${guild.id}/${CHANNELS.site}`),
    new ButtonBuilder()
      .setLabel('⚔️ Réserver un personnage')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${guild.id}/${CHANNELS.personnage}`),
  );

  await channel.send({
    components: [container, row1, row2],
    flags: MessageFlags.IsComponentsV2,
  });
}

async function sendWelcomeDM() {}

module.exports = { sendWelcomeDM, sendWelcomeGeneral };
