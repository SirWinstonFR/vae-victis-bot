const { roles, channels } = require('../config/config');
const { sendWelcomeGeneral } = require('../utils/welcome');

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (message.author.bot) return;
    if (message.channelId !== channels.verification) return;

    const { captchaCodes } = require('./guildMemberAdd');
    const entry = captchaCodes.get(message.author.id);

    // Supprimer le message de l'utilisateur
    await message.delete().catch(() => {});

    if (!entry) return;

    const userInput = message.content.toUpperCase().trim();
    entry.attempts++;

    // ✅ Bonne réponse
    if (userInput === entry.code) {
      captchaCodes.delete(message.author.id);

      // Supprimer le message captcha du bot
      if (entry.messageId) {
        const captchaMsg = await message.channel.messages.fetch(entry.messageId).catch(() => null);
        if (captchaMsg) await captchaMsg.delete().catch(() => {});
      }

      const member = await message.guild.members.fetch(message.author.id).catch(() => null);
      if (!member) return;

      const roleMembre = message.guild.roles.cache.get(roles.membre);
      const roleNV     = message.guild.roles.cache.get(roles.nonVerifie);
      if (roleMembre) await member.roles.add(roleMembre);
      if (roleNV)     await member.roles.remove(roleNV);

      const confirm = await message.channel.send(`✅ ${message.author} Vérifié ! Bienvenue sur Vae Victis ⚔️`);
      setTimeout(() => confirm.delete().catch(() => {}), 5000);

      await sendWelcomeGeneral(member);

      const logChannel = message.guild.channels.cache.get(channels.logs);
      if (logChannel) logChannel.send(`✅ **${message.author.tag}** s'est vérifié via captcha.`);

    // ❌ 3 tentatives échouées
    } else if (entry.attempts >= 3) {
      captchaCodes.delete(message.author.id);

      // Supprimer aussi le message captcha
      if (entry.messageId) {
        const captchaMsg = await message.channel.messages.fetch(entry.messageId).catch(() => null);
        if (captchaMsg) await captchaMsg.delete().catch(() => {});
      }

      const msg = await message.channel.send(`❌ ${message.author} 3 tentatives échouées. Contacte un modérateur.`);
      setTimeout(() => msg.delete().catch(() => {}), 8000);

    // ❌ Mauvaise réponse, il reste des essais
    } else {
      const msg = await message.channel.send(
        `❌ ${message.author} Code incorrect. Il te reste **${3 - entry.attempts}** essai(s).`
      );
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    }
  },
};
