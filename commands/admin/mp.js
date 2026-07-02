const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');

const BANNIERE = 'https://i.imgur.com/l7AJ0WJ.png';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mp')
    .setDescription('Envoyer un message privé de relance à un membre')
    .addUserOption(o =>
      o.setName('membre').setDescription('Le membre à contacter').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const membre = interaction.options.getMember('membre');
    if (!membre) return interaction.editReply({ content: '❌ Membre introuvable.' });

    const embed = new EmbedBuilder()
      .setColor('#c9a84c')
      .setTitle('⚔️ Vae Victis — On pense à toi !')
      .setImage(BANNIERE)
      .setDescription(
        `👋 **Bonjour !**\n\n` +
        `Nous n'avons plus vraiment de nouvelles de ta part depuis ton arrivée sur **Vae Victis**. ` +
        `Nous nous doutons que si tu as rejoint le serveur, c'est qu'il y avait au moins un intérêt ou une curiosité pour notre univers, ` +
        `et nous espérons sincèrement pouvoir construire une belle aventure RP avec toi.\n\n` +
        `Ce message est envoyé afin de reprendre contact avec toi et, pourquoi pas, raviver cet intérêt. ` +
        `Chaque jour, nous faisons de notre mieux pour faire vivre le projet : développement de notre interface web, ` +
        `enrichissement du lore, organisation du roleplay et animation de notre communauté. ` +
        `Nous espérons que tu en feras bientôt pleinement partie.\n\n` +
        `Si tu souhaites te lancer ou simplement échanger sur ton personnage, n'hésite pas à rejoindre **ton salon d'arrivée**. ` +
        `Nous serons ravis de répondre à tes questions, de t'accompagner dans la création de ton personnage ` +
        `et de t'aider à trouver ta place dans l'univers de Vae Victis.\n\n` +
        `Au plaisir de te retrouver bientôt parmi nous. ⚔️`
      )
      .setFooter({ text: 'Le staff de Vae Victis' })
      .setTimestamp();

    try {
      await membre.send({ embeds: [embed] });
      await interaction.editReply({
        content: `✅ Message envoyé à **${membre.user.tag}** avec succès.`,
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ Impossible d'envoyer le MP à **${membre.user.tag}** — ses MPs sont probablement désactivés.`,
      });
    }
  },
};
