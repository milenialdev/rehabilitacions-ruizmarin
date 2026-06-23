(async function () {
  const REPO = 'milenialdev/rehabilitacions-ruizmarin';
  const grid = document.getElementById('obres-grid');
  const noResults = document.getElementById('no-results');
  const allCards = [];

  // ── LIGHTBOX ──────────────────────────────────────────────
  const lb = document.createElement('div');
  lb.className = 'lb-overlay';
  lb.innerHTML = `
    <button class="lb-close" aria-label="Tancar">✕</button>
    <button class="lb-arrow lb-prev" aria-label="Anterior">&#8249;</button>
    <button class="lb-arrow lb-next" aria-label="Següent">&#8250;</button>
    <div class="lb-content">
      <img class="lb-img" src="" alt="">
      <div class="lb-footer">
        <p class="lb-title"></p>
        <p class="lb-desc"></p>
        <span class="lb-counter"></span>
      </div>
    </div>`;
  document.body.appendChild(lb);

  let lbImages = [], lbIdx = 0, lbTitle = '', lbDescription = '';

  function lbRender() {
    lb.querySelector('.lb-img').src = lbImages[lbIdx];
    lb.querySelector('.lb-title').textContent = lbTitle;
    lb.querySelector('.lb-desc').textContent = lbDescription || '';
    lb.querySelector('.lb-counter').textContent = lbImages.length > 1
      ? `${lbIdx + 1} / ${lbImages.length}` : '';
    lb.querySelector('.lb-prev').style.display = lbImages.length > 1 ? '' : 'none';
    lb.querySelector('.lb-next').style.display = lbImages.length > 1 ? '' : 'none';
  }

  function lbOpen(images, title, desc, startIdx = 0) {
    lbImages = images; lbIdx = startIdx;
    lbTitle = title || ''; lbDescription = desc || '';
    lbRender();
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function lbClose() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  lb.querySelector('.lb-close').addEventListener('click', lbClose);
  lb.querySelector('.lb-prev').addEventListener('click', () => {
    lbIdx = (lbIdx - 1 + lbImages.length) % lbImages.length; lbRender();
  });
  lb.querySelector('.lb-next').addEventListener('click', () => {
    lbIdx = (lbIdx + 1) % lbImages.length; lbRender();
  });
  lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + lbImages.length) % lbImages.length; lbRender(); }
    if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbImages.length; lbRender(); }
  });

  // ── FILTER BUTTONS ────────────────────────────────────────
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      let visible = 0;
      allCards.forEach(card => {
        const show = cat === 'tots' || card.dataset.categoria === cat;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      noResults.style.display = visible === 0 ? 'block' : 'none';
    });
  });

  // ── FRONTMATTER PARSER (handles arrays) ───────────────────
  function parseFrontmatter(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return {};
    const obj = {};
    const lines = m[1].split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim() || /^\s/.test(line)) { i++; continue; }
      const ci = line.indexOf(':');
      if (ci < 0) { i++; continue; }
      const key = line.slice(0, ci).trim();
      const val = line.slice(ci + 1).trim();
      if (val === '') {
        const items = [];
        i++;
        while (i < lines.length && /^\s*-\s/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*-\s*/, '').trim());
          i++;
        }
        obj[key] = items;
      } else {
        obj[key] = val;
        i++;
      }
    }
    return obj;
  }

  // ── BUILD CARD ────────────────────────────────────────────
  function buildCard(data) {
    const images = [data.foto].filter(Boolean);
    if (Array.isArray(data.fotos_addicionals)) {
      images.push(...data.fotos_addicionals.filter(Boolean));
    }

    const card = document.createElement('div');
    card.className = 'obra-card';
    card.dataset.categoria = data.categoria || '';

    if (images.length > 0) {
      card.innerHTML = `<div class="obra-img">
        <img src="${images[0]}" alt="${data.title || ''}">
        ${images.length > 1 ? `<span class="obra-img-count">&#128247; ${images.length}</span>` : ''}
      </div>`;
    } else {
      card.innerHTML = `<div class="obra-img obra-img-ph">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </div>`;
    }

    card.innerHTML += `<div class="obra-info">
      ${data.categoria ? `<span class="obra-cat">${data.categoria}</span>` : ''}
      <p class="obra-title">${data.title || ''}</p>
      ${data.ubicacio ? `<p class="obra-loc">${data.ubicacio}</p>` : ''}
      ${data.descripcio ? `<p class="obra-desc">${data.descripcio}</p>` : ''}
    </div>`;

    if (images.length > 0) {
      card.addEventListener('click', () => lbOpen(images, data.title, data.descripcio));
    }

    return card;
  }

  // ── LOAD FROM GITHUB API ──────────────────────────────────
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/_treballs`);
    if (!res.ok) throw new Error();
    const files = (await res.json()).filter(f => f.name.endsWith('.md'));

    if (files.length === 0) {
      grid.innerHTML = '<p class="obra-card-ph">Encara no hi ha treballs publicats.</p>';
      return;
    }

    const texts = await Promise.all(
      files.map(f => fetch(`${f.download_url}?sha=${f.sha}`).then(r => r.text()))
    );
    const treballs = texts.map(parseFrontmatter).filter(t => t.title);

    grid.innerHTML = '';
    treballs.forEach(t => {
      const card = buildCard(t);
      grid.appendChild(card);
      allCards.push(card);
    });

    // Apply URL filter if coming from index bento
    const urlCat = new URLSearchParams(window.location.search).get('cat');
    if (urlCat) {
      const btn = document.querySelector(`.filter-btn[data-filter="${urlCat}"]`);
      if (btn) btn.click();
    }
  } catch (e) {
    grid.innerHTML = '<p class="obra-card-ph">No s\'han pogut carregar els treballs.</p>';
  }
})();
