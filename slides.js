// ── RENDERING ─────────────────────────────────────────────────────────────────

function renderNav() {
  const container = document.getElementById('nav-sections');
  document.getElementById('tot').textContent = SLIDES.length;

  NAV_SECTIONS.forEach(section => {
    const div = document.createElement('div');
    div.className = 'nav-section';

    if (section.label) {
      const label = document.createElement('div');
      label.className = 'nav-section-label';
      label.textContent = section.label;
      div.appendChild(label);
    }

    section.indices.forEach(i => {
      const slide = SLIDES[i];
      const item = document.createElement('div');
      item.className = 'nav-item';
      item.dataset.slide = i;
      item.innerHTML = `
        <span class="nav-dot"></span>
        <span class="nav-num">${slide.num}</span>
        <span>${slide.label}</span>
      `;
      item.addEventListener('click', () => goTo(i));
      div.appendChild(item);
    });

    container.appendChild(div);
  });
}

function renderSlides() {
  const wrap = document.getElementById('slides-wrap');

  SLIDES.forEach((slide, i) => {
    const div = document.createElement('div');
    div.className = 'slide';
    div.id = 's' + i;
    div.innerHTML = slide.html;
    wrap.appendChild(div);
  });
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────

let current = 0;

// goTo is intentionally global — inline onclick handlers in slides-data.js call it directly.
function goTo(n) {
  if (n < 0 || n >= SLIDES.length) return;

  document.querySelector('.slide.active')?.classList.remove('active');
  document.querySelector('.nav-item.active')?.classList.remove('active');

  current = n;

  document.getElementById('s' + n).classList.add('active');
  document.querySelector(`.nav-item[data-slide="${n}"]`)?.classList.add('active');
  document.getElementById('cur').textContent = n + 1;
  document.getElementById('progress-fill').style.width = ((n + 1) / SLIDES.length * 100) + '%';
  document.getElementById('btn-prev').disabled = n === 0;
  document.getElementById('btn-next').disabled = n === SLIDES.length - 1;
}

function navigate(dir) { goTo(current + dir); }

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────

document.getElementById('btn-prev').addEventListener('click', () => navigate(-1));
document.getElementById('btn-next').addEventListener('click', () => navigate(1));

document.addEventListener('keydown', e => {
  if      (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1);
  else if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigate(-1);
  else if (e.key === 'Escape')                               goTo(1);
});

// ── INIT ──────────────────────────────────────────────────────────────────────

renderNav();
renderSlides();
goTo(0);
