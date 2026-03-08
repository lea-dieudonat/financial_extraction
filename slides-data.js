// ── NAV STRUCTURE ─────────────────────────────────────────────────────────────
// Defines sidebar sections and which slide indices belong to each one.

const NAV_SECTIONS = [
  { label: null,           indices: [0, 1] },
  { label: 'Background',   indices: [2, 3] },
  { label: 'Pipeline',     indices: [4, 5] },
  { label: 'Deep Dives',   indices: [6, 7, 8, 9, 10, 11] },
  { label: 'Results',      indices: [12, 13] },
  { label: 'Conclusion',   indices: [14, 15] },
];

// ── ONTOLOGY GRAPH ────────────────────────────────────────────────────────────
// Called via onEnter when slide 6a becomes active.
// Scripts injected through innerHTML are not executed by the browser,
// so the D3 logic lives here as a plain function instead.

function initOntologyGraph() {
  const svg = d3.select('#onto-svg');
  if (!svg.node() || svg.selectAll('*').size() > 0) return; // guard re-init

  const nodes = [
    // Core
    { id: 'fund',                          group: 0, r: 18 },
    { id: 'investment_objective',          group: 1, r: 14 },
    { id: 'capital_growth',                group: 1, r: 11 },
    { id: 'capital_appreciation',          group: 1, r: 9  },
    { id: 'income',                        group: 1, r: 11 },
    // Derivatives
    { id: 'derivatives',                   group: 2, r: 13 },
    { id: 'bonds',                         group: 2, r: 11 },
    { id: 'commodities',                   group: 2, r: 9  },
    { id: 'currencies',                    group: 2, r: 8  },
    { id: 'investment_grade_bonds',        group: 2, r: 7  },
    { id: 'convertible_bonds',             group: 2, r: 7  },
    // Companies / shares
    { id: 'companies',                     group: 3, r: 12 },
    { id: 'share_of_company',              group: 3, r: 10 },
    { id: 'chinese_companies',             group: 3, r: 7  },
    { id: 'shares_of_asian_companies',     group: 3, r: 6  },
    { id: 'shares_of_european_companies',  group: 3, r: 6  },
    // Environmental
    { id: 'environmental_markets',         group: 4, r: 11 },
    { id: 'energy_efficiency',             group: 4, r: 7  },
    { id: 'waste_management',              group: 4, r: 7  },
    { id: 'sustainable_transport',         group: 4, r: 7  },
    { id: 'water_infrastructure',          group: 4, r: 7  },
    // Tech
    { id: 'innovating_technologies',       group: 5, r: 11 },
    { id: 'artificial_intelligence',       group: 5, r: 7  },
    { id: 'robotics',                      group: 5, r: 7  },
    { id: 'cloud_computing',               group: 5, r: 7  },
    // Healthcare
    { id: 'healthcare_innovation',         group: 6, r: 10 },
    { id: 'genetic',                       group: 6, r: 6  },
    { id: 'drug_delivery',                 group: 6, r: 6  },
    // Portfolio / team
    { id: 'portfolio',                     group: 7, r: 10 },
    { id: 'investment_team',               group: 7, r: 9  },
    { id: 'asset_manager',                 group: 7, r: 6  },
    { id: 'debt_instrument',               group: 8, r: 11 },
  ];

  const links = [
    { source: 'fund',                         target: 'investment_objective',  type: 'achieve' },
    { source: 'investment_objective',         target: 'capital_growth',        type: 'sub' },
    { source: 'investment_objective',         target: 'income',                type: 'sub' },
    { source: 'capital_appreciation',         target: 'investment_objective',  type: 'sub' },
    { source: 'bonds',                        target: 'derivatives',           type: 'sub' },
    { source: 'commodities',                  target: 'derivatives',           type: 'sub' },
    { source: 'currencies',                   target: 'derivatives',           type: 'sub' },
    { source: 'investment_grade_bonds',       target: 'bonds',                 type: 'sub' },
    { source: 'convertible_bonds',            target: 'bonds',                 type: 'sub' },
    { source: 'chinese_companies',            target: 'companies',             type: 'sub' },
    { source: 'shares_of_asian_companies',    target: 'share_of_company',      type: 'sub' },
    { source: 'shares_of_european_companies', target: 'share_of_company',      type: 'sub' },
    { source: 'energy_efficiency',            target: 'environmental_markets', type: 'sub' },
    { source: 'waste_management',             target: 'environmental_markets', type: 'sub' },
    { source: 'sustainable_transport',        target: 'environmental_markets', type: 'sub' },
    { source: 'water_infrastructure',         target: 'environmental_markets', type: 'sub' },
    { source: 'artificial_intelligence',      target: 'innovating_technologies', type: 'sub' },
    { source: 'robotics',                     target: 'innovating_technologies', type: 'sub' },
    { source: 'cloud_computing',              target: 'innovating_technologies', type: 'sub' },
    { source: 'genetic',                      target: 'healthcare_innovation', type: 'sub' },
    { source: 'drug_delivery',                target: 'healthcare_innovation', type: 'sub' },
    { source: 'asset_manager',                target: 'investment_team',       type: 'sub' },
    { source: 'fund',                         target: 'portfolio',             type: 'rel' },
    { source: 'fund',                         target: 'investment_team',       type: 'rel' },
  ];

  const colors = ['#00E5C3','#A78BFA','#FF7A45','#60A5FA','#4ADE80','#F472B6','#FBBF24','#94A8C2','#F87171'];

  const container = document.getElementById('onto-graph');
  const w = container.clientWidth;
  const h = container.clientHeight;
  const tooltip = document.getElementById('onto-tooltip');

  // Wrapper group — zoom/pan transforms this, not the SVG root
  const g = svg.append('g');

  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.type === 'achieve' ? 110 : 70).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-320))
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('collision', d3.forceCollide(d => d.r + 14));

  // Zoom + pan
  svg.call(
    d3.zoom()
      .scaleExtent([0.25, 4])
      .on('zoom', e => g.attr('transform', e.transform))
  );

  const link = g.append('g')
    .selectAll('line').data(links).join('line')
    .attr('stroke', d => d.type === 'achieve' ? '#00E5C3' : '#1E2A40')
    .attr('stroke-width', d => d.type === 'achieve' ? 2 : 1)
    .attr('stroke-opacity', 0.7)
    .attr('stroke-dasharray', d => d.type === 'rel' ? '4,3' : null);

  const node = g.append('g')
    .selectAll('g').data(nodes).join('g')
    .style('cursor', 'grab')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  node.append('circle')
    .attr('r', d => d.r)
    .attr('fill',         d => colors[d.group] + '22')
    .attr('stroke',       d => colors[d.group])
    .attr('stroke-width', d => d.group === 0 ? 2.5 : 1.5);

  node.append('text')
    .text(d => d.id.replace(/_/g, ' '))
    .attr('text-anchor', 'middle')
    .attr('dy',          d => d.r + 11)
    .attr('font-size',   d => d.r > 12 ? 10 : 8)
    .attr('fill',        d => colors[d.group])
    .attr('font-family', "'DM Mono', monospace")
    .style('pointer-events', 'none');

  node
    .on('mouseover', (e, d) => {
      tooltip.style.opacity = '1';
      tooltip.textContent   = d.id.replace(/_/g, ' ');
      tooltip.style.left    = (e.offsetX + 12) + 'px';
      tooltip.style.top     = (e.offsetY - 8)  + 'px';
    })
    .on('mouseout', () => { tooltip.style.opacity = '0'; });

  sim.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
}

// ── CLUSTER TREEMAP ───────────────────────────────────────────────────────────
// Leaf names are anonymised — fund names were client data from a PwC internship.
// The cluster structure, group counts, and category labels are preserved.
const anon = n => Array.from({ length: n }, (_, i) => ({ name: `fund ${String(i + 1).padStart(2, '0')}` }));

function initClusterGraph() {
  const container = document.getElementById('cluster-wrap');
  if (!container || d3.select('#cluster-svg').selectAll('*').size() > 0) return;

  const RED   = '#FF7A45';
  const GREEN = '#4ADE80';

  const hierarchy = {
    name: 'root',
    children: [
      {
        name: 'Bonds & Fixed Income', color: RED,
        children: [
          { name: 'Multi-Asset & Absolute Return', children: anon(13) },
          { name: 'Money Market & Short Term',     children: anon(7)  },
          { name: 'Corporate Bond',                children: anon(8)  },
          { name: 'High Yield',                    children: anon(6)  },
          { name: 'Emerging & Asia Bond',          children: anon(6)  },
          { name: 'Inflation & Duration',          children: anon(5)  },
          { name: 'Euro Core Bond',                children: anon(7)  },
          { name: 'Environmental',                 children: anon(1)  },
        ]
      },
      {
        name: 'Equities & Real Assets', color: GREEN,
        children: [
          { name: 'Europe Equity',          children: anon(13) },
          { name: 'Europe Multi-Factor',    children: anon(2)  },
          { name: 'Global & Multi-Factor',  children: anon(5)  },
          { name: 'Asia & Emerging Equity', children: anon(13) },
          { name: 'US & Americas',          children: anon(4)  },
          { name: 'Real Estate',            children: anon(3)  },
          { name: 'Global Equity',          children: anon(7)  },
          { name: 'Thematic',               children: anon(7)  },
        ]
      }
    ]
  };

  const W = container.clientWidth;
  const H = container.clientHeight;
  const svg = d3.select('#cluster-svg').attr('width', W).attr('height', H);

  function nodeColor(d) {
    let node = d;
    while (node.depth > 1) node = node.parent;
    const base = node.data.color || '#94A8C2';
    if (d.depth === 1) return base + '28';
    if (d.depth === 2) return base + '14';
    return base + '0A';
  }
  function textColor(d) {
    let node = d;
    while (node.depth > 1) node = node.parent;
    const base = node.data.color || '#94A8C2';
    if (d.depth === 1) return '#F0F4FF';
    return base;
  }

  const stack = [hierarchy];

  function render(rootData) {
    svg.selectAll('*').remove();

    const root = d3.hierarchy(rootData).sum(() => 1).sort((a, b) => b.value - a.value);

    d3.treemap()
      .size([W, H])
      .padding(d => d.depth === 0 ? 4 : d.depth === 1 ? 3 : 1)
      .paddingTop(d => d.depth === 1 ? 22 : d.depth === 2 ? 18 : 0)
      .round(true)(root);

    const tooltip = document.getElementById('cluster-tooltip');

    const cell = svg.selectAll('g')
      .data(root.descendants().filter(d => d.depth > 0))
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    cell.append('rect')
      .attr('width',  d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('fill',   d => nodeColor(d))
      .attr('stroke', d => { let n = d; while (n.depth > 1) n = n.parent; return (n.data.color || '#94A8C2') + '55'; })
      .attr('stroke-width', d => d.depth === 1 ? 1.5 : 0.5)
      .attr('rx', 4)
      .style('cursor', d => d.children ? 'pointer' : 'default')
      .on('click', (e, d) => {
        if (!d.children) return;
        e.stopPropagation();
        stack.push(d.data);
        render(d.data);
        renderBreadcrumb();
      })
      .on('mouseover', function(e, d) {
        d3.select(this).attr('stroke-width', 2).attr('stroke', () => { let n = d; while (n.depth > 1) n = n.parent; return n.data.color || '#94A8C2'; });
        if (!d.children) { tooltip.style.opacity = '1'; tooltip.textContent = d.data.name; tooltip.style.left = (e.offsetX + 10) + 'px'; tooltip.style.top = (e.offsetY - 28) + 'px'; }
      })
      .on('mousemove', (e, d) => { if (!d.children) { tooltip.style.left = (e.offsetX + 10) + 'px'; tooltip.style.top = (e.offsetY - 28) + 'px'; } })
      .on('mouseout',  function(e, d) { d3.select(this).attr('stroke-width', d.depth === 1 ? 1.5 : 0.5); tooltip.style.opacity = '0'; });

    // Group headers
    cell.filter(d => d.children && (d.x1 - d.x0) > 40)
      .append('text')
      .attr('x', 6).attr('y', 14)
      .attr('font-size',   d => d.depth === 1 ? 11 : 10)
      .attr('font-weight', d => d.depth === 1 ? 700 : 600)
      .attr('font-family', d => d.depth === 1 ? "'Syne',sans-serif" : "'DM Sans',sans-serif")
      .attr('fill', d => textColor(d))
      .attr('pointer-events', 'none')
      .text(d => { const w = d.x1 - d.x0; return w < 80 ? d.data.name.slice(0, Math.floor(w / 7)) + '…' : d.data.name; });

    // Leaf labels
    cell.filter(d => !d.children)
      .append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => { const w = d.x1 - d.x0, h = d.y1 - d.y0; return Math.min(10, Math.max(6, Math.min(w / 8, h / 2))); })
      .attr('font-family', "'DM Sans',sans-serif")
      .attr('fill', d => textColor(d))
      .attr('opacity', 0.85)
      .attr('pointer-events', 'none')
      .text(d => { const w = d.x1 - d.x0, h = d.y1 - d.y0; if (w < 30 || h < 14) return ''; return w < 70 ? d.data.name.split(' ').slice(0, 2).join(' ') : d.data.name; });
  }

  function renderBreadcrumb() {
    const bc = document.getElementById('cluster-breadcrumb');
    bc.innerHTML = '';
    stack.forEach((s, i) => {
      if (i > 0) { const sep = document.createElement('span'); sep.textContent = ' › '; sep.style.color = '#5A6A85'; bc.appendChild(sep); }
      const span = document.createElement('span');
      span.textContent = i === 0 ? 'All clusters' : s.name;
      span.style.cssText = `cursor:pointer;color:${i === stack.length - 1 ? '#F0F4FF' : '#00E5C3'}`;
      span.onclick = () => { stack.splice(i + 1); render(stack[stack.length - 1]); renderBreadcrumb(); };
      bc.appendChild(span);
    });
  }

  render(hierarchy);
  renderBreadcrumb();
}

// ── SLIDE DEFINITIONS ─────────────────────────────────────────────────────────
// Each entry: { num, label, onEnter?, html }
//   num     → displayed in the sidebar (e.g. "1a")
//   label → sidebar link text
//   html  → inner HTML injected into the .slide div

const SLIDES = [

  // ── 00 · TITLE ──────────────────────────────────────────────────────────────
  {
    num: '00', label: 'Title',
    html: `
      <div id="slide-title-hero">
        <div class="hero-eyebrow">NLP · Ontology · Financial Documents · 2020</div>
        <h1 class="hero-title">
          Turning Raw<br>
          Financial Documents<br>
          into <span class="accent">Semantic Knowledge</span>
        </h1>
        <p class="hero-sub">An NLP &amp; ontology-based approach to making financial documents queryable — from unstructured PDFs to meaningful answers.</p>
        <div class="hero-meta">
          <div class="hero-tag"><span class="dot"></span>Léa Dieudonat</div>
          <div class="hero-tag"><span class="dot"></span>PwC Luxembourg</div>
          <div class="hero-tag"><span class="dot"></span>August 2020</div>
        </div>
      </div>
    `,
  },

  // ── 01 · AGENDA ─────────────────────────────────────────────────────────────
  {
    num: '01', label: 'Agenda',
    html: `
      <div class="section-tag">Overview</div>
      <h2 class="slide-title">Agenda</h2>
      <div class="agenda-grid">
        <div class="agenda-item" onclick="goTo(2)">
          <span class="agenda-num">01</span>
          <div class="agenda-info">
            <div class="agenda-question">What Problem Are We Solving?</div>
            <div class="agenda-section">Background &amp; Challenges</div>
          </div>
        </div>
        <div class="agenda-item" onclick="goTo(4)">
          <span class="agenda-num">02</span>
          <div class="agenda-info">
            <div class="agenda-question">How Do We Solve It?</div>
            <div class="agenda-section">The Ontology Pipeline</div>
          </div>
        </div>
        <div class="agenda-item" onclick="goTo(6)">
          <span class="agenda-num">03</span>
          <div class="agenda-info">
            <div class="agenda-question">How Do We Break Down Documents?</div>
            <div class="agenda-section">Chunking</div>
          </div>
        </div>
        <div class="agenda-item" onclick="goTo(8)">
          <span class="agenda-num">04</span>
          <div class="agenda-info">
            <div class="agenda-question">How Do We Represent Meaning?</div>
            <div class="agenda-section">Text Embeddings</div>
          </div>
        </div>
        <div class="agenda-item" onclick="goTo(10)">
          <span class="agenda-num">05</span>
          <div class="agenda-info">
            <div class="agenda-question">How Do We Find the Right Answer?</div>
            <div class="agenda-section">Semantic Search</div>
          </div>
        </div>
        <div class="agenda-item" onclick="goTo(12)">
          <span class="agenda-num">06</span>
          <div class="agenda-info">
            <div class="agenda-question">Does It Work?</div>
            <div class="agenda-section">Results</div>
          </div>
        </div>
        <div class="agenda-item" onclick="goTo(14)">
          <span class="agenda-num">07</span>
          <div class="agenda-info">
            <div class="agenda-question">What's Next?</div>
            <div class="agenda-section">Conclusion &amp; Perspectives</div>
          </div>
        </div>
      </div>
    `,
  },

  // ── 1a · THE PROBLEM ────────────────────────────────────────────────────────
  {
    num: '1a', label: 'The Problem',
    html: `
      <div class="section-tag">01 — Background &amp; Challenges</div>
      <h2 class="slide-title">What Problem Are <em>We Solving?</em></h2>
      <div class="callout big">800 documents. Dozens of formats. One simple question.</div>
      <ul class="bullet-list">
        <li><strong>Volume:</strong> Financial analysts deal with hundreds of KIIDs, Prospectuses and reports simultaneously</li>
        <li><strong>Heterogeneity:</strong> Documents vary in language (EN, FR, DE…), structure, and length — no two are alike</li>
        <li><strong>Time:</strong> A simple question like <em>"What is this fund's risk profile?"</em> can take hours to answer manually</li>
        <li><strong>Tooling gap:</strong> Traditional search tools don't understand meaning — they match keywords, not concepts</li>
      </ul>
    `,
  },

  // ── 1b · WHY IS IT HARD ─────────────────────────────────────────────────────
  {
    num: '1b', label: 'Why Is It Hard?',
    html: `
      <div class="section-tag">01 — Background &amp; Challenges</div>
      <h2 class="slide-title">Why Is It <em>Hard?</em></h2>
      <div class="callout">"Keywords don't understand meaning."</div>
      <ul class="bullet-list">
        <li><strong>Synonyms are invisible:</strong> Searching for "risk" misses "volatility", "exposure", "downside" — same concept, different words</li>
        <li><strong>No consistent structure:</strong> Relevant information can appear anywhere in a document — no standard layout</li>
        <li><strong>No two Prospectuses are alike:</strong> Different layouts, different section names, different languages across funds</li>
        <li><strong>The core challenge:</strong> Make machines understand financial language — not just match characters on a page</li>
      </ul>
    `,
  },

  // ── 2a · THE PIPELINE ───────────────────────────────────────────────────────
  {
    num: '2a', label: 'The Pipeline',
    html: `
      <div class="section-tag">02 — The Ontology Pipeline</div>
      <h2 class="slide-title">How Do We <em>Solve It?</em></h2>
      <p style="color:var(--muted);font-size:14px;margin-bottom:24px;">From raw documents to meaningful answers — in 4 steps.</p>
      <div class="pipeline">
        <div class="pipeline-step">
          <div class="step-icon">📄</div>
          <div class="step-name">Raw Documents</div>
          <div class="step-desc">KIIDs &amp; Prospectuses — unstructured PDFs</div>
        </div>
        <div class="pipeline-arrow">→</div>
        <div class="pipeline-step">
          <div class="step-icon">✂️</div>
          <div class="step-name">Chunking</div>
          <div class="step-desc">Split into meaningful, searchable passages</div>
        </div>
        <div class="pipeline-arrow">→</div>
        <div class="pipeline-step">
          <div class="step-icon">🔢</div>
          <div class="step-name">Embeddings</div>
          <div class="step-desc">Represent each passage as a vector capturing its meaning</div>
        </div>
        <div class="pipeline-arrow">→</div>
        <div class="pipeline-step">
          <div class="step-icon">🔍</div>
          <div class="step-name">Semantic Search</div>
          <div class="step-desc">Find the passages closest to the question</div>
        </div>
        <div class="pipeline-arrow">→</div>
        <div class="pipeline-step">
          <div class="step-icon">💬</div>
          <div class="step-name">Answer</div>
          <div class="step-desc">Return the most relevant content to the analyst</div>
        </div>
      </div>
    `,
  },

  // ── 2b · WHY THIS APPROACH ──────────────────────────────────────────────────
  {
    num: '2b', label: 'Why This Approach?',
    html: `
      <div class="section-tag">02 — The Ontology Pipeline</div>
      <h2 class="slide-title">Why Not Just Use a <em>Search Engine?</em></h2>
      <div class="two-col">
        <div class="card card-accent">
          <div class="card-title">Understands relationships</div>
          <div class="card-body">A search engine finds documents — an ontology understands relationships between concepts, building a structured knowledge graph.</div>
        </div>
        <div class="card card-accent">
          <div class="card-title">Captures meaning</div>
          <div class="card-body">It captures <em>what a subfund is about</em>, not just what words it contains — the difference between retrieval and understanding.</div>
        </div>
        <div class="card card-accent">
          <div class="card-title">Language-agnostic</div>
          <div class="card-body">The same concept can be expressed in FR, EN, or DE — the ontology handles all three without separate pipelines.</div>
        </div>
        <div class="card card-accent">
          <div class="card-title">Reusable</div>
          <div class="card-body">Once built, the ontology can answer new questions without retraining from scratch — a durable knowledge asset.</div>
        </div>
      </div>
    `,
  },

  // ── 3a · CHUNKING ───────────────────────────────────────────────────────────
  {
    num: '3a', label: 'Chunking',
    html: `
      <div class="section-tag">03 — Chunking</div>
      <h2 class="slide-title">How Do We Break Down <em>Documents?</em></h2>
      <div class="callout">"You can't search what you can't read — and machines can't read 200 pages at once."</div>
      <ul class="bullet-list">
        <li><strong>The problem:</strong> A full document is too large to be processed or compared meaningfully as a single unit</li>
        <li><strong>Chunking =</strong> splitting a document into smaller, self-contained passages that can be independently processed</li>
        <li><strong>Key constraint:</strong> each chunk must carry enough context to be understood on its own — no orphaned sentences</li>
        <li><strong>The goal:</strong> turn one 200-page PDF into hundreds of individually searchable, semantically meaningful units</li>
      </ul>
    `,
  },

  // ── 3b · CHUNKING STRATEGIES ────────────────────────────────────────────────
  {
    num: '3b', label: 'Strategies',
    html: `
      <div class="section-tag">03 — Chunking</div>
      <h2 class="slide-title">Not All Splits Are <em>Equal.</em></h2>
      <div style="margin-bottom:8px;">
        <div class="strategy-row">
          <div class="strategy-name">Fixed-size chunking</div>
          <div class="pro">Simple and fast to implement</div>
          <div class="con">Can cut sentences mid-thought</div>
        </div>
        <div class="strategy-row">
          <div class="strategy-name">Sentence-based chunking</div>
          <div class="pro">More natural boundaries</div>
          <div class="con">Produces uneven chunk sizes</div>
        </div>
        <div class="strategy-row">
          <div class="strategy-name">Semantic chunking</div>
          <div class="pro">Best accuracy on meaning</div>
          <div class="con">Harder to implement reliably</div>
        </div>
      </div>
      <div class="callout" style="margin-top:16px;">
        Trade-off: chunk too large → noisy results &nbsp;·&nbsp; chunk too small → loss of context
      </div>
    `,
  },

  // ── 4a · EMBEDDINGS ─────────────────────────────────────────────────────────
  {
    num: '4a', label: 'Embeddings',
    html: `
      <div class="section-tag">04 — Text Embeddings</div>
      <h2 class="slide-title">How Do We <em>Represent Meaning?</em></h2>
      <p style="color:var(--muted);font-size:14px;margin-bottom:20px;">To compare meaning, you first need to measure it.</p>
      <div class="three-col">
        <div class="method-card">
          <div class="method-year">2000s</div>
          <div class="method-name">TF-IDF</div>
          <div class="method-desc">Weights words by frequency and rarity. Fast and interpretable, but no notion of semantic meaning.</div>
        </div>
        <div class="method-card">
          <div class="method-year">2013</div>
          <div class="method-name">Word2Vec</div>
          <div class="method-desc">Learns word relationships from context. King − Man + Woman ≈ Queen — geometry encodes meaning.</div>
        </div>
        <div class="method-card active-card">
          <div class="method-year">2018 ★ used here</div>
          <div class="method-name">BERT</div>
          <div class="method-desc">Understands words in context, not isolation. "Bank" means something different in finance vs. geography.</div>
        </div>
      </div>
      <div style="margin-top:14px;font-size:12px;color:var(--muted);font-family:var(--font-mono);">
        ★ Project started in 2019 — BERT was the state of the art at the time
      </div>
    `,
  },

  // ── 4b · VECTOR SPACE ───────────────────────────────────────────────────────
  {
    num: '4b', label: 'Vector Space',
    html: `
      <div class="section-tag">04 — Text Embeddings</div>
      <h2 class="slide-title">Similar Meaning = <em>Similar Location in Vector Space</em></h2>
      <div class="callout">"Capital growth" and "equity appreciation" end up close together — even if they share no words.</div>
      <ul class="bullet-list">
        <li>Every word, sentence or passage is mapped to a point in a high-dimensional vector space</li>
        <li>Words with related meanings cluster together naturally — no explicit rules required</li>
        <li><strong>Key insight:</strong> a user's query is also converted to a vector — we then find the closest document chunks</li>
        <li><strong>This is what makes semantic search possible:</strong> proximity in vector space = similarity in meaning</li>
      </ul>
      <div class="formula-box" style="margin-top:20px;">
        query_vector → nearest_neighbor_search(chunk_vectors) → top_k results
        <div class="formula-sub">The closer two vectors, the more semantically similar their content</div>
      </div>
    `,
  },

  // ── 5a · SEMANTIC SEARCH ────────────────────────────────────────────────────
  {
    num: '5a', label: 'Semantic Search',
    html: `
      <div class="section-tag">05 — Semantic Search</div>
      <h2 class="slide-title">How Do We Find <em>the Right Answer?</em></h2>
      <p style="color:var(--muted);font-size:14px;margin-bottom:20px;">Finding the closest answer — mathematically.</p>
      <ul class="bullet-list" style="margin-bottom:24px;">
        <li>Once documents and query are both vectors, we can measure their similarity mathematically</li>
        <li><strong>Cosine similarity</strong> — measures the angle between two vectors, not their magnitude</li>
        <li><strong>Score from 0 to 1</strong> — 0 means completely unrelated, 1 means identical meaning</li>
        <li>The chunks with the highest similarity scores are returned as the most relevant answers</li>
      </ul>
      <div class="formula-box">
        cos(θ) = (A · B) / (|A| × |B|)
        <div class="formula-sub">θ small → similar meaning &nbsp;·&nbsp; θ large → different meaning</div>
      </div>
    `,
  },

  // ── 5b · SEMANTIC VS KEYWORD ────────────────────────────────────────────────
  {
    num: '5b', label: 'vs. Keyword',
    html: `
      <div class="section-tag">05 — Semantic Search</div>
      <h2 class="slide-title">Same Question, <em>Very Different Results.</em></h2>
      <table class="compare-table">
        <thead>
          <tr>
            <th></th>
            <th>Keyword Search</th>
            <th>Semantic Search</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Query</td>
            <td>"risk fund"</td>
            <td>"risk fund"</td>
          </tr>
          <tr>
            <td>Finds</td>
            <td>Documents literally containing "risk" AND "fund"</td>
            <td>Documents about exposure, volatility, downside risk</td>
          </tr>
          <tr>
            <td>Misses</td>
            <td>All synonyms and paraphrases</td>
            <td>Almost nothing semantically related</td>
          </tr>
          <tr>
            <td>Strength</td>
            <td>Fast, predictable, no model needed</td>
            <td>Understands meaning and intent</td>
          </tr>
          <tr>
            <td>Weakness</td>
            <td>Rigid and literal</td>
            <td>Requires an embedding model</td>
          </tr>
        </tbody>
      </table>
    `,
  },

  // ── 6a · ONTOLOGY ───────────────────────────────────────────────────────────
  {
    num: '6a', label: 'Ontology',
    onEnter: initOntologyGraph,
    html: `
      <div class="section-tag">06 — Results</div>
      <h2 class="slide-title">Does It Work? <em>The Ontology in Action.</em></h2>
      <div class="callout big">The system learned the structure of financial knowledge.</div>
      <div id="onto-graph" style="width:100%;height:420px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;overflow:hidden;position:relative;">
        <svg id="onto-svg" width="100%" height="100%"></svg>
        <div id="onto-tooltip" style="position:absolute;background:#0D1220;border:1px solid #1E2A40;border-radius:6px;padding:6px 10px;font-size:11px;color:#F0F4FF;pointer-events:none;opacity:0;transition:opacity 0.15s;font-family:'DM Mono',monospace;"></div>
        <div style="position:absolute;bottom:10px;right:12px;font-family:'DM Mono',monospace;font-size:9px;color:#5A6A85;pointer-events:none;">scroll to zoom · drag to pan</div>
      </div>
    `,
  },

  // ── 6b · CLASSIFICATION ─────────────────────────────────────────────────────
  {
    num: '6b', label: 'Classification',
    onEnter: initClusterGraph,
    html: `
      <div class="section-tag">06 — Results</div>
      <h2 class="slide-title">Subfunds, <em>Automatically Classified.</em></h2>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div id="cluster-breadcrumb" style="font-family:'DM Mono',monospace;font-size:11px;display:flex;align-items:center;gap:2px;"></div>
        <div style="font-family:'DM Mono',monospace;font-size:9px;color:#5A6A85;">click to drill down · 108 subfunds · Ward clustering</div>
      </div>
      <div id="cluster-wrap" style="width:100%;flex:1;min-height:0;height:430px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;overflow:hidden;position:relative;">
        <svg id="cluster-svg"></svg>
        <div id="cluster-tooltip" style="position:absolute;background:#0D1220;border:1px solid #1E2A40;border-radius:6px;padding:5px 10px;font-size:11px;color:#F0F4FF;pointer-events:none;opacity:0;transition:opacity 0.15s;font-family:'DM Mono',monospace;white-space:nowrap;"></div>
      </div>
    `,
  },

  // ── 7a · ACHIEVEMENTS ───────────────────────────────────────────────────────
  {
    num: '7a', label: 'Achievements',
    html: `
      <div class="section-tag">07 — Conclusion &amp; Perspectives</div>
      <h2 class="slide-title">What Did We <em>Achieve?</em></h2>
      <p style="color:var(--muted);font-size:14px;margin-bottom:20px;">A first proof-of-concept for semantic search on financial documents.</p>
      <div class="achievement">
        <div class="achievement-check">✓</div>
        <div class="achievement-text">Successfully extracted and structured knowledge from unstructured KIIDs &amp; Prospectuses</div>
      </div>
      <div class="achievement">
        <div class="achievement-check">✓</div>
        <div class="achievement-text">Automatically classified subfunds by investment objective — without any manual labelling</div>
      </div>
      <div class="achievement">
        <div class="achievement-check">✓</div>
        <div class="achievement-text">Demonstrated that semantic similarity works across documents with different wording</div>
      </div>
      <div class="achievement">
        <div class="achievement-check">✓</div>
        <div class="achievement-text">Established a methodology that could be extended to other document types and domains</div>
      </div>
    `,
  },

  // ── 7b · LIMITS & NEXT STEPS ────────────────────────────────────────────────
  {
    num: '7b', label: 'Limits & Next Steps',
    html: `
      <div class="section-tag">07 — Conclusion &amp; Perspectives</div>
      <h2 class="slide-title">This Is a Starting Point, <em>Not a Finish Line.</em></h2>
      <div class="limits-grid">
        <div>
          <div class="limits-col-title red">Limits</div>
          <div class="limit-item">Multilingual documents (FR, EN, DE) introduce significant noise — a dedicated multilingual pipeline is needed</div>
          <div class="limit-item">Prospectus extraction remains unreliable due to highly inconsistent document structures</div>
        </div>
        <div>
          <div class="limits-col-title green">Next Steps</div>
          <div class="next-item">Explore <strong>FIBO</strong> as a reusable financial ontology standard — built from scratch for speed, FIBO for production</div>
          <div class="next-item">Test <strong>FinBERT</strong> for better domain accuracy on financial vocabulary (available from late 2019)</div>
          <div class="next-item">Improve chunking strategies for complex, variable-length Prospectuses</div>
          <div class="next-item">Validate ontology concepts with financial domain experts</div>
        </div>
      </div>
    `,
  },

];
