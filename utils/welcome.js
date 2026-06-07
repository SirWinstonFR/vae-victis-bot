const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require('discord.js');

async function sendWelcomeDM(member) {
  try {
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ⚔️ Bienvenue sur Vae Victis, ${member.user.username} !`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Vae Victis** est un jeu de rôle géopolitique et divin.\n` +
          `Trois factions s'affrontent pour la domination des territoires.\n\n` +
          `📋 **Prochaines étapes :**\n` +
          `> 1. Lis les règles du serveur\n` +
          `> 2. Choisis ta faction (Olympiens, Sovereign, Shemning)\n` +
          `> 3. Crée ta divinité et commence à jouer !`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Un modérateur va bientôt vérifier ton arrivée.*`)
      );

    await member.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  } catch (err) {
    console.error(`[WELCOME] Impossible d'envoyer le MP à ${member.user.tag}:`, err.message);
  }
}

module.exports = { sendWelcomeDM };
