const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
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

  // Bannière aléatoire 50/50
  const banner = BANNERS[Math.floor(Math.random() * BANNERS.length)];

  const embed = new EmbedBuilder()
    .setColor('#c9a84c')
    .setImage(banner)
    .setDescription(
      `## ⚔️ Bienvenue ${member} !\n\n` +
      `**${member.user.username}** vient de rejoindre **Vae Victis** !\n\n` +
      `Nous te souhaitons la bienvenue et t'invitons à prendre le temps de lire l'ensemble des informations avant de commencer.`
    )
    .setFooter({ text: 'Vae Victis', iconURL: member.guild.iconURL() })
    .setThumbnail(member.user.displayAvatarURL({ size: 128 }));

  const footerEmbed = new EmbedBuilder()
    .setImage(FOOTER_BANNER)
    .setColor('#c9a84c');

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
    embeds: [embed, footerEmbed],
    components: [row1, row2],
  });
}

async function sendWelcomeDM() {} // plus utilisé

module.exports = { sendWelcomeDM, sendWelcomeGeneral };
