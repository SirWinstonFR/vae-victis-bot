// Base de données des dieux par faction
// Structure : { nom, joueur: null | userId, joue: false }

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

// Stockage en mémoire : Map<nomDieu, { joueurId, joueurTag }>
const dieuData = new Map();

// ID du message du panel (pour le mettre à jour)
let panelMessageId = null;
let panelChannelId = '1512195690523000834';

function setPanelMessageId(id) { panelMessageId = id; }
function getPanelMessageId()    { return panelMessageId; }
function getPanelChannelId()    { return panelChannelId; }

function setDieu(nomDieu, joueurId, joueurTag) {
  dieuData.set(nomDieu.toLowerCase(), { joueurId, joueurTag });
}

function removeDieu(nomDieu) {
  dieuData.delete(nomDieu.toLowerCase());
}

function getDieu(nomDieu) {
  return dieuData.get(nomDieu.toLowerCase()) || null;
}

function findDieu(nomDieu) {
  // Cherche le dieu dans toutes les factions (insensible à la casse)
  const lower = nomDieu.toLowerCase();
  for (const [faction, dieux] of Object.entries(FACTIONS)) {
    const found = dieux.find(d => d.toLowerCase() === lower);
    if (found) return { faction, nom: found };
  }
  return null;
}

function buildPanelContent(guild) {
  const lines = [];

  for (const [faction, dieux] of Object.entries(FACTIONS)) {
    lines.push(`## ${COULEURS_FACTION[faction]} ${faction}\n`);
    for (const dieu of dieux) {
      const data = getDieu(dieu);
      if (data) {
        const member = guild?.members.cache.get(data.joueurId);
        const tag = member ? member.toString() : data.joueurTag;
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
