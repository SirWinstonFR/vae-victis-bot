const {
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require('discord.js');
const { roles, channels } = require('../config/config');
const { generateCaptcha } = require('../utils/captcha');

// Stockage temporaire des codes captcha : Map<userId, { code, attempts }>
const captchaCodes = new Map();

module.exports = {
  name: 'guildMemberAdd',

  async execute(member, client) {
    // 1. Attribuer le rôle "non vérifié"
    const roleNV = member.guild.roles.cache.get(roles.nonVerifie);
    if (roleNV) await member.roles.add(roleNV).catch(console.error);

    // 2. Générer le captcha
    const { code, buffer } = await generateCaptcha(5);
    captchaCodes.set(member.id, { code, attempts: 0 });

    // 3. Envoyer dans le channel vérification
    const verifChannel = member.guild.channels.cache.get(channels.verification);
    if (!verifChannel) return console.error('[CAPTCHA] Channel vérification introuvable');

    const attachment = new AttachmentBuilder(buffer, { name: 'captcha.png' });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ⚔️ Bienvenue ${member} !\n` +
          `Pour accéder au serveur **Vae Victis**, entre le code affiché ci-dessous.\n` +
          `*3 essais maximum. Insensible à la casse.*`
        )
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`captcha_reply:${member.id}`)
        .setLabel('✍️ Entrer le code')
        .setStyle(ButtonStyle.Primary),
    );

    await verifChannel.send({
      components: [container, row],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });

    console.log(`[ARRIVEE] ${member.user.tag} — captcha envoyé (code: ${code})`);
  },

  captchaCodes,
};
