export async function generateMockImage(prompt, size, style, quality, seed) {
  const [w, h] = size.split('x').map(Number);

  const color1 = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const color2 = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const truncated = prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#${color1}"/>
        <stop offset="100%" stop-color="#${color2}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="${w / 2}" y="${h / 2 - 10}" text-anchor="middle" dominant-baseline="central" fill="white" opacity="0.3" font-size="20" font-family="Inter, sans-serif">${truncated}</text>
    <text x="${w / 2}" y="${h / 2 + 20}" text-anchor="middle" dominant-baseline="central" fill="white" opacity="0.2" font-size="12" font-family="Inter, sans-serif">${style} · ${size}</text>
  </svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export async function mockGenerate(prompt, negativePrompt, size, style, quality, count) {
  const images = [];
  for (let i = 0; i < count; i++) {
    const seed = Date.now() + i;
    const dataUrl = await generateMockImage(prompt, size, style, quality, seed);
    images.push({
      id: `mock-${seed}`,
      url: dataUrl,
      prompt: prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt,
      size,
      style,
      quality,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    });
  }
  return images;
}
