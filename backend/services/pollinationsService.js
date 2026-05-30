export async function pollGenerate(prompt, negativePrompt, size, style, quality, count) {
  const encoded = encodeURIComponent(prompt);
  const baseUrl = `https://image.pollinations.ai/prompt/${encoded}`;

  const width = size.split('x')[0];

  const results = [];
  for (let i = 0; i < count; i++) {
    const seed = Date.now() + i;
    const url = `${baseUrl}?width=${width}&height=${width}&seed=${seed}&nologo=true`;

    results.push({
      id: `poll-${seed}`,
      url,
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

  return results;
}
