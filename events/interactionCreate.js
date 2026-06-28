const {
  openResaModal,
  handleResaSubmit,
  handleResaValidation,
  handleResaRefus,
} = require('../utils/reservation');
const { handleMajSubmit } = require('../utils/maj');
const {
  handleConflitModal1,
} = require('../utils/conflit');

const ROLE_REGLEMENT = '1513520319019749438';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ── Slash commands ─────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(err);
        const msg = { content: '❌ Une erreur est survenue.', flags: 64 };
        interaction.replied ? interaction.followUp(msg) : interaction.reply(msg);
      }
    }

    // ── Boutons ────────────────────────────────────────────────────────
    if (interaction.isButton()) {
      const [action, param] = interaction.customId.split(':');

      if (action === 'reglement_accept') {
        await interaction.deferReply({ flags: 64 });
        const role = interaction.guild.roles.cache.get(ROLE_REGLEMENT);
        if (!role) return interaction.editReply({ content: '❌ Rôle introuvable.' });
        if (interaction.member.roles.cache.has(ROLE_REGLEMENT)) {
          return interaction.editReply({ content: '✅ Tu as déjà accepté le règlement !' });
        }
        await interaction.member.roles.add(role);
        return interaction.editReply({ content: '✅ Merci ! Tu as accepté le règlement de Vae Victis.' });
      }

      if (action === 'role_toggle') {
        await interaction.deferReply({ flags: 64 });
        const role = interaction.guild.roles.cache.get(param);
        if (!role) return interaction.editReply({ content: '❌ Rôle introuvable.' });
        if (interaction.member.roles.cache.has(param)) {
          await interaction.member.roles.remove(role);
          return interaction.editReply({ content: `🔕 Rôle **${role.name}** retiré.` });
        } else {
          await interaction.member.roles.add(role);
          return interaction.editReply({ content: `🔔 Rôle **${role.name}** obtenu.` });
        }
      }

      if (action === 'ticket_open')  return require('../utils/tickets').openTicket(interaction, client);
      if (action === 'ticket_close') return require('../utils/tickets').closeTicket(interaction, client);
      if (action === 'resa_open')    return openResaModal(interaction);
      if (action === 'resa_valid')   return handleResaValidation(interaction);
      if (action === 'resa_refus')   return handleResaRefus(interaction);
    }

    // ── Modals ─────────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'resa_submit')     return handleResaSubmit(interaction);
      if (interaction.customId === 'maj_submit')      return handleMajSubmit(interaction);
      if (interaction.customId === 'conflit_modal1')  return handleConflitModal1(interaction);
    }
  },
};
