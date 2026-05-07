const html   = document.documentElement;
const toggle = document.getElementById('themeToggle');

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

toggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ---- NAVBAR: transparent → solid on scroll ---- */
const navEl = document.querySelector('nav');
window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ---- ROLE CYCLING ---- */
const roles = [
  'Full-Stack Developer',
  'Mobile App Developer',
  'UI/UX Designer',
  'Game Developer',
  'Document Specialist',
  'Admin Support'
];

let currentRole  = 0;
let isAnimating  = false;
let autoTimer    = null;

const roleEl  = document.getElementById('roleText');
const dotsEl  = document.getElementById('roleDots');

// Build dot indicators
roles.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'role-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => goToRole(i));
  dotsEl.appendChild(dot);
});

function updateDots(idx) {
  dotsEl.querySelectorAll('.role-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

function goToRole(next) {
  if (isAnimating || next === currentRole) return;
  isAnimating = true;
  clearTimeout(autoTimer);

  // Exit current role upward
  roleEl.classList.remove('role-enter');
  roleEl.classList.add('role-exit');

  roleEl.addEventListener('animationend', function onExit() {
    roleEl.removeEventListener('animationend', onExit);

    // Swap text, enter new role from below
    currentRole = next;
    roleEl.textContent = roles[currentRole];
    roleEl.classList.remove('role-exit');
    roleEl.classList.add('role-enter');
    updateDots(currentRole);

    roleEl.addEventListener('animationend', function onEnter() {
      roleEl.removeEventListener('animationend', onEnter);
      roleEl.classList.remove('role-enter');
      isAnimating = false;
      scheduleNext();
    }, { once: true });
  }, { once: true });
}

function nextRole() {
  goToRole((currentRole + 1) % roles.length);
}

function scheduleNext() {
  autoTimer = setTimeout(nextRole, 2800);
}

// Start auto-rotation only — no manual scroll trigger
scheduleNext();

/* ---- CAROUSEL ---- */
let projectData = []; // Simpan data di sini agar bisa diakses saat kartu diklik

async function loadProjects() {
  let data = [];
  try {
    const response = await fetch('../projects/projects.json');
    data = await response.json();
  } catch(e) {
    // Use fallback demo data if json not available
    data = [];
  }
  projectData = data;

  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const emojis = ['🌐','📱','🎨','🎮','📄','⚙️','🔐','🛡️','💡','🔬'];

  if (projectData.length === 0) {
    // Placeholder cards when no projects loaded
    const placeholders = [
      { id:'p1', title:'SAFEST Mobile App', shortDesc:'A safety app for women with secure back-end.', tags:['Flutter','Kotlin','AWS'], category:'Mobile App', emoji:'🛡️', longDesc:'Mobile safety application for women.', github:'https://github.com/alizzati/SAFEST', demo:'#', images:[] },
      { id:'p2', title:'Image Encryption Site', shortDesc:'Web app for encrypting & decrypting images.', tags:['PHP','JavaScript','Cryptography'], category:'Web App', emoji:'🔐', longDesc:'Image encryption/decryption website.', github:'https://github.com/alizzati/cryptography', demo:'#', images:[] },
      { id:'p3', title:'TemuUsaha UI/UX', shortDesc:'AI-driven platform for micro-entrepreneurs.', tags:['Figma','UI/UX','AI'], category:'Design', emoji:'🎨', longDesc:'End-to-end UI/UX design for GEMASTIK competition.', github:'#', demo:'https://s.id/FigmaTemu-usaha', images:[] },
      { id:'p4', title:'Text Summarizer R', shortDesc:'Comparing LexRank and LSA algorithms in R.', tags:['R','NLP','RStudio'], category:'Research', emoji:'🔬', longDesc:'Research comparing extractive summarisation algorithms.', github:'https://github.com/alizzati', demo:'#', images:[] },
      { id:'p5', title:'Coming Soon', shortDesc:'More projects will be added here.', tags:['Stay Tuned'], category:'Project', emoji:'💡', longDesc:'', github:'#', demo:'#', images:[] },
    ];
    projectData = placeholders;
  }

  track.innerHTML = projectData.map((proj, i) => `
    <div class="card" onclick="showProjectDetail('${proj.id}')">
      <div class="card-category">${proj.category || 'Project'}</div>
      <div class="card-img">
        ${proj.thumbnail
          ? `<img src="${proj.thumbnail}" alt="${proj.title}" onerror="this.parentElement.innerHTML='<div class=\\'card-img-placeholder\\'>${proj.emoji || emojis[i % emojis.length]}</div>'">`
          : `<div class="card-img-placeholder">${proj.emoji || emojis[i % emojis.length]}</div>`
        }
      </div>
      <div class="card-content">
        <h3>${proj.title}</h3>
        <p>${proj.shortDesc}</p>
        <div class="tags">
          ${proj.tags.map(tag => `<span>${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  initCarousel();
}

function showProjectDetail(id) {
  const proj = projectData.find(p => p.id === id);
  if (!proj) return;
  const detailBody = document.getElementById('detailBody');
  
  detailBody.innerHTML = `
    <h1 style="font-family:'Cormorant Garamond',serif; font-size: 2.5rem; font-weight:300; line-height:1.2;">${proj.title}</h1>
    <div style="margin: 12px 0 20px;">
       ${proj.tags.map(t => `<span class="tags" style="display:inline-block; margin:3px;"><span>${t}</span></span>`).join('')}
    </div>
    
    ${proj.images && proj.images.length > 0 ? `
    <div class="detail-gallery">
      ${proj.images.map(img => `<img src="${img}" alt="Screenshot">`).join('')}
    </div>` : ''}

    ${proj.longDesc ? `<p style="line-height: 1.8; color: var(--text-sec); font-size: 1rem; margin-top:16px;">${proj.longDesc}</p>` : ''}
    
    <div style="margin-top: 32px; display: flex; gap: 15px; flex-wrap:wrap;">
      ${proj.github && proj.github !== '#' ? `<a href="${proj.github}" target="_blank" class="btn-primary">View GitHub</a>` : ''}
      ${proj.figma && proj.figma !== '#' ? `<a href="${proj.figma}" target="_blank" class="btn-primary" style="background:var(--accent2,#a259ff)">View Figma</a>` : ''}
      ${proj.demo && proj.demo !== '#' ? `<a href="${proj.demo}" target="_blank" class="btn-outline">Live Demo</a>` : ''}
    </div>
  `;

  document.getElementById('projectDetail').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Event untuk menutup
document.getElementById('closeDetail').addEventListener('click', () => {
  document.getElementById('projectDetail').style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Ganti pemanggilan IIFE Carousel lama dengan ini:
loadProjects();
/* ---- CAROUSEL ---- */
function initCarousel() {
  const track    = document.getElementById('carouselTrack');
  const viewport = document.getElementById('carouselViewport');
  const dotsWrap = document.getElementById('carouselDots');
  if (!track || !viewport) return;

  const DURATION  = 3200;
  const GAP       = 19;
  // 1 card on mobile (<=768px), 3 on desktop
  const VISIBLE   = window.innerWidth <= 768 ? 1 : 3;
  const SWIPE_MIN = 40;

  /* ── Build clones ─────────────────────────────────── */
  const orig  = Array.from(track.children);
  const total = orig.length;
  const EXTRA = Math.max(total, Math.ceil(VISIBLE / 2) + 2);

  for (let i = 0; i < EXTRA; i++) track.appendChild(orig[i % total].cloneNode(true));
  for (let i = 0; i < EXTRA; i++) track.prepend(orig[(total - 1 - (i % total))].cloneNode(true));

  let active  = EXTRA;   
  let locked  = false;
  let paused  = false;
  let autoH   = null;
  let dragDelta  = 0;
  let mouseDelta = 0;

  /* ── Sizing ───────────────────────────────────────── */
  function cw() { return (viewport.offsetWidth - GAP * (VISIBLE - 1)) / VISIBLE; }
  function step() { return cw() + GAP; }

  function setWidths() {
    const w = cw();
    Array.from(track.children).forEach(c => { c.style.flex = `0 0 ${w}px`; });
  }

  /* ── Position ─────────────────────────────────────── */
  function calcX(idx) {
    return (viewport.offsetWidth - cw()) / 2 - idx * step();
  }

  function move(idx, animate) {
    track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.4,0,0.2,1)' : 'none';
    track.style.transform  = `translateX(${calcX(idx)}px)`;
    refreshClasses();
    refreshDots();
  }

  function refreshClasses() {
    // Hitung "Index Asli" (0 sampai total-1)
    const realActiveIndex = ((active - EXTRA) % total + total) % total;

    Array.from(track.children).forEach((c, i) => {
      // Hitung "Index Asli" untuk setiap kartu di dalam track
      const realCardIndex = ((i - EXTRA) % total + total) % total;
      
      // Hitung jarak antara kartu ini dengan kartu yang sedang aktif
      // Kita pakai Math.min untuk mencari jarak terpendek dalam lingkaran looping
      const diff = Math.min(
        Math.abs(realCardIndex - realActiveIndex),
        Math.abs(realCardIndex - realActiveIndex + total),
        Math.abs(realCardIndex - realActiveIndex - total)
      );

      // Berikan class berdasarkan jarak index aslinya
      // Ini memastikan kartu klon di ujung sudah membesar sebelum kita teleport
      c.classList.toggle('is-active', diff === 0);
      c.classList.toggle('is-near',   diff === 1);
    });
  }

  /* ── Dots ─────────────────────────────────────────── */
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'carousel-dot';
    d.addEventListener('click', () => { goTo(EXTRA + i); resetAuto(); });
    dotsWrap.appendChild(d);
  }

  function refreshDots() {
    const real = ((active - EXTRA) % total + total) % total;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === real);
    });
  }

  /* ── Slide & Sync ─────────────────────────────────── */
  function goTo(idx) {
    active = idx;
    move(active, true);
  }

  track.addEventListener('transitionend', () => {
    locked = false;
    let changed = false;

    if (active < EXTRA) { 
      active += total; 
      changed = true; 
    }
    else if (active >= EXTRA + total) { 
      active -= total; 
      changed = true; 
    }

    if (changed) {
      track.style.transition = 'none';
      track.style.transform = `translateX(${calcX(active)}px)`;
      
      refreshClasses();
    }
  });

  // Helper untuk mencari index card terdekat saat scroll manual dilepas
  function getClosestIndex(currentTx) {
    const offset = (viewport.offsetWidth - cw()) / 2;
    const floatIndex = (offset - currentTx) / step();
    return Math.round(floatIndex);
  }

  /* ── Click card → center ──────────────────────────── */
  track.addEventListener('click', e => {
    if (Math.abs(dragDelta) > 5 || Math.abs(mouseDelta) > 5) return;
    const card = e.target.closest('.card');
    if (!card) return;
    const idx = Array.from(track.children).indexOf(card);
    if (idx === active) return;
    e.preventDefault();
    goTo(idx);
    resetAuto();
  });

  /* ── Auto ─────────────────────────────────────────── */
  function startAuto() {
    clearInterval(autoH);
    autoH = setInterval(() => { if (!paused && !locked) goTo(active + 1); }, DURATION);
  }
  function resetAuto() { clearInterval(autoH); startAuto(); }

  viewport.addEventListener('mouseenter', () => { paused = true;  });
  viewport.addEventListener('mouseleave', () => { paused = false; });

  /* ── Touch swipe ──────────────────────────────────── */
  let tx0 = 0, ty0 = 0, tDrag = false;
  viewport.addEventListener('touchstart', e => {
    tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY;
    dragDelta = 0; tDrag = true;
    track.style.transition = 'none';
  }, { passive: true });
  
  viewport.addEventListener('touchmove', e => {
    if (!tDrag) return;
    const dx = e.touches[0].clientX - tx0;
    const dy = e.touches[0].clientY - ty0;
    if (!dragDelta && Math.abs(dy) > Math.abs(dx)) { tDrag = false; return; }
    dragDelta = dx;
    track.style.transform = `translateX(${calcX(active) + dx}px)`;
  }, { passive: true });
  
  viewport.addEventListener('touchend', () => {
    if (!tDrag) return; tDrag = false;
    // Cari index persis yang terdekat dari posisi jari dilepas
    const currentTx = calcX(active) + dragDelta;
    goTo(getClosestIndex(currentTx)); 
    resetAuto();
    dragDelta = 0;
  });

  /* ── Mouse drag ───────────────────────────────────── */
  let mDown = false, mx0 = 0;
  viewport.addEventListener('mousedown', e => {
    mDown = true; mx0 = e.clientX; mouseDelta = 0;
    track.style.transition = 'none'; e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!mDown) return;
    mouseDelta = e.clientX - mx0;
    track.style.transform = `translateX(${calcX(active) + mouseDelta}px)`;
  });
  window.addEventListener('mouseup', () => {
    if (!mDown) return;
    mDown = false;
    // Cari index persis yang terdekat dari posisi kursor dilepas
    const currentTx = calcX(active) + mouseDelta;
    goTo(getClosestIndex(currentTx));
    resetAuto();
    mouseDelta = 0;
  });

  /* ── Init ─────────────────────────────────────────── */
  setWidths();
  move(active, false);
  startAuto();
  window.addEventListener('resize', () => { setWidths(); move(active, false); });
};
/* ---- SCROLL REVEAL ---- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

function initImageCollect() {
  const box = document.getElementById('aboutCollect');
  if (!box) return;

  box.innerHTML = '';

  // Menggunakan 13 foto agar mencapai baris ke-5
  const IMAGES = Array.from({length: 12}, (_, i) => `assets/img/collect/photo${i+1}.jpg`);

  IMAGES.forEach((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'collect-img';
    img.onclick = () => openPhotoModal(src);
    box.appendChild(img);
  });

  // Tambahkan Foto Profil
  const selfImg = document.createElement('img');
  selfImg.src = 'assets/img/izzati.png';
  selfImg.className = 'collect-self-main';
  // Optional: Klik foto profil untuk sesuatu atau biarkan saja
  box.appendChild(selfImg);
}

/* Modal tetep sama seperti sebelumnya */
function openPhotoModal(src) {
  const modal = document.createElement('div');
  modal.className = 'photo-modal';
  modal.innerHTML = `<img src="${src}" alt="Full View">`;
  modal.onclick = () => modal.remove();
  document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', initImageCollect);