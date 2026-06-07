const { roles, channels } = require('../config/config');
const { sendWelcomeGeneral } = require('../utils/welcome');

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    // Ignorer les bots
    if (message.author.bot) return;

    // Uniquement dans le channel vérification
    if (message.channelId !== channels.verification) return;

    const { captchaCodes } = require('./guildMemberAdd');
    const entry = captchaCodes.get(message.author.id);

    // Supprimer le message dans tous les cas pour garder le channel propre
    await message.delete().catch(() => {});

    // Pas de captcha en attente pour cet utilisateur
    if (!entry) return;

    const userInput = message.content.toUpperCase().trim();
    entry.attempts++;

    // ✅ Bonne réponse
    if (userInput === entry.code) {
      captchaCodes.delete(message.author.id);

      const member = await message.guild.members.fetch(message.author.id).catch(() => null);
      if (!member) return;

      const roleMembre = message.guild.roles.cache.get(roles.membre);
      const roleNV     = message.guild.roles.cache.get(roles.nonVerifie);
      if (roleMembre) await member.roles.add(roleMembre);
      if (roleNV)     await member.roles.remove(roleNV);

      // Confirmation éphémère dans le channel (se supprime après 5s)
      const confirm = await message.channel.send(`✅ ${message.author} Vérifié ! Bienvenue sur Vae Victis ⚔️`);
      setTimeout(() => confirm.delete().catch(() => {}), 5000);

      // Message de bienvenue dans le général
      await sendWelcomeGeneral(member);

      // Log
      const logChannel = message.guild.channels.cache.get(channels.logs);
      if (logChannel) logChannel.send(`✅ **${message.author.tag}** s'est vérifié via captcha.`);

    // ❌ Mauvaise réponse
    } else if (entry.attempts >= 3) {
      captchaCodes.delete(message.author.id);
      const msg = await message.channel.send(`❌ ${message.author} 3 tentatives échouées. Contacte un modérateur.`);
      setTimeout(() => msg.delete().catch(() => {}), 8000);
    } else {
      const msg = await message.channel.send(
        `❌ ${message.author} Code incorrect. Il te reste **${3 - entry.attempts}** essai(s).`
      );
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    }
  },
};
