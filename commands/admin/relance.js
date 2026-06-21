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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('relance')
    .setDescription('Ouvrir un channel de relance pour un joueur sans fiche')
    .addUserOption(o =>
      o.setName('joueur').setDescription('Le membre à relancer').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const joueur = interaction.options.getMember('joueur');
    const guild  = interaction.guild;

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
          `## ⚔️ Un petit coucou de Vae Victis\n\n` +
          `Salut ${joueur} !\n\n` +
          `Nous sommes à environ une semaine de l'ouverture, et on a remarqué que tu n'avais pas encore franchi le pas pour ta divinité. ` +
          `Pas de souci, on voulait simplement prendre des nouvelles et voir comment on peut t'accompagner au mieux. 💫\n\n` +
          `Si tu hésites encore, n'hésite pas à jeter un œil à tout ce qu'on a préparé — le contexte, l'univers, les factions — ça vaut le détour !\n\n` +
          `Et si tu as une idée de divinité qui te ferait plaisir d'incarner, n'hésite pas à nous en parler ici, ou à consulter notre liste de divinités prioritaires.\n\n` +
          `Un membre du staff va passer par ici pour discuter avec toi et comprendre ce qui te freine — on veut vraiment que Vae Victis soit un serveur vivant, et ton avis compte ! 🙏`
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
        .setLabel('⚔️ Réserver un personnage')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${guild.id}/${CHANNEL_RESA}`),
    );

    await channel.send({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { users: [joueur.id] },
    });

    await interaction.editReply({ content: `✅ Channel de relance créé : ${channel}` });
  },
};
