const { roles, channels } = require('../config/config');

async function acceptMember(interaction, client) {
  await interaction.deferReply({ flags: 64 });

  const memberId = interaction.customId.split(':')[1];
  const member   = await interaction.guild.members.fetch(memberId).catch(() => null);

  if (!member) return interaction.editReply({ content: '❌ Membre introuvable.' });

  const roleMembre     = interaction.guild.roles.cache.get(roles.membre);
  const roleNonVerifie = interaction.guild.roles.cache.get(roles.nonVerifie);

  if (roleMembre)     await member.roles.add(roleMembre);
  if (roleNonVerifie) await member.roles.remove(roleNonVerifie);

  await interaction.editReply({ content: `✅ ${member.user.tag} a été vérifié.` });

  const logChannel = interaction.guild.channels.cache.get(channels.logs);
  if (logChannel) {
    logChannel.send(`✅ **${member.user.tag}** vérifié par **${interaction.user.tag}**`);
  }
}

module.exports = { acceptMember };
