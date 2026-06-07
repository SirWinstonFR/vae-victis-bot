const { createCanvas } = require('canvas');

/**
 * Génère une image captcha avec un code aléatoire
 * Retourne { code, buffer }
 */
function generateCaptcha(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I, O, 0, 1 (ambigus)
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const width  = 200;
  const height = 70;
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext('2d');

  // Fond dégradé sombre (cohérent avec le thème Vae Victis)
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(1, '#16213e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Lignes de bruit
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = `rgba(${Math.random()*200|0}, ${Math.random()*200|0}, ${Math.random()*200|0}, 0.4)`;
    ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // Points de bruit
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lettres déformées
  const letterSpacing = (width - 30) / length;
  for (let i = 0; i < code.length; i++) {
    const x = 20 + i * letterSpacing + Math.random() * 8 - 4;
    const y = height / 2 + Math.random() * 12 - 6;
    const angle = (Math.random() - 0.5) * 0.4;
    const size  = 28 + Math.random() * 8;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `bold ${size}px sans-serif`;

    // Couleur dorée / blanche alternée (thème VV)
    const colors = ['#c9a84c', '#ffffff', '#e0c97a', '#f0f0f0'];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }

  // Bordure dorée fine
  ctx.strokeStyle = '#c9a84c44';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  return { code, buffer: canvas.toBuffer('image/png') };
}

module.exports = { generateCaptcha };
