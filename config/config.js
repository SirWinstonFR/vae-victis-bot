require('dotenv').config();

module.exports = {
  token:    process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId:  process.env.GUILD_ID,

  channels: {
    arrivee: process.env.CHANNEL_ARRIVEE,
    logs:    process.env.CHANNEL_LOGS,
    tickets: process.env.CHANNEL_TICKETS,
  },

  roles: {
    membre:     process.env.ROLE_MEMBRE,
    nonVerifie: process.env.ROLE_NON_VERIFIE,
    modo:       process.env.ROLE_MODO,
  },
};
