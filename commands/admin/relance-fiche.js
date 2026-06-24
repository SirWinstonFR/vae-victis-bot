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
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

const CATEGORY_RELANCE = '1518367592476049490';
const BANNIERE         = 'https://i.imgur.com/l7AJ0WJ.png';
const CHANNEL_RESA     = '1512195690523000832';
const CHANNEL_CONTEXTE = '1512195689378218197';

function addDays(dateStr, days) {
  // Parse dd/mm/yyyy
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('relance-fiche')
    .setDescription('Ouvrir un channel de relance pour un joueur avec fiche à faire')
    .addUserOption(o =>
      o.setName('joueur').setDescription('Le membre à relancer').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('date').setDescription('Date d\'ouverture (ex: 26/06/2026)').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const joueur     = interaction.options.getMember('joueur');
    const dateOuv    = interaction.options.getString('date');
    const dateLimit  = addDays(dateOuv, 15);
    const guild      = interaction.guild;

    const channelName = `relance-${joueur.user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const existing = guild.channels.cache.find(c => c.name === channelName);
    if (existing) {
      return interaction.editReply({ content: `❌ Un channel de relance existe déjà : ${existing}` });
    }

    const channel = await guild.channels.create({
      name: channelName,
      parent: CATEGORY_RELANCE,
      permissionOverwrites: [
        { id: guild.id,  deny:  ['ViewChannel'] },
        { id: joueur.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
      ],
    });

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
          `## ⚔️ Un rappel bienveillant de Vae Victis\n\n` +
          `Salut ${joueur} !\n\n` +
          `L'aventure Vae Victis démarre le **${dateOuv}**, et on a hâte de te voir incarner ta divinité ! ` +
          `On a remarqué que ta fiche n'est pas encore complète, et on voulait te donner un petit coup de pouce avant le grand lancement. 💫\n\n` +
          `Ta fiche est la porte d'entrée dans l'univers — c'est ce qui permet aux autres joueurs de te connaître et d'interagir avec toi. ` +
          `On est là pour t'aider si tu as des questions ou si tu bloques sur quelque chose, n'hésite vraiment pas !\n\n` +
          `⚠️ **Important :** Sans fiche complète avant l'ouverture, le prochain accès ne sera possible que **15 jours plus tard, le ${dateLimit}**. ` +
          `On préfère te prévenir à l'avance pour que tu puisses t'organiser au mieux.\n\n` +
          `Un membre du staff va passer par ici pour t'accompagner — on compte sur toi pour faire vivre ce serveur ! 🙏`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Le staff de Vae Victis*`)
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🌍 Découvrir le contexte')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${guild.id}/${CHANNEL_CONTEXTE}`),
      new ButtonBuilder()
        .setLabel('⚔️ Voir les divinités')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${guild.id}/${CHANNEL_RESA}`),
    );

    await channel.send({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { users: [joueur.id] },
    });

    await interaction.editReply({ content: `✅ Channel de relance créé : ${channel}\n📅 Date limite automatique : **${dateLimit}**` });
  },
};
