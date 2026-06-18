const __ = (key) => window.__T__?.[key] || key;

const outputArea = document.getElementById('output-area');
const resultsSection = document.getElementById('results-section');
const placeholder = document.getElementById('placeholder');
const generateBtn = document.getElementById('generate-btn');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('quality-value');
const countSlider = document.getElementById('count');
const countValue = document.getElementById('count-value');

const FURNITURE_FIELDS = {
  sofa:       { labelKey: 'furniture_field_sofa',       placeholderKey: 'furniture_placeholder_sofa' },
  wardrobe:   { labelKey: 'furniture_field_wardrobe',   placeholderKey: 'furniture_placeholder_wardrobe' },
  table:      { labelKey: 'furniture_field_table',      placeholderKey: 'furniture_placeholder_table' },
  chair:      { labelKey: 'furniture_field_chair',      placeholderKey: 'furniture_placeholder_chair' },
  kitchen_furniture: { labelKey: 'furniture_field_kitchen', placeholderKey: 'furniture_placeholder_kitchen' },
};

const EXTRA_KEY_MAP = {
  sofa: 'shape',
  wardrobe: 'door_type',
  table: 'table_type',
  chair: 'chair_type',
  kitchen_furniture: 'layout_type',
};

const ANGLE_LABELS = {
  front: __('angle_front'),
  side: __('angle_side'),
  top: __('angle_top'),
};

let outputGrid = null;
let loadingEl = null;

qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = qualitySlider.value;
});

countSlider.addEventListener('input', () => {
  countValue.textContent = countSlider.value;
});

document.getElementById('furniture-type').addEventListener('change', (e) => {
  const type = e.target.value;
  const field = FURNITURE_FIELDS[type];
  const container = document.getElementById('furniture-type-specific');
  container.innerHTML = `
    <label for="furniture-extra-field">${__(field.labelKey)}</label>
    <input id="furniture-extra-field" class="form-control form-input" type="text" placeholder="${__(field.placeholderKey)}">
  `;
});

const langSelect = document.getElementById('lang-select');
if (langSelect) {
  langSelect.addEventListener('change', () => {
    document.cookie = `locale=${langSelect.value};path=/;max-age=31536000`;
    window.location.reload();
  });
}

function showLoading() {
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  placeholder.style.display = 'none';
  if (outputGrid) { outputGrid.remove(); outputGrid = null; }
  if (loadingEl) loadingEl.remove();

  loadingEl = document.createElement('div');
  loadingEl.className = 'loading-ai';
  loadingEl.innerHTML = `
    <div class="loading-ai-ring">
      <div class="loading-ai-icon">Ai</div>
    </div>
    <div class="loading-ai-text">${__('btn_generating')}</div>
  `;
  outputArea.appendChild(loadingEl);
}

function openLightbox(src, alt) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;

  const close = document.createElement('button');
  close.className = 'lightbox-close';
  close.innerHTML = '&times;';
  close.addEventListener('click', closeLightbox);

  overlay.appendChild(img);
  overlay.appendChild(close);
  document.body.appendChild(overlay);
  document.addEventListener('keydown', onLightboxKey);
}

function closeLightbox() {
  const lb = document.querySelector('.lightbox');
  if (lb) lb.remove();
  document.removeEventListener('keydown', onLightboxKey);
}

function onLightboxKey(e) {
  if (e.key === 'Escape') closeLightbox();
}

async function generateImages() {
  const size = document.getElementById('size').value;
  const style = document.getElementById('style').value;
  const quality = qualitySlider.value;
  const count = parseInt(countSlider.value, 10);

  const furnitureType = document.getElementById('furniture-type').value;
  const fields = {
    design_style: document.getElementById('furniture-design-style').value.trim(),
    material: document.getElementById('furniture-material').value.trim(),
    color: document.getElementById('furniture-color').value.trim(),
    extra_details: document.getElementById('furniture-extra-details').value.trim(),
  };
  const extraField = document.getElementById('furniture-extra-field');
  if (extraField) {
    fields[EXTRA_KEY_MAP[furnitureType] || 'shape'] = extraField.value.trim();
  }

  const hasAny = Object.values(fields).some((v) => v);
  if (!hasAny) {
    document.getElementById('furniture-design-style').focus();
    return;
  }

  const body = JSON.stringify({
    furniture: { type: furnitureType, fields },
    negativePrompt: document.getElementById('negative-prompt').value.trim(),
    size, style, quality, count,
  });

  generateBtn.disabled = true;
  generateBtn.innerHTML = `
    <div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>
    ${__('btn_generating')}
  `;

  showLoading();

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) throw new Error('API error');

    const data = await res.json();

    if (loadingEl) { loadingEl.remove(); loadingEl = null; }
    outputGrid = document.createElement('div');
    outputGrid.className = 'output-grid';
    outputGrid.id = 'output-grid';
    outputArea.appendChild(outputGrid);
    data.images.forEach((img) => renderImageCard(img));
  } catch {
    if (loadingEl) { loadingEl.remove(); loadingEl = null; }
    outputGrid = document.createElement('div');
    outputGrid.className = 'output-grid';
    outputGrid.id = 'output-grid';
    outputArea.appendChild(outputGrid);
    for (let i = 0; i < count; i++) {
      renderImageCard({
        id: `mock-${Date.now()}-${i}`,
        url: '',
        prompt: furnitureType,
        size,
        style,
        quality,
        date: new Date().toLocaleDateString(window.__LOCALE__ === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      });
    }
  }

  generateBtn.disabled = false;
  generateBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 0 1 0 2h-7v7a1 1 0 0 1-2 0v-7H4a1 1 0 0 1 0-2h7V4a1 1 0 0 1 1-1z"/>
    </svg>
    ${__('btn_generate')}
  `;
}

function renderImageCard(view) {
  const card = document.createElement('div');
  card.className = 'image-card';

  const imgSrc = view.url || '';
  const isMock = !imgSrc;
  const gradientId = `g-${view.id}`;

  const colors = isMock
    ? [Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'),
       Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')]
    : [];

  card.innerHTML = `
    <div class="image-card-preview${imgSrc ? ' img-clickable' : ''}" data-src="${imgSrc}">
      ${imgSrc
        ? `<img src="${imgSrc}" alt="${view.prompt}" loading="lazy">`
        : `<svg width="100%" height="100%" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#${colors[0]}" />
                <stop offset="100%" stop-color="#${colors[1]}" />
              </linearGradient>
            </defs>
            <rect width="512" height="512" fill="url(#${gradientId})" />
          </svg>`
      }
    </div>
    <div class="image-card-body">
      <div class="image-card-title" title="${view.prompt}">${view.prompt}</div>
      <div class="image-card-meta">
        <span>${view.size || ''}</span>
        <span>${view.date || ''}</span>
      </div>
      ${imgSrc ? `<button class="btn-download" data-filename="${view.id}.png" data-imgurl="${imgSrc}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Скачать
      </button>` : ''}
    </div>
  `;

  const preview = card.querySelector('.image-card-preview');
  if (imgSrc) {
    preview.addEventListener('click', () => openLightbox(imgSrc, view.prompt));
  }

  outputGrid.appendChild(card);
}

outputArea.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-download');
  if (!btn) return;

  const filename = btn.dataset.filename;
  const imgUrl = btn.dataset.imgurl;
  const isExternal = imgUrl && imgUrl.startsWith('http');

  const link = document.createElement('a');
  link.href = isExternal ? imgUrl : `/download/${filename}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

generateBtn.addEventListener('click', generateImages);
