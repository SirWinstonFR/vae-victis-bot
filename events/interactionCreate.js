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
    }
  },
};
