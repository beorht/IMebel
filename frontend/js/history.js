const __ = (key) => window.__T__?.[key] || key;

const historyArea = document.getElementById('history-area');
const historyPlaceholder = document.getElementById('history-placeholder');

function extensionFromUrl(url) {
  return url.match(/\.\w+(?=$|\?)/)?.[0] || '.png';
}

function renderGeneration(generation) {
  const section = document.createElement('div');
  section.className = 'output-grid';

  generation.images.forEach((img) => {
    const card = document.createElement('div');
    card.className = 'image-card';

    const ext = extensionFromUrl(img.url || '');
    const filename = `${img.id}${ext}`;

    card.innerHTML = `
      <div class="image-card-preview">
        <img src="${img.url}" alt="${generation.prompt}" loading="lazy">
      </div>
      <div class="image-card-body">
        <div class="image-card-title" title="${generation.prompt}">${generation.prompt}</div>
        <div class="image-card-meta">
          <span>${img.size || ''}</span>
          <span>${new Date(generation.createdAt).toLocaleDateString()}</span>
        </div>
        <button class="btn-download" data-filename="${filename}" data-imgurl="${img.url}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          ${__('btn_download')}
        </button>
      </div>
    `;

    section.appendChild(card);
  });

  return section;
}

async function loadHistory() {
  try {
    const res = await fetch('/api/history');
    const data = await res.json();

    if (!data.success || data.generations.length === 0) return;

    historyPlaceholder.style.display = 'none';
    data.generations.forEach((generation) => {
      historyArea.appendChild(renderGeneration(generation));
    });
  } catch {
    // Leave the empty-state placeholder visible on network failure
  }
}

if (historyArea.dataset.bound !== 'true') {
  historyArea.dataset.bound = 'true';
  historyArea.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-download');
    if (btn) {
      const filename = btn.dataset.filename;
      const imgUrl = btn.dataset.imgurl;
      const isExternal = imgUrl && imgUrl.startsWith('http');

      const link = document.createElement('a');
      link.href = isExternal ? imgUrl : `/download/${filename}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
  });
}

loadHistory();
