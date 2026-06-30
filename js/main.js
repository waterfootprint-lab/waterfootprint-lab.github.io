/* =========================================================================
   Water Footprint Lab — site behavior & data rendering
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

/* ---- PI block (team page) ---- */
async function renderPI(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  const data = await loadJSON('data/team.json');
  if (!data) return;
  const pi = data.pi;
  el.innerHTML = `
    <div class="pi-photo">
      <img src="${pi.photo}" alt="${esc(pi.name)}" loading="lazy">
    </div>
    <div>
      <span class="section-label">Principal Investigator</span>
      <h2 style="margin-bottom:0.3rem;">${esc(pi.name)}</h2>
      <p style="color:#9E1B32;font-weight:bold;margin-bottom:0.8rem;">${esc(pi.title)}</p>
      <p>${pi.bio}</p>
      ${pi.bio2 ? `<p>${pi.bio2}</p>` : ''}
      <ul class="pi-creds">
        ${pi.credentials.map(c => `<li>${esc(c)}</li>`).join('')}
      </ul>
      <div class="pi-links">
        <a href="${pi.links.profile}" target="_blank" rel="noopener">University Profile</a>
        <a href="mailto:${pi.links.email}">Email</a>
        <a href="${pi.links.scholar}" target="_blank" rel="noopener">Google Scholar</a>
        ${pi.links.linkedin ? `<a href="${pi.links.linkedin}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
      </div>
    </div>`;
}

/* ---- Student grid + click-to-expand modal (team page) ---- */
let _studentData = [];

const MAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 6 8 7 8-7"/></svg>';
const SCHOLAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11.5V17c0 1 2.7 3 6 3s6-2 6-3v-5.5"/></svg>';
const LINKEDIN_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4.98 3.5C4.98 4.88 3.94 6 2.5 6S0 4.88 0 3.5 1.04 1 2.48 1s2.5 1.12 2.5 2.5zM.5 8.25h4V23h-4V8.25zM8.5 8.25h3.83v2.01h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V23h-4v-7.04c0-1.68-.03-3.84-2.34-3.84-2.34 0-2.7 1.83-2.7 3.72V23h-4V8.25z"/></svg>';
const INFO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';

async function renderStudents(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  const data = await loadJSON('data/team.json');
  if (!data) return;
  _studentData = data.students;

  el.innerHTML = _studentData.map((s, i) => `
    <div class="team-card" data-idx="${i}">
      <div class="team-card-photo">
        <img src="${s.photo}" alt="${esc(s.name)}" loading="lazy">
      </div>
      <div class="team-card-name">${esc(s.name)}</div>
      <div class="team-card-role">${esc(s.role)} (${esc(s.status || 'Ongoing')})</div>
      <div class="team-card-icons">
        <span title="Research focus" class="js-info">${INFO_ICON}</span>
        ${s.links?.email ? `<a href="mailto:${s.links.email}" title="Email" onclick="event.stopPropagation()">${MAIL_ICON}</a>` : ''}
        ${s.links?.scholar ? `<a href="${s.links.scholar}" target="_blank" rel="noopener" title="Google Scholar" onclick="event.stopPropagation()">${SCHOLAR_ICON}</a>` : ''}
        ${s.links?.linkedin ? `<a href="${s.links.linkedin}" target="_blank" rel="noopener" title="LinkedIn" onclick="event.stopPropagation()">${LINKEDIN_ICON}</a>` : ''}
      </div>
    </div>`).join('');

  el.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('click', () => openStudentModal(_studentData[card.dataset.idx]));
  });

  ensureModal();
}

function ensureModal() {
  if (document.getElementById('team-modal')) return;
  const overlay = document.createElement('div');
  overlay.id = 'team-modal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" aria-label="Close">&times;</button>
      <div class="modal-photo"><img id="modal-photo-img" src="" alt=""></div>
      <h3 id="modal-name"></h3>
      <div class="modal-role" id="modal-role"></div>
      <p id="modal-focus"></p>
      <div class="modal-links" id="modal-links"></div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeStudentModal(); });
  overlay.querySelector('.modal-close').addEventListener('click', closeStudentModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeStudentModal(); });
}

function openStudentModal(s) {
  const overlay = document.getElementById('team-modal');
  overlay.querySelector('#modal-photo-img').src = s.photo;
  overlay.querySelector('#modal-photo-img').alt = s.name;
  overlay.querySelector('#modal-name').textContent = s.name;
  overlay.querySelector('#modal-role').textContent = `${s.role} (${s.status || 'Ongoing'})`;
  overlay.querySelector('#modal-focus').textContent = s.focus;
  const linksEl = overlay.querySelector('#modal-links');
  linksEl.innerHTML = `
    ${s.links?.email ? `<a href="mailto:${s.links.email}">Email</a>` : ''}
    ${s.links?.scholar ? `<a href="${s.links.scholar}" target="_blank" rel="noopener">Google Scholar</a>` : ''}
    ${s.links?.linkedin ? `<a href="${s.links.linkedin}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
  `;
  overlay.classList.add('open');
}

function closeStudentModal() {
  const overlay = document.getElementById('team-modal');
  if (overlay) overlay.classList.remove('open');
}

/* ---- Projects ---- */
async function renderProjects(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  const data = await loadJSON('data/projects.json');
  if (!data || data.length === 0) { el.innerHTML = '<p class="state-msg">No projects listed yet.</p>'; return; }
  el.innerHTML = data.map(p => `
    <div class="project-item">
      <h3>${p.link && p.link !== '#' ? `<a href="${p.link}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</h3>
      <p>${esc(p.summary)}</p>
      <div class="project-tags">${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    </div>`).join('');
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