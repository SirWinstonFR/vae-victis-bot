const {
  openResaModal1,
  handleModal1,
  handleModal2,
  handleResaValidation,
  handleResaRefus,
} = require('../utils/reservation');

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
      const [action] = interaction.customId.split(':');
      if (action === 'ticket_open')  return require('../utils/tickets').openTicket(interaction, client);
      if (action === 'ticket_close') return require('../utils/tickets').closeTicket(interaction, client);
      if (action === 'resa_open')    return openResaModal1(interaction);
      if (action === 'resa_valid')   return handleResaValidation(interaction);
      if (action === 'resa_refus')   return handleResaRefus(interaction);
    }

    // ── Modals ─────────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      const { customId } = interaction;
      if (customId === 'resa_modal1') return handleModal1(interaction);
      if (customId === 'resa_modal2') return handleModal2(interaction);
    }
  },
};
