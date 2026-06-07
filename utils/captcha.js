const Jimp = require('jimp');

/**
 * Génère une image captcha sans dépendances système
 * Retourne { code, buffer }
 */
async function generateCaptcha(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const width  = 200;
  const height = 70;

  // Créer l'image avec fond sombre
  const image = new Jimp(width, height, 0x1a1a2eff);

  // Charger la font
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

  // Bruit de fond : pixels aléatoires
  for (let i = 0; i < 500; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const color = Math.random() > 0.5 ? 0xc9a84c44 : 0xffffff22;
    image.setPixelColor(color, x, y);
  }

  // Lignes de bruit horizontales
  for (let i = 0; i < 5; i++) {
    const y = Math.floor(Math.random() * height);
    for (let x = 0; x < width; x++) {
      if (Math.random() > 0.5) image.setPixelColor(0xffffff33, x, y);
    }
  }

  // Écrire le code centré
  const textWidth = Jimp.measureText(font, code);
  const x = (width - textWidth) / 2;
  const y = (height - 32) / 2;
  image.print(font, x, y, code);

  // Légère perturbation pixel par pixel (effet déformation)
  for (let px = 0; px < width; px++) {
    const shift = Math.floor(Math.sin(px / 20) * 3);
    for (let py = 0; py < height; py++) {
      const srcY = py + shift;
      if (srcY >= 0 && srcY < height) {
        const col = image.getPixelColor(px, srcY);
        image.setPixelColor(col, px, py);
      }
    }
  }

  const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
  return { code, buffer };
}

module.exports = { generateCaptcha };
