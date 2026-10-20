import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG with vibrant Solo Leveling shadow monarch / hunter monarch vibe
// Cyan (#00F0FF) + Indigo/Violet (#8B5CF6, #6366F1) on dark charcoal/black (#07090E)
const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#141a29"/>
      <stop offset="60%" stop-color="#0a0d14"/>
      <stop offset="100%" stop-color="#040608"/>
    </radialGradient>
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="45%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cyanVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="45%" stop-color="#38bdf8"/>
      <stop offset="75%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <linearGradient id="bladeGrad" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#00f0ff"/>
      <stop offset="70%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </linearGradient>
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur1"/>
      <feGaussianBlur stdDeviation="20" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" fill="url(#bgGlow)"/>
  <rect width="512" height="512" fill="url(#coreGlow)"/>

  <!-- Outer Hunter Frame Ring -->
  <polygon points="256,36 448,146 448,366 256,476 64,366 64,146" 
           fill="none" stroke="#1e293b" stroke-width="4"/>
  <polygon points="256,48 436,152 436,360 256,464 76,360 76,152" 
           fill="none" stroke="url(#cyanVioletGrad)" stroke-width="2" stroke-opacity="0.5"/>

  <!-- Corner Runes -->
  <circle cx="256" cy="36" r="4" fill="#00f0ff" filter="url(#neonGlow)"/>
  <circle cx="448" cy="146" r="4" fill="#8b5cf6"/>
  <circle cx="448" cy="366" r="4" fill="#00f0ff"/>
  <circle cx="256" cy="476" r="4" fill="#8b5cf6" filter="url(#neonGlow)"/>
  <circle cx="64" cy="366" r="4" fill="#00f0ff"/>
  <circle cx="64" cy="146" r="4" fill="#8b5cf6"/>

  <!-- Shadow Sovereign Wings / Energy Spikes -->
  <g filter="url(#neonGlow)">
    <!-- Left Wing Flares -->
    <path d="M256,220 C200,160 120,165 96,210 C135,215 170,240 190,265 C145,260 110,285 102,320 C140,310 180,325 210,360 C180,370 160,395 155,420 C195,395 230,370 256,330 Z"
          fill="url(#cyanVioletGrad)" fill-opacity="0.25"/>
    <path d="M256,220 C210,180 150,180 115,225 C150,230 185,250 205,275 C165,275 135,300 130,330 C165,320 200,335 225,370 Z"
          fill="none" stroke="#00f0ff" stroke-width="2.5" stroke-opacity="0.8"/>

    <!-- Right Wing Flares -->
    <path d="M256,220 C312,160 392,165 416,210 C377,215 342,240 322,265 C367,260 402,285 410,320 C372,310 332,325 302,360 C332,370 352,395 357,420 C317,395 282,370 256,330 Z"
          fill="url(#cyanVioletGrad)" fill-opacity="0.25"/>
    <path d="M256,220 C302,180 362,180 397,225 C362,230 327,250 307,275 C347,275 377,300 382,330 C347,320 312,335 287,370 Z"
          fill="none" stroke="#c084fc" stroke-width="2.5" stroke-opacity="0.8"/>
  </g>

  <!-- Central Shadow Monarch Blade & "S" Crest -->
  <g filter="url(#neonGlow)">
    <!-- Central Dagger / Core Blade -->
    <polygon points="256,76 274,190 262,390 256,430 250,390 238,190" 
             fill="url(#bladeGrad)"/>
    <!-- Blade edge highlight -->
    <line x1="256" y1="76" x2="256" y2="430" stroke="#ffffff" stroke-width="2" stroke-opacity="0.9"/>
  </g>

  <!-- Stylized "S" Monarch Glyph overlaid -->
  <path d="M296,155 C296,128 278,114 256,114 C230,114 212,130 212,154 C212,180 236,196 262,210 C292,226 312,248 312,282 C312,322 284,346 248,346 C220,346 198,332 192,306 L218,298 C222,314 234,324 248,324 C268,324 284,310 284,284 C284,258 262,242 236,228 C210,214 186,190 186,154 C186,116 216,92 256,92 C290,92 318,112 322,148 Z"
        fill="url(#cyanVioletGrad)" filter="url(#neonGlow)"/>

  <!-- Core Eye / Mana Gem -->
  <circle cx="256" cy="235" r="7" fill="#ffffff" filter="url(#neonGlow)"/>
  <circle cx="256" cy="235" r="14" fill="none" stroke="#00f0ff" stroke-width="2" stroke-opacity="0.8"/>
</svg>`;

// Safe zone maskable SVG (scaled to 80% with deep dark padding)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#07090e"/>
  <g transform="translate(51.2, 51.2) scale(0.8)">
    ${baseSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), baseSvg);

async function generatePngs() {
  const svgBuffer = Buffer.from(baseSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  await sharp(maskableBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.ico');

  // If android res directory exists, populate Android launcher mipmaps
  const androidResDir = path.resolve('android/app/src/main/res');
  if (fs.existsSync(androidResDir)) {
    const mipmaps = [
      { dir: 'mipmap-mdpi', size: 48 },
      { dir: 'mipmap-hdpi', size: 72 },
      { dir: 'mipmap-xhdpi', size: 96 },
      { dir: 'mipmap-xxhdpi', size: 144 },
      { dir: 'mipmap-xxxhdpi', size: 192 },
    ];

    for (const m of mipmaps) {
      const targetFolder = path.join(androidResDir, m.dir);
      if (fs.existsSync(targetFolder)) {
        await sharp(svgBuffer).resize(m.size, m.size).png().toFile(path.join(targetFolder, 'ic_launcher.png'));
        await sharp(svgBuffer).resize(m.size, m.size).png().toFile(path.join(targetFolder, 'ic_launcher_round.png'));
        console.log(`Updated Android ${m.dir} icons (${m.size}x${m.size})`);
      }
    }
  }
}

generatePngs().catch(console.error);
