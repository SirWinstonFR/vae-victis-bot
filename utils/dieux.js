const { loadDieux, saveDieux } = require('./store');

const FACTIONS = {
  Sovereign: [
    'Liberty', 'Capital', 'Judgment', 'Union', 'Manifest',
    'Wrath', 'Industry', 'Old Media', 'New Media', 'Vigil', 'Science',
  ],
  Olympiens: [
    'Zeus', 'Hera', 'Poseidon', 'Demeter', 'Persephone',
    'Athena', 'Artemis', 'Ares', 'Hades', 'Apollon',
    'Hermes', 'Dionysos', 'Hestia', 'Hephaistos', 'Aphrodite',
  ],
  Shemning: [
    'Entite', 'Isis', 'Seth', 'Osiris', 'Hel',
    'Tyr', 'Loki', 'Shiva', 'Vishnu', 'Brahma', 'Amaterasu',
  ],
};

const COULEURS_FACTION = {
  Sovereign: '🔵',
  Olympiens: '🟡',
  Shemning:  '🔴',
};

// Chargement depuis le disque au démarrage
let dieuData = loadDieux();

let panelMessageId = null;
const panelChannelId = '1512195690523000834';

function setPanelMessageId(id) { panelMessageId = id; }
function getPanelMessageId()    { return panelMessageId; }
function getPanelChannelId()    { return panelChannelId; }

function setDieu(nomDieu, joueurId, joueurTag) {
  dieuData[nomDieu.toLowerCase()] = { joueurId, joueurTag };
  saveDieux(dieuData);
}

function removeDieu(nomDieu) {
  delete dieuData[nomDieu.toLowerCase()];
  saveDieux(dieuData);
}

function getDieu(nomDieu) {
  return dieuData[nomDieu.toLowerCase()] || null;
}

function findDieu(nomDieu) {
  const lower = nomDieu.toLowerCase();
  for (const [faction, dieux] of Object.entries(FACTIONS)) {
    const found = dieux.find(d => d.toLowerCase() === lower);
    if (found) return { faction, nom: found };
  }
  return null;
}

function buildPanelContent(guild, withMentions = false) {
  const lines = [];
  for (const [faction, dieux] of Object.entries(FACTIONS)) {
    lines.push(`## ${COULEURS_FACTION[faction]} ${faction}\n`);
    for (const dieu of dieux) {
      const data = getDieu(dieu);
      if (data) {
        const member = guild?.members.cache.get(data.joueurId);
        let tag;
        if (withMentions && data.joueurId) {
          tag = `<@${data.joueurId}>`;
        } else {
          tag = member ? (member.displayName || member.user.username) : data.joueurTag;
          tag = `**${tag}**`;
        }
        lines.push(`> ⚔️ **${dieu}** — joué par ${tag}`);
      } else {
        lines.push(`> ✨ **${dieu}** — *disponible*`);
      }
    }
    lines.push('');
  }
  return lines.join('\n');
}

module.exports = {
  FACTIONS,
  setDieu,
  removeDieu,
  getDieu,
  findDieu,
  buildPanelContent,
  setPanelMessageId,
  getPanelMessageId,
  getPanelChannelId,
};
