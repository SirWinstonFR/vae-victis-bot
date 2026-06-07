const {
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');
const { roles, channels } = require('../config/config');
const { generateCaptcha } = require('../utils/captcha');

const captchaCodes = new Map();

module.exports = {
  name: 'guildMemberAdd',

  async execute(member, client) {
    // 1. Attribuer le rôle "non vérifié"
    const roleNV = member.guild.roles.cache.get(roles.nonVerifie);
    if (roleNV) await member.roles.add(roleNV).catch(console.error);

    // 2. Générer le captcha
    const { code, buffer } = generateCaptcha(5);
    captchaCodes.set(member.id, { code, attempts: 0 });

    // 3. Envoyer dans le channel vérification
    const verifChannel = member.guild.channels.cache.get(channels.verification);
    if (!verifChannel) return console.error('[CAPTCHA] Channel vérification introuvable');

    const attachment = new AttachmentBuilder(buffer, { name: 'captcha.png' });

    await verifChannel.send({
      content:
        `## ⚔️ Bienvenue ${member} !\n` +
        `Pour accéder au serveur **Vae Victis**, tape directement le code affiché sur l'image ci-dessous.\n` +
        `*3 essais maximum. Insensible à la casse.*`,
      files: [attachment],
    });

    console.log(`[ARRIVEE] ${member.user.tag} — captcha envoyé (code: ${code})`);
  },

  captchaCodes,
};
