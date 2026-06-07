const { roles } = require('../config/config');
const { sendWelcomeDM } = require('../utils/welcome');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    // 1. Attribuer le rôle "non vérifié"
    const role = member.guild.roles.cache.get(roles.nonVerifie);
    if (role) await member.roles.add(role).catch(console.error);

    // 2. Envoyer le MP de bienvenue + FAQ
    await sendWelcomeDM(member);

    console.log(`[ARRIVEE] ${member.user.tag} a rejoint le serveur`);
  },
};
