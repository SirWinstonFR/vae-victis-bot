const fs   = require('fs');
const path = require('path');

module.exports = (client) => {
  const foldersPath = path.join(__dirname, '..', 'commands');
  const folders = fs.readdirSync(foldersPath);

  for (const folder of folders) {
    const commandsPath = path.join(foldersPath, folder);
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(commandsPath, file));
      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
        console.log(`[CMD] /${command.data.name} chargée`);
      }
    }
  }
};
