const { roles, channels } = require('../config/config');
const { sendWelcomeGeneral } = require('../utils/welcome');
const { handleStaffImage } = require('../utils/reservation');
const { handleMajMessage, handleBienvenueImage } = require('../utils/maj');
const { handleConflitMessage } = require('../utils/conflit');

const CHANNEL_STAFF = '1512195689176764508';

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (message.author.bot) return;

    // ── Vérification captcha ───────────────────────────────────────────
    if (message.channelId === channels.verification) {
      const { captchaCodes } = require('./guildMemberAdd');
      const entry = captchaCodes.get(message.author.id);

      await message.delete().catch(() => {});
      if (!entry) return;

      const userInput = message.content.toUpperCase().trim();
      entry.attempts++;

      if (userInput === entry.code) {
        captchaCodes.delete(message.author.id);

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

      } else if (entry.attempts >= 3) {
        captchaCodes.delete(message.author.id);
        if (entry.messageId) {
          const captchaMsg = await message.channel.messages.fetch(entry.messageId).catch(() => null);
          if (captchaMsg) await captchaMsg.delete().catch(() => {});
        }
        const msg = await message.channel.send(`❌ ${message.author} 3 tentatives échouées. Contacte un modérateur.`);
        setTimeout(() => msg.delete().catch(() => {}), 8000);
      } else {
        const msg = await message.channel.send(
          `❌ ${message.author} Code incorrect. Il te reste **${3 - entry.attempts}** essai(s).`
        );
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      }
      return;
    }

    // ── Channel staff uniquement ───────────────────────────────────────
    if (message.channelId === CHANNEL_STAFF) {

      // Réservation : image de validation
      if (message.attachments.size > 0) {
        if (await handleStaffImage(message)) return;
      }

      // Bienvenue dieu : bannière
      if (message.attachments.size > 0) {
        if (await handleBienvenueImage(message)) return;
      }

      // Conflit : image de couverture / PNJ
      if (message.attachments.size > 0 || message.content.trim().toLowerCase() === 'skip') {
        if (await handleConflitMessage(message)) return;
      }

      // MAJ : images ou skip
      await handleMajMessage(message);
    }
  },
};
