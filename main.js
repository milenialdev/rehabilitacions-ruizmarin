// Reveal on scroll
const obs = new IntersectionObserver(
  es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }),
  { threshold: 0.1 }
);
document.querySelectorAll('.rv').forEach(el => obs.observe(el));

// Contact form
function handleSend(e) {
  e.preventDefault();
  const btn = document.getElementById('fsend');
  btn.disabled = true;
  btn.textContent = 'Enviant...';
  setTimeout(() => {
    document.getElementById('fok').style.display = 'block';
    btn.style.display = 'none';
    e.target.reset();
  }, 900);
}

// Netlify Identity → redirect to /admin after login
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        document.location.href = '/admin/';
      });
    }
  });
}

// Load treballs from GitHub API
(async function () {
  const REPO = 'milenialdev/rehabilitacions-ruizmarin';
  const grid = document.getElementById('treballs-grid');
  const PH_SVG = `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

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
    card.className = 't-card';
    if (data.foto) {
      card.innerHTML = `<img src="${data.foto}" alt="${data.title || ''}" style="width:100%;height:100%;object-fit:cover;display:block">`;
    } else {
      card.innerHTML = `<div class="t-ph"><div class="t-ph-icon">${PH_SVG}</div><p>${data.title || 'Treball'}</p></div>`;
    }
    const badge = `${data.categoria || ''}${data.ubicacio ? ' · ' + data.ubicacio : ''}`;
    if (badge) card.innerHTML += `<div class="t-badge">${badge}</div>`;
    return card;
  }

  function buildPlaceholder() {
    const card = document.createElement('div');
    card.className = 't-card';
    card.innerHTML = `<div class="t-ph"><div class="t-ph-icon">${PH_SVG}</div><p>Properament...</p></div>`;
    return card;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/_treballs`);
    if (!res.ok) return;
    const files = (await res.json()).filter(f => f.name.endsWith('.md'));
    if (files.length === 0) return;

    const texts = await Promise.all(files.map(f => fetch(f.download_url).then(r => r.text())));
    const treballs = texts.map(parseFrontmatter).filter(t => t.title);
    if (treballs.length === 0) return;

    grid.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      grid.appendChild(i < treballs.length ? buildCard(treballs[i]) : buildPlaceholder());
    }
  } catch (e) {
    console.warn("No s'han pogut carregar els treballs:", e);
  }
})();
