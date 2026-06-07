const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { token } = require('./config/config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();

// Chargement des handlers
require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

client.login(token);
