/* =========================================================================
   Water Security Lab — site behavior & data rendering
   Edit content in /data/*.json — no HTML changes needed for routine updates
   ========================================================================= */

/* ---------- Nav ---------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const t = a.getAttribute('href');
    if (t === here || (here === '' && t === 'index.html')) a.classList.add('active');
  });
}

/* ---------- Helpers ---------- */
async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch(e) {
    console.error('Could not load', path, e);
    return null;
  }
}

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function esc(str = '') {
  return String(str).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/* =========================================================================
   RENDERERS
   ========================================================================= */

/* ---- Team page: current researchers + alumni ---- */
const MAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 6 8 7 8-7"/></svg>';
const SCHOLAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11.5V17c0 1 2.7 3 6 3s6-2 6-3v-5.5"/></svg>';
const LINKEDIN_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4.98 3.5C4.98 4.88 3.94 6 2.5 6S0 4.88 0 3.5 1.04 1 2.48 1s2.5 1.12 2.5 2.5zM.5 8.25h4V23h-4V8.25zM8.5 8.25h3.83v2.01h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V23h-4v-7.04c0-1.68-.03-3.84-2.34-3.84-2.34 0-2.7 1.83-2.7 3.72V23h-4V8.25z"/></svg>';
const ORCID_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zM8.16 5.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm-.93 3.75h1.86V18.4H7.23V9.35zm4.03 0h4.98c4.75 0 6.45 3.5 6.45 4.52 0 2.4-1.87 4.53-6.45 4.53h-4.98V9.35zm1.87 1.6v5.86h2.8c2.93 0 4.4-1.23 4.4-2.93s-1.47-2.93-4.4-2.93h-2.8z"/></svg>';
const WEBSITE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
const GITHUB_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/></svg>';

function memberIcons(l = {}) {
  return `
      ${l.email ? `<a href="mailto:${l.email}" title="Email">${MAIL_ICON}</a>` : ''}
      ${l.scholar ? `<a href="${l.scholar}" target="_blank" rel="noopener" title="Google Scholar">${SCHOLAR_ICON}</a>` : ''}
      ${l.linkedin ? `<a href="${l.linkedin}" target="_blank" rel="noopener" title="LinkedIn">${LINKEDIN_ICON}</a>` : ''}
      ${l.github ? `<a href="${l.github}" target="_blank" rel="noopener" title="GitHub">${GITHUB_ICON}</a>` : ''}
      ${l.orcid ? `<a href="${l.orcid}" target="_blank" rel="noopener" title="ORCID">${ORCID_ICON}</a>` : ''}
      ${l.website ? `<a href="${l.website}" target="_blank" rel="noopener" title="Personal website">${WEBSITE_ICON}</a>` : ''}`;
}

async function renderTeam(currentSel, alumniSel) {
  const data = await loadJSON('data/team.json');
  if (!data) return;
  const students = data.students || [];

  const curEl = document.querySelector(currentSel);
  if (curEl) {
    const current = students.filter(s => s.status !== 'alumni');
    curEl.innerHTML = current.length ? current.map((s, i) => `
    <div class="team-card">
      <div class="team-card-photo"><img src="${s.photo}" alt="${esc(s.name)}" loading="lazy"></div>
      <div class="team-card-name">${esc(s.name)}</div>
      <div class="team-card-role">Ph.D. Student | ${esc(s.start_year)}–Present</div>
      <button class="interests-toggle" type="button" aria-expanded="false" aria-controls="interests-${i}">
        Research Interests <span class="caret" aria-hidden="true">▾</span>
      </button>
      <div class="interests-panel" id="interests-${i}" hidden>
        <p>${esc(s.focus)}</p>
      </div>
      <div class="team-card-icons">${memberIcons(s.links)}</div>
    </div>`).join('') : '<p class="state-msg">No current researchers listed.</p>';

    curEl.querySelectorAll('.interests-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });
    });
  }

  const alEl = document.querySelector(alumniSel);
  if (alEl) {
    const alumni = students.filter(s => s.status === 'alumni')
      .sort((a, b) => (b.completed || 0) - (a.completed || 0));
    alEl.innerHTML = alumni.length ? alumni.map(s => `
    <div class="team-card alumni-card">
      <div class="team-card-photo"><img src="${s.photo}" alt="${esc(s.name)}" loading="lazy"></div>
      <div class="team-card-name">${esc(s.name)}, Ph.D.</div>
      <div class="team-card-role">Ph.D. completed: ${esc(s.completed)}</div>
      ${s.research_area ? `<p class="alumni-area">${esc(s.research_area)}</p>` : ''}
      ${s.position ? `<p class="alumni-position"><strong>Current position:</strong> ${esc(s.position)}</p>` : ''}
      <div class="team-card-icons">${memberIcons(s.links)}</div>
    </div>`).join('') : '<p class="state-msg">No alumni listed yet.</p>';
  }
}

/* ---- Projects ---- */
async function renderProjects(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  const data = await loadJSON('data/projects.json');
  if (!data || data.length === 0) { el.innerHTML = '<p class="state-msg">No projects listed yet.</p>'; return; }
  el.innerHTML = data.map(p => {
    const meta = [
      p.funding ? `<strong>Funding:</strong> ${esc(p.funding)}` : '',
      p.period  ? `<strong>Period:</strong> ${esc(p.period)}` : ''
    ].filter(Boolean).join(' &nbsp;|&nbsp; ');
    const pubs = (p.publications || []).map(x => `
        <li>${esc(x.cite)} | ${x.link ? `<a href="${x.link}" target="_blank" rel="noopener">${esc(x.title)}</a>` : esc(x.title)} | <em>${esc(x.venue)}</em></li>`).join('');
    return `
    <div class="project-item">
      <h3>${esc(p.title)}</h3>
      ${meta ? `<div class="project-meta">${meta}</div>` : ''}
      ${p.status ? `<div class="project-meta"><strong>Status:</strong> ${esc(p.status)}</div>` : ''}
      <p>${esc(p.summary)}</p>
      ${p.people && p.people.length ? `<div class="project-meta"><strong>People:</strong> ${p.people.map(esc).join('; ')}</div>` : ''}
      ${pubs ? `<div class="project-pubs"><strong>Selected publications</strong><ul>${pubs}</ul></div>` : ''}
      ${p.link ? `<a class="project-more" href="${p.link}" target="_blank" rel="noopener">Learn more →</a>` : ''}
    </div>`;
  }).join('');
}

/* ---- News ---- */
async function renderNews(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  const data = await loadJSON('data/news.json');
  if (!data || data.length === 0) { el.innerHTML = '<p class="state-msg">No announcements yet.</p>'; return; }
  const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = sorted.map(n => `
    <div class="news-item">
      <div class="news-date">${fmtDate(n.date)}</div>
      <h3>${n.link ? `<a href="${n.link}" target="_blank" rel="noopener">${esc(n.title)}</a>` : esc(n.title)}</h3>
      <p>${esc(n.body)}</p>
      ${n.tag ? `<span class="news-tag">${esc(n.tag)}</span>` : ''}
    </div>`).join('');
}

/* ---- Publications ---- */
async function renderPublications(sel, filterSel) {
  const el = document.querySelector(sel);
  if (!el) return;
  const data = await loadJSON('data/publications.json');
  if (!data || data.length === 0) { el.innerHTML = '<p class="state-msg">No publications yet.</p>'; return; }
  const sorted = [...data].sort((a, b) => b.year - a.year);

  function draw(list) {
    el.innerHTML = list.length
      ? list.map(p => `
          <div class="pub-item">
            <div class="pub-year">${p.year}</div>
            <div>
              <span class="pub-title">${esc(p.title)}</span>
              <div class="pub-meta">${esc(p.authors)} — <em>${esc(p.venue)}</em></div>
              ${p.link && p.link !== '#' ? `<a class="pub-link" href="${p.link}" target="_blank" rel="noopener">View paper →</a>` : ''}
            </div>
          </div>`).join('')
      : '<p class="state-msg">No publications match this filter.</p>';
  }
  draw(sorted);

  const filterEl = filterSel ? document.querySelector(filterSel) : null;
  if (filterEl) {
    const years = [...new Set(sorted.map(p => p.year))].sort((a, b) => b - a);
    filterEl.innerHTML = ['All', ...years].map((y, i) =>
      `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-year="${y}">${y}</button>`).join('');
    filterEl.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const y = btn.dataset.year;
      draw(y === 'All' ? sorted : sorted.filter(p => String(p.year) === y));
    });
  }
}

/* ---- Positions ---- */
async function renderPositions(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  const data = await loadJSON('data/positions.json');
  if (!data || data.length === 0) { el.innerHTML = '<p class="state-msg">No openings listed right now.</p>'; return; }
  el.innerHTML = data.map(p => `
    <div class="position-item">
      <div class="position-head">
        <h3>${esc(p.title)}</h3>
        <span class="status-badge ${p.status}">${p.status === 'open' ? 'Open' : 'Closed'}</span>
      </div>
      <div class="position-meta">${esc(p.type)}${p.deadline ? ' &nbsp;·&nbsp; Review: ' + esc(p.deadline) : ''}</div>
      <p>${esc(p.description)}</p>
      ${p.status === 'open' && p.apply_link ? `<a class="btn-blue btn" href="${p.apply_link}">Apply / Inquire</a>` : ''}
    </div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => { initNav(); });

/* ---- Research Highlights gallery (home page) ---- */
let _highlightData = [];

async function renderHighlights(sel, group) {
  const el = document.querySelector(sel);
  if (!el) return;
  const data = await loadJSON('data/highlights.json');
  if (!data || data.length === 0) { el.innerHTML = '<p class="state-msg">No highlights yet.</p>'; return; }

  const filtered = group ? data.filter(h => h.group === group) : data;
  const startIdx = group ? data.indexOf(filtered[0]) : 0;

  el.innerHTML = filtered.map((h, i) => `
    <div class="highlight-card" data-idx="${startIdx + i}">
      <div class="highlight-img-wrap">
        <img src="${h.image}" alt="${esc(h.alt || h.name)}" loading="lazy">
      </div>
      <div class="highlight-body">
        <div class="highlight-citation">${h.citation}</div>
      </div>
    </div>`).join('');

  el.querySelectorAll('.highlight-card').forEach(card => {
    card.addEventListener('click', () => openLightbox(data[card.dataset.idx]));
  });

  _highlightData = data;
  ensureLightbox();
  wireGalleryArrows(el);
}

function wireGalleryArrows(scrollEl) {
  const wrap = scrollEl.closest('.highlights-scroll-wrap');
  if (!wrap) return;
  const prev = wrap.querySelector('.gallery-arrow.prev');
  const next = wrap.querySelector('.gallery-arrow.next');
  const scrollAmount = () => Math.min(360, scrollEl.clientWidth * 0.8);
  if (prev) prev.addEventListener('click', () => scrollEl.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  if (next) next.addEventListener('click', () => scrollEl.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
}

function ensureLightbox() {
  if (document.getElementById('fig-lightbox')) return;
  const overlay = document.createElement('div');
  overlay.id = 'fig-lightbox';
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-box">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <img id="lightbox-img" src="" alt="">
      <div class="lightbox-info">
        <div class="highlight-citation" id="lightbox-citation"></div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
  overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

function openLightbox(h) {
  const overlay = document.getElementById('fig-lightbox');
  overlay.querySelector('#lightbox-img').src = h.image;
  overlay.querySelector('#lightbox-img').alt = h.alt || h.name;
  overlay.querySelector('#lightbox-citation').innerHTML =
    h.link ? `${h.citation} — <a href="${h.link}" target="_blank" rel="noopener">View paper →</a>` : h.citation;
  overlay.classList.add('open');
}

function closeLightbox() {
  const overlay = document.getElementById('fig-lightbox');
  if (overlay) overlay.classList.remove('open');
}