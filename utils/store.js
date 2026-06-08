const fs   = require('fs');
const path = require('path');

const DATA_DIR = '/data';
const RESA_FILE = path.join(DATA_DIR, 'reservations.json');
const DIEUX_FILE = path.join(DATA_DIR, 'dieux.json');

// S'assurer que le dossier /data existe
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ── Réservations ───────────────────────────────────────────────────────────
function loadResa() {
  ensureDir();
  if (!fs.existsSync(RESA_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(RESA_FILE, 'utf8')); }
  catch { return {}; }
}

function saveResa(data) {
  ensureDir();
  fs.writeFileSync(RESA_FILE, JSON.stringify(data, null, 2));
}

// ── Dieux ──────────────────────────────────────────────────────────────────
function loadDieux() {
  ensureDir();
  if (!fs.existsSync(DIEUX_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(DIEUX_FILE, 'utf8')); }
  catch { return {}; }
}

function saveDieux(data) {
  ensureDir();
  fs.writeFileSync(DIEUX_FILE, JSON.stringify(data, null, 2));
}

module.exports = { loadResa, saveResa, loadDieux, saveDieux };
