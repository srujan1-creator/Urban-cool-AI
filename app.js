document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── Navbar Behavior ──────────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }

  // Smooth scroll & close menu on click
  document.querySelectorAll('.nav-link, .btn-primary').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          window.scrollTo({
            top: targetEl.offsetTop - 80,
            behavior: 'smooth'
          });
          navLinks.classList.remove('active');
          if (navToggle) navToggle.classList.remove('active');
        }
      }
    });
  });

  // ── Starry Space Background Canvas (#hero-canvas) ──────────────────────────
  const heroCanvas = document.getElementById('hero-canvas');
  let heroCtx = null;
  let heroParticles = [];
  let heroAnimId = null;

  if (heroCanvas) {
    heroCtx = heroCanvas.getContext('2d');
    resizeHeroCanvas();
    window.addEventListener('resize', resizeHeroCanvas);
    initHeroParticles();
    animateHero();
  }

  function resizeHeroCanvas() {
    if (!heroCanvas) return;
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = window.innerHeight;
  }

  function initHeroParticles() {
    heroParticles = [];
    const count = 180;
    for (let i = 0; i < count; i++) {
      const isFlare = Math.random() < 0.08;
      heroParticles.push({
        x: Math.random() * heroCanvas.width,
        y: Math.random() * heroCanvas.height,
        r: isFlare ? 1.5 + Math.random() * 1.5 : 0.4 + Math.random() * 0.8,
        vy: -0.05 - Math.random() * 0.15,
        vx: (Math.random() - 0.5) * 0.06,
        baseOpacity: 0.15 + Math.random() * 0.65,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
        isFlare: isFlare,
        flareSize: 5 + Math.random() * 6
      });
    }
  }

  function animateHero() {
    if (!heroCanvas) return;
    const w = heroCanvas.width;
    const h = heroCanvas.height;
    heroCtx.clearRect(0, 0, w, h);

    heroCtx.fillStyle = '#06080f';
    heroCtx.fillRect(0, 0, w, h);

    // Update positions
    heroParticles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.twinklePhase += p.twinkleSpeed;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    });

    // Draw
    heroParticles.forEach(p => {
      const opacity = p.baseOpacity * (0.3 + 0.7 * Math.abs(Math.sin(p.twinklePhase)));
      
      if (p.isFlare) {
        heroCtx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.75})`;
        heroCtx.lineWidth = 0.75;
        
        heroCtx.beginPath();
        heroCtx.moveTo(p.x - p.flareSize, p.y);
        heroCtx.lineTo(p.x + p.flareSize, p.y);
        heroCtx.stroke();
        
        heroCtx.beginPath();
        heroCtx.moveTo(p.x, p.y - p.flareSize);
        heroCtx.lineTo(p.x, p.y + p.flareSize);
        heroCtx.stroke();
        
        heroCtx.beginPath();
        heroCtx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        heroCtx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.22})`;
        heroCtx.fill();

        heroCtx.beginPath();
        heroCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        heroCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        heroCtx.fill();
      } else {
        heroCtx.beginPath();
        heroCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        heroCtx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
        heroCtx.fill();
      }
    });

    heroAnimId = requestAnimationFrame(animateHero);
  }

  // ── Counter Animation ──────────────────────────────────────────────────
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    let start = null;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stat-num, .impact-num').forEach(el => {
    counterObserver.observe(el);
  });

  // ── Scroll Reveal Animations ───────────────────────────────────────────
  const reveals = document.querySelectorAll('.animate-in, .info-card, .pipe-step, .strat-card, .member-card, .metric-card, .impact-stat, .tl-item, .model-card');
  
  reveals.forEach(el => {
    el.classList.add('animate-in');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '-50px' });

  reveals.forEach(el => {
    revealObserver.observe(el);
  });

  // ── UHI SVG Curve Drawing ──────────────────────────────────────────────
  const svg = document.getElementById('uhi-diagram');
  if (svg) {
    const svgObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          drawUHIDiagram();
          svgObs.unobserve(svg);
        }
      });
    }, { threshold: 0.2 });
    svgObs.observe(svg);
  }

  function drawUHIDiagram() {
    svg.innerHTML = '';
    
    // Add SVG Filters for premium glowing effects
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // 1. Temp curve gradient
    const tempGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    tempGrad.setAttribute('id', 'tempGrad');
    tempGrad.setAttribute('x1', '0%');
    tempGrad.setAttribute('y1', '0%');
    tempGrad.setAttribute('x2', '100%');
    tempGrad.setAttribute('y2', '0%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'var(--accent-blue)');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', 'var(--accent-red)');
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', 'var(--accent-blue)');
    
    tempGrad.appendChild(stop1);
    tempGrad.appendChild(stop2);
    tempGrad.appendChild(stop3);
    defs.appendChild(tempGrad);

    // 2. Glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '3');
    blur.setAttribute('result', 'coloredBlur');
    const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const node1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    node1.setAttribute('in', 'coloredBlur');
    const node2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    node2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(node1);
    merge.appendChild(node2);
    filter.appendChild(blur);
    filter.appendChild(merge);
    defs.appendChild(filter);
    
    svg.appendChild(defs);

    // Horizontal grid lines
    for (let g = 0; g < 4; g++) {
      const gy = 60 + g * 50;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '25');
      line.setAttribute('y1', gy);
      line.setAttribute('x2', '580');
      line.setAttribute('y2', gy);
      line.setAttribute('stroke', 'rgba(255,255,255,0.03)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }

    // Terrain shape (Ground contour from green to gray to green)
    const terrain = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    terrain.setAttribute('d', 'M 20 230 C 140 225, 200 230, 300 230 C 400 230, 460 225, 580 230 L 580 235 L 20 235 Z');
    terrain.setAttribute('fill', 'rgba(255, 255, 255, 0.05)');
    svg.appendChild(terrain);

    // Drawing Realistic Trees (Trunks & clustered foliage)
    const drawTree = (cx, cy, scale = 1) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Trunk
      const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      trunk.setAttribute('d', `M ${cx - 2} ${cy} L ${cx - 1} ${cy - 16 * scale} L ${cx + 1} ${cy - 16 * scale} L ${cx + 2} ${cy} Z`);
      trunk.setAttribute('fill', 'rgba(139, 92, 246, 0.25)'); // Wood
      g.appendChild(trunk);

      // Foliage clusters (layered)
      const colors = ['rgba(16,185,129,0.3)', 'rgba(16,185,129,0.22)', 'rgba(52,211,153,0.25)'];
      const offsets = [
        { dx: 0, dy: -18, r: 9 },
        { dx: -6, dy: -12, r: 7 },
        { dx: 6, dy: -12, r: 7 }
      ];

      offsets.forEach((o, i) => {
        const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        leaf.setAttribute('cx', cx + o.dx * scale);
        leaf.setAttribute('cy', cy + o.dy * scale);
        leaf.setAttribute('r', o.r * scale);
        leaf.setAttribute('fill', colors[i]);
        leaf.setAttribute('stroke', 'rgba(16,185,129,0.4)');
        leaf.setAttribute('stroke-width', '0.75');
        g.appendChild(leaf);
      });

      svg.appendChild(g);
    };

    // Drawing Realistic Buildings with window lights
    const drawBuilding = (x, y, w, h, isSkyscraper = false) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Main structural block
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
      rect.setAttribute('rx', '1');
      rect.setAttribute('fill', isSkyscraper ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.15)');
      rect.setAttribute('stroke', isSkyscraper ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)');
      rect.setAttribute('stroke-width', '1.2');
      g.appendChild(rect);

      // Skyscraper Details (antenna + grid of glowing windows)
      if (isSkyscraper) {
        // Antenna
        const ant = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ant.setAttribute('x1', x + w / 2);
        ant.setAttribute('y1', y);
        ant.setAttribute('x2', x + w / 2);
        ant.setAttribute('y2', y - 12);
        ant.setAttribute('stroke', 'rgba(239,68,68,0.4)');
        ant.setAttribute('stroke-width', '1.5');
        g.appendChild(ant);

        // Antenna blinking dot
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', x + w / 2);
        dot.setAttribute('cy', y - 12);
        dot.setAttribute('r', '2');
        dot.setAttribute('fill', '#ef4444');
        g.appendChild(dot);

        // Window lights grid
        const cols = w > 35 ? 4 : 2;
        const rows = Math.floor(h / 12) - 1;
        const colSpacing = w / (cols + 1);
        const rowSpacing = h / (rows + 1);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            // Randomly turn on/off some windows for realism
            if (Math.random() > 0.35) {
              const win = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              win.setAttribute('x', x + colSpacing * (c + 1) - 1.5);
              win.setAttribute('y', y + rowSpacing * (r + 1) - 1.5);
              win.setAttribute('width', '3');
              win.setAttribute('height', '3');
              win.setAttribute('fill', 'rgba(251,191,36,0.65)'); // Yellow glow
              g.appendChild(win);
            }
          }
        }

        // Convection Heat Waves
        if (h > 90) {
          for (let wI = 0; wI < 2; wI++) {
            const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const waveX = x + 8 + wI * 14;
            const wavePath = `M ${waveX} ${y - 4} Q ${waveX - 3} ${y - 12}, ${waveX} ${y - 20} T ${waveX} ${y - 32}`;
            wave.setAttribute('d', wavePath);
            wave.setAttribute('fill', 'none');
            wave.setAttribute('stroke', 'rgba(239,68,68,0.22)');
            wave.setAttribute('stroke-width', '1');
            g.appendChild(wave);
          }
        }
      } else {
        // Residential house roofs
        const roof = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        roof.setAttribute('points', `${x - 2},${y} ${x + w / 2},${y - 8} ${x + w + 2},${y}`);
        roof.setAttribute('fill', 'rgba(245,158,11,0.15)');
        roof.setAttribute('stroke', 'rgba(245,158,11,0.3)');
        roof.setAttribute('stroke-width', '1.2');
        g.appendChild(roof);

        // Simple window
        const win = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        win.setAttribute('x', x + w / 2 - 3);
        win.setAttribute('y', y + h / 2 - 3);
        win.setAttribute('width', '6');
        win.setAttribute('height', '6');
        win.setAttribute('fill', 'rgba(251,191,36,0.5)');
        g.appendChild(win);
      }

      svg.appendChild(g);
    };

    // ── Build scenery ─────────────────────────────────────────────────────

    // Rural Left (Trees)
    drawTree(40, 230, 1.1);
    drawTree(65, 230, 0.9);
    drawTree(90, 230, 1.0);

    // Suburban Left
    drawBuilding(135, 200, 25, 30);
    drawTree(170, 230, 0.85);
    drawBuilding(190, 195, 30, 35);

    // Urban Core (Skyline)
    drawBuilding(250, 140, 30, 90, true);
    drawBuilding(288, 100, 38, 130, true);
    drawBuilding(332, 120, 34, 110, true);

    // Suburban Right
    drawBuilding(410, 195, 28, 35);
    drawTree(448, 230, 0.9);
    drawBuilding(470, 205, 24, 25);

    // Rural Right
    drawTree(515, 230, 1.0);
    drawTree(540, 230, 0.9);
    drawTree(565, 230, 1.15);

    // ── Temperature Curve ─────────────────────────────────────────────────
    const points = [
      { x: 30, y: 215 },
      { x: 140, y: 195 },
      { x: 305, y: 70 }, // Peak
      { x: 460, y: 185 },
      { x: 570, y: 220 }
    ];

    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cpX1 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
      const cpY1 = points[i-1].y;
      const cpX2 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
      const cpY2 = points[i].y;
      pathData += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'url(#tempGrad)');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('filter', 'url(#glow)');
    
    svg.appendChild(path);
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      path.style.strokeDashoffset = '0';
    }, 100);

    // Base Line (baseline representing terrain ground level)
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', '20');
    baseLine.setAttribute('y1', '230');
    baseLine.setAttribute('x2', '580');
    baseLine.setAttribute('y2', '230');
    baseLine.setAttribute('stroke', 'rgba(255,255,255,0.08)');
    baseLine.setAttribute('stroke-width', '1.5');
    svg.appendChild(baseLine);

    // Text labels
    const labels = [
      { x: 55, label: 'Rural' },
      { x: 165, label: 'Suburban' },
      { x: 305, label: 'Urban Core' },
      { x: 440, label: 'Suburban' },
      { x: 540, label: 'Rural' }
    ];

    labels.forEach((p) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', p.x);
      text.setAttribute('y', '256');
      text.setAttribute('fill', 'var(--text-secondary)');
      text.setAttribute('font-size', '10.5');
      text.setAttribute('font-family', 'Space Grotesk, sans-serif');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = p.label;
      svg.appendChild(text);
    });
  }

  // ── Chart.js ───────────────────────────────────────────────────────────
  let chartsInitialized = false;
  let chartHist = null;
  let chartTrend = null;
  let chartLand = null;
  let currentCity = 'hyderabad';

  if (window.Chart) {
    Chart.defaults.color = 'rgba(200, 210, 230, 0.65)';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
    Chart.defaults.font.family = 'Inter';
  }

  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !chartsInitialized) {
        chartsInitialized = true;
        if (window.HeatmapEngine) {
          initCharts(window.HeatmapEngine.getZones());
        } else {
          initCharts();
        }
      }
    });
  }, { threshold: 0.1 });

  const chartTrigger = document.querySelector('.dash-grid');
  if (chartTrigger) chartObserver.observe(chartTrigger);

  function initCharts(zonesData = null) {
    if (!window.Chart) return;
    
    let zones = zonesData || [];
    if (zones.length === 0) return;

    // Chart A: Histograms (LST distribution)
    const bins = [0, 0, 0, 0]; // <36, 36-40, 40-44, >=44
    zones.forEach(z => {
      const temp = z.temp || z.actual_temp;
      if (temp < 36) bins[0]++;
      else if (temp < 40) bins[1]++;
      else if (temp < 44) bins[2]++;
      else bins[3]++;
    });

    const ctxA = document.getElementById('chart-histogram');
    if (ctxA) {
      if (chartHist) chartHist.destroy();
      chartHist = new Chart(ctxA.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['<36°C', '36-40°C', '40-44°C', '>=44°C'],
          datasets: [{
            data: bins,
            backgroundColor: [
              'rgba(59, 130, 246, 0.6)',
              'rgba(16, 185, 129, 0.6)',
              'rgba(245, 158, 11, 0.6)',
              'rgba(239, 68, 68, 0.6)'
            ],
            borderColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444'
            ],
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.04)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Chart B: Trend (Avg. Temp vs. Optimizations)
    const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
    const avgTemps = {
      hyderabad: [29, 36, 42, 33, 31, 28],
      delhi: [22, 34, 45, 36, 32, 24],
      mumbai: [30, 33, 38, 30, 31, 29],
      bengaluru: [27, 34, 36, 29, 28, 26],
      chennai: [30, 35, 41, 35, 33, 30]
    };

    const activeTrends = avgTemps[currentCity] || avgTemps['hyderabad'];
    const mitigatedTrends = activeTrends.map(t => t - (t > 35 ? 2.8 : 0.8));

    const ctxB = document.getElementById('chart-trend');
    if (ctxB) {
      if (chartTrend) chartTrend.destroy();
      chartTrend = new Chart(ctxB.getContext('2d'), {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Avg LST',
              data: activeTrends,
              borderColor: 'rgba(239,68,68,0.85)',
              backgroundColor: 'rgba(239,68,68,0.05)',
              tension: 0.4,
              borderWidth: 2,
              fill: true
            },
            {
              label: 'Mitigated LST',
              data: mitigatedTrends,
              borderColor: 'rgba(16,185,129,0.85)',
              backgroundColor: 'rgba(16,185,129,0.05)',
              tension: 0.4,
              borderWidth: 2,
              borderDash: [4, 4],
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.04)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Chart C: Doughnut (Land Use classifications)
    const typeCount = {};
    zones.forEach(z => {
      typeCount[z.type] = (typeCount[z.type] || 0) + 1;
    });

    const ctxC = document.getElementById('chart-landuse');
    if (ctxC) {
      if (chartLand) chartLand.destroy();
      chartLand = new Chart(ctxC.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(typeCount),
          datasets: [{
            data: Object.values(typeCount),
            backgroundColor: [
              'rgba(0, 212, 255, 0.55)',
              'rgba(16, 185, 129, 0.55)',
              'rgba(245, 158, 11, 0.55)',
              'rgba(239, 68, 68, 0.55)',
              'rgba(139, 92, 246, 0.55)',
              'rgba(59, 130, 246, 0.55)'
            ],
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          cutout: '60%'
        }
      });
    }
  }

  // ── AI Prediction Panel Gauge ──────────────────────────────────────────
  const gauge = document.getElementById('gauge-canvas');
  let gaugeCtx = null;
  if (gauge) gaugeCtx = gauge.getContext('2d');

  function drawGauge(score = 0) {
    if (!gaugeCtx) return;
    const w = gauge.width;
    const h = gauge.height;
    gaugeCtx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h;
    const r = w / 2 - 12;

    // Track arc
    gaugeCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    gaugeCtx.lineWidth = 15;
    gaugeCtx.lineCap = 'round';
    gaugeCtx.beginPath();
    gaugeCtx.arc(cx, cy, r, Math.PI, 0);
    gaugeCtx.stroke();

    // Value fill arc
    const targetRad = Math.PI + (score / 100) * Math.PI;
    const grad = gaugeCtx.createLinearGradient(0, cy, w, cy);
    grad.addColorStop(0, '#10b981');  // Green
    grad.addColorStop(0.5, '#f59e0b'); // Yellow
    grad.addColorStop(1, '#ef4444');   // Red

    gaugeCtx.strokeStyle = grad;
    gaugeCtx.beginPath();
    gaugeCtx.arc(cx, cy, r, Math.PI, targetRad);
    gaugeCtx.stroke();
  }

  drawGauge(0); // initial render

  const btnPredict = document.getElementById('btn-predict');
  if (btnPredict) {
    btnPredict.addEventListener('click', runSimulation);
  }

  function runSimulation() {
    btnPredict.classList.add('loading');
    btnPredict.disabled = true;
    btnPredict.textContent = 'Processing...';

    // Retrieve active zone name
    let zoneName = 'Hitec City';
    if (window.HeatmapEngine) {
      const activeIdx = window.HeatmapEngine.hoveredZone !== -1 ? window.HeatmapEngine.hoveredZone : 0;
      const zones = window.HeatmapEngine.getZones();
      if (zones[activeIdx]) {
        zoneName = zones[activeIdx].name;
      }
    }

    fetch('/api/heatwave-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: currentCity, zone: zoneName })
    })
      .then(res => res.json())
      .then(json => {
        if (json.status !== 'ok') throw new Error('API failure');
        updateSimulationUI(json.data);
      })
      .catch(() => {
        // Fallback simulation parameters if offline
        const mockScore = currentCity === 'delhi' ? 88 : currentCity === 'bengaluru' ? 38 : 72;
        updateSimulationUI({
          predicted_temp: currentCity === 'delhi' ? 46.2 : currentCity === 'bengaluru' ? 36.5 : 43.6,
          risk_score: mockScore,
          risk_level: mockScore > 75 ? 'Critical' : mockScore > 50 ? 'High' : 'Medium',
          population: currentCity === 'delhi' ? '2.8 Million' : '1.2 Million',
          mitigated_temp: currentCity === 'delhi' ? 43.2 : 34.0,
          recommended_strategy: 'Deploy Cool Roof Paint & Tree Canopies'
        });
      });
  }

  function updateSimulationUI(data) {
    let currentScore = 0;
    const targetScore = data.risk_score;
    const duration = 2000;
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      currentScore = eased * targetScore;
      drawGauge(currentScore);
      
      const elVal = document.getElementById('gauge-value');
      if (elVal) elVal.textContent = Math.round(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Restore predict button
        btnPredict.classList.remove('loading');
        btnPredict.disabled = false;
        btnPredict.textContent = 'Run AI Prediction';

        // Update other parameters
        const elRisk = document.getElementById('result-risk');
        const elTemp = document.getElementById('result-temp');
        const elPop = document.getElementById('result-pop');
        const elAction = document.getElementById('result-action');

        if (elRisk) {
          elRisk.textContent = data.risk_level;
          elRisk.style.color = data.risk_score > 75 ? 'var(--accent-red)' : data.risk_score > 50 ? 'var(--accent-amber)' : 'var(--accent-green)';
        }
        if (elTemp) elTemp.textContent = `${data.predicted_temp.toFixed(1)}°C → ${data.mitigated_temp ? data.mitigated_temp.toFixed(1) : (data.predicted_temp - 2.8).toFixed(1)}°C`;
        if (elPop) elPop.textContent = data.population || '1.2 Million';
        if (elAction) elAction.textContent = data.recommended_strategy || 'Deploy Forestry & High-Albedo roofs';
        
        // Add fade transition
        const wrap = document.getElementById('predict-results');
        if (wrap) wrap.classList.add('revealed');
      }
    }

    requestAnimationFrame(animate);
  }

  // ── Neural Network Visualization (#nn-canvas) ──────────────────────────
  const nnCanvas = document.getElementById('nn-canvas');
  let nnCtx = null;
  let nnAnimId = null;
  let nnNodes = [];
  let nnConnections = [];
  let nnPulses = [];
  let nnVisible = false;

  const layerSizes = [6, 8, 6, 3];
  const inputLabels = ['LST', 'NDVI', 'NDBI', 'Albedo', 'Wind', 'Pop'];
  const outputLabels = ['Temp', 'Risk', 'Cooling'];

  if (nnCanvas) {
    nnCtx = nnCanvas.getContext('2d');
    resizeNNCanvas();
    window.addEventListener('resize', resizeNNCanvas);

    const nnObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        nnVisible = entry.isIntersecting;
        if (nnVisible && !nnAnimId) {
          animateNN();
        } else if (!nnVisible && nnAnimId) {
          cancelAnimationFrame(nnAnimId);
          nnAnimId = null;
        }
      });
    }, { threshold: 0.1 });
    nnObserver.observe(nnCanvas);
  }

  function resizeNNCanvas() {
    if (!nnCanvas) return;
    const parent = nnCanvas.parentElement;
    nnCanvas.width = (parent ? parent.offsetWidth : 600) * 2;
    nnCanvas.height = (parent ? parent.offsetHeight : 350) * 2;
    nnCtx.scale(2, 2);
    buildNNLayout();
  }

  function buildNNLayout() {
    nnNodes = [];
    nnConnections = [];
    const w = nnCanvas.width / 2;
    const h = nnCanvas.height / 2;
    const padding = 50;
    const layerSpacing = (w - padding * 2) / (layerSizes.length - 1);

    layerSizes.forEach((size, li) => {
      const x = padding + li * layerSpacing;
      const nodeSpacing = (h - padding * 2) / (size + 1);
      for (let ni = 0; ni < size; ni++) {
        const y = padding + (ni + 1) * nodeSpacing;
        let label = '';
        if (li === 0 && inputLabels[ni]) label = inputLabels[ni];
        if (li === layerSizes.length - 1 && outputLabels[ni]) label = outputLabels[ni];
        nnNodes.push({ x, y, layer: li, index: ni, label, glow: 0 });
      }
    });

    for (let li = 0; li < layerSizes.length - 1; li++) {
      const fromNodes = nnNodes.filter(n => n.layer === li);
      const toNodes = nnNodes.filter(n => n.layer === li + 1);
      fromNodes.forEach(from => {
        toNodes.forEach(to => {
          nnConnections.push({ from, to });
        });
      });
    }
  }

  function spawnPulse() {
    if (nnConnections.length === 0) return;
    const conn = nnConnections[Math.floor(Math.random() * nnConnections.length)];
    nnPulses.push({
      from: conn.from,
      to: conn.to,
      progress: 0,
      speed: 0.01 + Math.random() * 0.015,
    });
  }

  function animateNN() {
    if (!nnVisible) { nnAnimId = null; return; }

    const w = nnCanvas.width / 2;
    const h = nnCanvas.height / 2;
    nnCtx.clearRect(0, 0, w, h);

    nnConnections.forEach(c => {
      nnCtx.beginPath();
      nnCtx.moveTo(c.from.x, c.from.y);
      nnCtx.lineTo(c.to.x, c.to.y);
      nnCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      nnCtx.lineWidth = 0.5;
      nnCtx.stroke();
    });

    if (Math.random() < 0.06) spawnPulse();

    nnPulses = nnPulses.filter(p => {
      p.progress += p.speed;
      if (p.progress >= 1) {
        p.to.glow = 1.0;
        return false;
      }
      const px = p.from.x + (p.to.x - p.from.x) * p.progress;
      const py = p.from.y + (p.to.y - p.from.y) * p.progress;

      // Draw faint connection highlight
      nnCtx.beginPath();
      nnCtx.moveTo(p.from.x, p.from.y);
      nnCtx.lineTo(p.to.x, p.to.y);
      nnCtx.strokeStyle = `rgba(0, 212, 255, ${0.12 + 0.12 * Math.sin(p.progress * Math.PI)})`;
      nnCtx.lineWidth = 1;
      nnCtx.stroke();

      // Draw moving dot
      nnCtx.beginPath();
      nnCtx.arc(px, py, 2, 0, Math.PI * 2);
      nnCtx.fillStyle = '#00d4ff';
      nnCtx.fill();

      return true;
    });

    nnNodes.forEach(node => {
      const r = 8;
      if (node.glow > 0) {
        nnCtx.beginPath();
        nnCtx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
        nnCtx.fillStyle = `rgba(0, 212, 255, ${node.glow * 0.18})`;
        nnCtx.fill();
        node.glow = Math.max(0, node.glow - 0.02);
      }

      nnCtx.beginPath();
      nnCtx.arc(node.x, node.y, r, 0, Math.PI * 2);
      nnCtx.fillStyle = 'rgba(0, 212, 255, 0.1)';
      nnCtx.strokeStyle = `rgba(0, 212, 255, ${0.45 + node.glow * 0.55})`;
      nnCtx.lineWidth = 1.5;
      nnCtx.fill();
      nnCtx.stroke();

      if (node.label) {
        nnCtx.font = '10px Inter, sans-serif';
        nnCtx.fillStyle = 'rgba(200, 210, 230, 0.7)';
        nnCtx.textAlign = node.layer === 0 ? 'right' : 'left';
        const labelX = node.layer === 0 ? node.x - 14 : node.x + 14;
        nnCtx.fillText(node.label, labelX, node.y + 3.5);
      }
    });

    nnAnimId = requestAnimationFrame(animateNN);
  }

  // ── City Selector & India Inset Sync ────────────────────────────────────
  const citySelect = document.getElementById('city-select');
  const cityLabel = document.getElementById('map-city-label');

  const cityStates = {
    hyderabad: 'Telangana',
    delhi: 'NCR',
    mumbai: 'Maharashtra',
    bengaluru: 'Karnataka',
    chennai: 'Tamil Nadu'
  };

  const cityDisplayNames = {
    hyderabad: 'Hyderabad',
    delhi: 'Delhi',
    mumbai: 'Mumbai',
    bengaluru: 'Bengaluru',
    chennai: 'Chennai'
  };

  async function loadCityDashboard(cityName) {
    currentCity = cityName;
    const displayName = cityDisplayNames[cityName] || cityName;
    const stateName = cityStates[cityName] || '';
    
    if (cityLabel) cityLabel.textContent = `📍 ${displayName}, ${stateName}`;

    // Update active dot in the India inset map
    document.querySelectorAll('.inset-dot').forEach(dot => {
      if (dot.getAttribute('data-city') === cityName) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    try {
      const response = await fetch(`/api/zones?city=${cityName}`);
      if (!response.ok) throw new Error('API error');
      const json = await response.json();
      
      if (window.HeatmapEngine) {
        window.HeatmapEngine.updateZones(json.data, cityName);
      }
      initCharts(json.data);
      
    } catch (e) {
      console.warn('Using mock dynamic zones as fallback.', e);
      
      const mockTypes = ['Commercial', 'Mixed', 'Residential', 'Urban Core', 'Green Zone', 'Water Body'];
      const mockNames = {
        delhi: ['Chandni Chowk', 'Connaught Place', 'Karol Bagh', 'Okhla Industrial', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Chanakyapuri', 'Saket', 'Nehru Place', 'Hauz Khas', 'Yamuna Banks'],
        mumbai: ['Dharavi', 'Andheri East', 'Kurla', 'Bandra Kurla Complex', 'Colaba', 'Bandra West', 'Borivali', 'Thane Belapur Road', 'Sanjay Gandhi Park', 'Marine Drive'],
        bengaluru: ['Majestic', 'Whitefield', 'Electronic City', 'Indiranagar', 'Koramangala', 'Jayanagar', 'Hebbal', 'Peenya', 'Cubbon Park', 'Ulsoor Lake'],
        chennai: ['T. Nagar', 'Anna Nagar', 'Guindy Industrial', 'Velachery', 'Adyar', 'Mylapore', 'Royapettah', 'Pallavaram', 'Theosophical Society', 'Marina Beach Front'],
        hyderabad: ['Hitec City', 'Gachibowli', 'Kukatpally', 'Secunderabad', 'Jubilee Hills', 'Banjara Hills', 'Begumpet', 'Ameerpet', 'Madhapur', 'Miyapur', 'LB Nagar', 'Uppal', 'Shamshabad', 'Hussain Sagar', 'KBR Park']
      };

      const names = mockNames[cityName] || mockNames['hyderabad'];
      const tempBase = cityName === 'delhi' ? 44 : cityName === 'bengaluru' ? 35 : cityName === 'mumbai' ? 39 : cityName === 'chennai' ? 42 : 41;
      
      const mockZones = names.map((name, i) => {
        const isWater = name.toLowerCase().includes('lake') || name.toLowerCase().includes('sea') || name.toLowerCase().includes('beach') || name.toLowerCase().includes('water') || name.toLowerCase().includes('hussain sagar') || name.toLowerCase().includes('osmansagar');
        const isGreen = name.toLowerCase().includes('garden') || name.toLowerCase().includes('park') || name.toLowerCase().includes('society') || name.toLowerCase().includes('green') || name.toLowerCase().includes('kbr');
        const type = isWater ? 'Water Body' : isGreen ? 'Green Zone' : mockTypes[i % 4];
        
        let temp = tempBase + Math.random() * 4 - 2;
        if (isWater) temp = tempBase - 6 - Math.random() * 2;
        if (isGreen) temp = tempBase - 4 - Math.random() * 2;

        const ndvi = isGreen ? 0.7 + Math.random() * 0.1 : isWater ? 0.05 : 0.1 + Math.random() * 0.2;
        const ndbi = isGreen ? 0.05 : isWater ? 0.05 : 0.5 + Math.random() * 0.4;
        const risk = temp > tempBase + 1 ? 'Critical' : temp > tempBase ? 'High' : temp > tempBase - 1 ? 'Medium' : 'Low';
        return { name, type, temp, ndvi, ndbi, risk, pop: Math.round(50 + Math.random() * 200) + 'K' };
      });

      if (window.HeatmapEngine) {
        window.HeatmapEngine.updateZones(mockZones, cityName);
      }
      initCharts(mockZones);
    }
  }

  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      loadCityDashboard(e.target.value);
    });
  }

  // Handle India Inset Map dot clicks
  document.querySelectorAll('.inset-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const selectedCity = e.target.getAttribute('data-city');
      if (citySelect) {
        citySelect.value = selectedCity;
      }
      loadCityDashboard(selectedCity);
    });
  });

  // ── Authentication Modal Triggering ───────────────────────────────────
  const authModal = document.getElementById('auth-modal');
  const btnSignin = document.getElementById('navbar-signin');
  const authClose = document.getElementById('auth-close');
  const authTabs = document.querySelectorAll('.auth-tab-btn');
  const authPanels = document.querySelectorAll('.auth-panel');

  if (btnSignin && authModal) {
    btnSignin.addEventListener('click', (e) => {
      e.preventDefault();
      authModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock scrolling
    });
  }

  if (authClose && authModal) {
    authClose.addEventListener('click', () => {
      authModal.classList.remove('active');
      document.body.style.overflow = ''; // Unlock scrolling
    });

    // Close when clicking outside card
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Handle Tab Swapping (Login vs Signup)
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      authPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(`panel-${tab.getAttribute('data-tab')}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Auto-refresh the dashboard every 8 seconds to fetch live telemetry fluctuations
  setInterval(() => {
    loadCityDashboard(currentCity);
  }, 8000);

});
