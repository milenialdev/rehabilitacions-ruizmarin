(async function () {
  const REPO = 'milenialdev/rehabilitacions-ruizmarin';
  const grid = document.getElementById('obres-grid');
  const noResults = document.getElementById('no-results');
  const allCards = [];

  // Filter buttons
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

  function parseFrontmatter(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return {};
    const obj = {};
    m[1].split('\n').forEach(line => {
      const i = line.indexOf(':');
      if (i > -1) obj[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    return obj;
  }

  function buildCard(data) {
    const card = document.createElement('div');
    card.className = 'obra-card';
    card.dataset.categoria = data.categoria || '';

    card.innerHTML = data.foto
      ? `<div class="obra-img"><img src="${data.foto}" alt="${data.title || ''}"></div>`
      : `<div class="obra-img obra-img-ph"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

    card.innerHTML += `<div class="obra-info">
      ${data.categoria ? `<span class="obra-cat">${data.categoria}</span>` : ''}
      <p class="obra-title">${data.title || ''}</p>
      ${data.ubicacio ? `<p class="obra-loc">${data.ubicacio}</p>` : ''}
    </div>`;

    return card;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/_treballs`);
    if (!res.ok) throw new Error();
    const files = (await res.json()).filter(f => f.name.endsWith('.md'));

    if (files.length === 0) {
      grid.innerHTML = '<p class="obra-card-ph">Encara no hi ha treballs publicats.</p>';
      return;
    }

    const texts = await Promise.all(files.map(f => fetch(`${f.download_url}?sha=${f.sha}`).then(r => r.text())));
    const treballs = texts.map(parseFrontmatter).filter(t => t.title);

    grid.innerHTML = '';
    treballs.forEach(t => {
      const card = buildCard(t);
      grid.appendChild(card);
      allCards.push(card);
    });
  } catch (e) {
    grid.innerHTML = '<p class="obra-card-ph">No s\'han pogut carregar els treballs.</p>';
  }
})();
