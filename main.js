// Reveal on scroll
const obs = new IntersectionObserver(
  es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }),
  { threshold: 0.1 }
);
document.querySelectorAll('.rv').forEach(el => obs.observe(el));

// Contact form — validation rules
const RULES = {
  nom:      { test: v => v.trim().length >= 2,                                          msg: 'El nom ha de tenir almenys 2 caràcters' },
  telefon:  { test: v => !v.trim() || /^[6789]\d{8}$/.test(v.replace(/[\s\-]/g, '')), msg: 'Format no vàlid (ex: 689 242 968)' },
  email:    { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),                 msg: 'Correu electrònic no vàlid' },
  missatge: { test: v => v.trim().length >= 10,                                         msg: 'El missatge ha de tenir almenys 10 caràcters' }
};

function getField(name) {
  return document.querySelector(`[name="${name}"]`);
}

function showError(name, msg) {
  const el = getField(name);
  if (!el) return;
  el.classList.add('invalid');
  let span = el.parentElement.querySelector('.fg-err');
  if (!span) { span = document.createElement('span'); span.className = 'fg-err'; el.after(span); }
  span.textContent = msg;
}

function clearError(name) {
  const el = getField(name);
  if (!el) return;
  el.classList.remove('invalid');
  const span = el.parentElement.querySelector('.fg-err');
  if (span) span.textContent = '';
}

function validateField(name) {
  const el = getField(name);
  if (!el || !RULES[name]) return true;
  const ok = RULES[name].test(el.value);
  ok ? clearError(name) : showError(name, RULES[name].msg);
  return ok;
}

function validateAll() {
  return Object.keys(RULES).map(validateField).every(Boolean);
}

// Validate on blur (only if the field has been touched)
document.addEventListener('DOMContentLoaded', () => {
  Object.keys(RULES).forEach(name => {
    const el = getField(name);
    if (el) el.addEventListener('blur', () => { if (el.value.trim()) validateField(name); });
  });
});

function handleSend(e) {
  e.preventDefault();
  if (!validateAll()) return;

  const form = e.target;
  const btn = document.getElementById('fsend');
  btn.disabled = true;
  btn.textContent = 'Enviant...';

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(new FormData(form)).toString()
  })
    .then(() => {
      document.getElementById('fok').style.display = 'block';
      btn.style.display = 'none';
      form.reset();
      Object.keys(RULES).forEach(clearError);
    })
    .catch(() => {
      document.getElementById('ferr').style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Enviar missatge';
    });
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
    const cat = data.categoria ? `?cat=${encodeURIComponent(data.categoria)}` : '';
    card.addEventListener('click', () => { window.location.href = `treballs.html${cat}`; });
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

    const texts = await Promise.all(files.map(f => fetch(`${f.download_url}?sha=${f.sha}`).then(r => r.text())));
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
