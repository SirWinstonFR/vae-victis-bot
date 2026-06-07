module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // Slash commands
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

    // Boutons
    if (interaction.isButton()) {
      const [action] = interaction.customId.split(':');
      const handlers = {
        'ticket_open':   () => require('../utils/tickets').openTicket(interaction, client),
        'ticket_close':  () => require('../utils/tickets').closeTicket(interaction, client),
        'verify_accept': () => require('../utils/verification').acceptMember(interaction, client),
      };
      if (handlers[action]) await handlers[action]();
    }
  },
};
