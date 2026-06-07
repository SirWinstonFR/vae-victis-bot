const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const { token, clientId, guildId } = require('../config/config');

const commands = [];
const foldersPath = path.join(__dirname, '..', 'commands');

for (const folder of fs.readdirSync(foldersPath)) {
  const commandsPath = path.join(foldersPath, folder);
  for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd?.data) commands.push(cmd.data.toJSON());
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Déploiement de ${commands.length} commande(s)...`);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('✅ Commandes déployées.');
  } catch (err) {
    console.error(err);
  }
})();
