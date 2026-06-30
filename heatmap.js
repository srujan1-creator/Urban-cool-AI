(function () {
  'use strict';

  // Constants
  const INITIAL_ZONES = [
    { name: 'Hitec City', type: 'Commercial', temp: 44.2, ndvi: 0.15, ndbi: 0.78, risk: 'High', pop: '120K' },
    { name: 'Gachibowli', type: 'Mixed', temp: 42.8, ndvi: 0.22, ndbi: 0.65, risk: 'High', pop: '95K' },
    { name: 'Kukatpally', type: 'Residential', temp: 41.5, ndvi: 0.25, ndbi: 0.60, risk: 'Medium', pop: '180K' },
    { name: 'Secunderabad', type: 'Urban Core', temp: 45.1, ndvi: 0.12, ndbi: 0.82, risk: 'Critical', pop: '210K' },
    { name: 'Jubilee Hills', type: 'Residential', temp: 39.8, ndvi: 0.42, ndbi: 0.38, risk: 'Low', pop: '75K' },
    { name: 'Banjara Hills', type: 'Mixed', temp: 40.2, ndvi: 0.38, ndbi: 0.42, risk: 'Medium', pop: '85K' },
    { name: 'Begumpet', type: 'Commercial', temp: 43.6, ndvi: 0.18, ndbi: 0.72, risk: 'High', pop: '110K' },
    { name: 'Ameerpet', type: 'Commercial', temp: 44.0, ndvi: 0.14, ndbi: 0.76, risk: 'High', pop: '150K' },
    { name: 'Madhapur', type: 'IT Hub', temp: 43.5, ndvi: 0.20, ndbi: 0.70, risk: 'High', pop: '130K' },
    { name: 'Miyapur', type: 'Suburban', temp: 40.8, ndvi: 0.32, ndbi: 0.48, risk: 'Medium', pop: '140K' },
    { name: 'LB Nagar', type: 'Residential', temp: 42.0, ndvi: 0.28, ndbi: 0.55, risk: 'Medium', pop: '160K' },
    { name: 'Uppal', type: 'Industrial', temp: 44.8, ndvi: 0.10, ndbi: 0.85, risk: 'Critical', pop: '90K' },
    { name: 'Shamshabad', type: 'Airport/Open', temp: 43.0, ndvi: 0.20, ndbi: 0.58, risk: 'Medium', pop: '45K' },
    { name: 'Hussain Sagar', type: 'Water Body', temp: 35.2, ndvi: 0.05, ndbi: 0.05, risk: 'Low', pop: '5K' },
    { name: 'KBR Park', type: 'Green Zone', temp: 36.5, ndvi: 0.72, ndbi: 0.08, risk: 'Low', pop: '2K' },
    { name: 'Osmansagar', type: 'Water Body', temp: 34.8, ndvi: 0.08, ndbi: 0.03, risk: 'Low', pop: '1K' },
    { name: 'Charminar', type: 'Heritage/Dense', temp: 45.5, ndvi: 0.08, ndbi: 0.88, risk: 'Critical', pop: '200K' },
    { name: 'Mehdipatnam', type: 'Commercial', temp: 43.2, ndvi: 0.16, ndbi: 0.68, risk: 'High', pop: '125K' },
    { name: 'Kondapur', type: 'IT Hub', temp: 42.5, ndvi: 0.24, ndbi: 0.62, risk: 'Medium', pop: '100K' }
  ];

  const LAYER_CONFIG = {
    lst: {
      label: 'Land Surface Temperature',
      range: [34, 46],
      stops: [
        { offset: 0.0, color: [59, 130, 246] },   // Blue
        { offset: 0.3, color: [16, 185, 129] },   // Green
        { offset: 0.6, color: [245, 158, 11] },   // Amber
        { offset: 1.0, color: [239, 68, 68] }     // Red
      ],
      legendLow: '34°C',
      legendHigh: '46°C',
      gradient: 'linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444)',
      getValue: (z) => z.temp
    },
    ndvi: {
      label: 'Normalized Difference Vegetation Index',
      range: [0, 0.8],
      stops: [
        { offset: 0.0, color: [146, 64, 14] },    // Brown
        { offset: 0.3, color: [245, 158, 11] },   // Amber
        { offset: 0.7, color: [16, 185, 129] },   // Light Green
        { offset: 1.0, color: [6, 95, 70] }       // Dark Green
      ],
      legendLow: '0.0 (Bare)',
      legendHigh: '0.8 (Dense)',
      gradient: 'linear-gradient(90deg, #92400e, #f59e0b, #10b981, #065f46)',
      getValue: (z) => z.ndvi
    },
    ndbi: {
      label: 'Normalized Difference Built-up Index',
      range: [0, 0.9],
      stops: [
        { offset: 0.0, color: [16, 185, 129] },   // Green
        { offset: 0.4, color: [245, 158, 11] },   // Amber
        { offset: 0.8, color: [239, 68, 68] },    // Red
        { offset: 1.0, color: [124, 58, 237] }    // Purple
      ],
      legendLow: '0.0 (Open)',
      legendHigh: '0.9 (Dense)',
      gradient: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444, #7c3aed)',
      getValue: (z) => z.ndbi
    },
    cool: {
      label: 'AI-Recommended Cooling Priority',
      range: [0, 100],
      stops: [
        { offset: 0.0, color: [16, 185, 129] },   // Low -> Green
        { offset: 0.4, color: [245, 158, 11] },   // Med -> Yellow
        { offset: 0.7, color: [249, 115, 22] },   // High -> Orange
        { offset: 1.0, color: [239, 68, 68] }     // Critical -> Red
      ],
      legendLow: 'Low',
      legendHigh: 'Critical',
      gradient: 'linear-gradient(90deg, #10b981, #f59e0b, #f97316, #ef4444)',
      getValue: (z) => {
        // High priority if temperature is high and ndvi is low
        const tVal = normalizeValue(z.temp, [34, 46]);
        const nVal = 1 - normalizeValue(z.ndvi, [0, 0.8]);
        return tVal * 60 + nVal * 40;
      }
    }
  };

  // Helper Utilities
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function normalizeValue(val, range) {
    return clamp((val - range[0]) / (range[1] - range[0]), 0, 1);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpColor(c1, c2, t) {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t))
    ];
  }

  function sampleGradient(stops, t) {
    if (t <= stops[0].offset) return stops[0].color;
    if (t >= stops[stops.length - 1].offset) return stops[stops.length - 1].color;

    for (let i = 0; i < stops.length - 1; i++) {
      const left = stops[i];
      const right = stops[i + 1];
      if (t >= left.offset && t <= right.offset) {
        const localT = (t - left.offset) / (right.offset - left.offset);
        return lerpColor(left.color, right.color, localT);
      }
    }
    return stops[0].color;
  }

  class HeatmapEngine {
    constructor() {
      this.canvas = document.getElementById('heatmap-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.offscreen = document.createElement('canvas');
      this.offCtx = this.offscreen.getContext('2d');
      this.noiseCanvas = document.createElement('canvas');
      this.noiseCtx = this.noiseCanvas.getContext('2d');

      this.zones = [...INITIAL_ZONES];
      this.gridCols = 5;
      this.gridRows = Math.ceil(this.zones.length / this.gridCols);

      this.currentLayer = 'lst';
      this.prevColors = null;
      this.nextColors = null;
      this.transitionStart = 0;
      this.transitionDuration = 500;
      this.isTransitioning = false;

      this.hoveredZone = -1;
      this.pulsePhase = 0;
      this.animFrameId = null;

      this.mapImage = null;
      this.currentCity = 'hyderabad';
      this.isVisible = false;

      this._bindElements();
      this._resize();
      this._generateNoise();
      this._computeColors('lst');
      this.prevColors = this.nextColors.map((c) => [...c]);
      this._bindEvents();
      this._loadMapImage('hyderabad');
      this._animate();
    }

    _bindElements() {
      this.elInfo = document.getElementById('map-info');
      this.elZoneName = document.getElementById('zone-name');
      this.elZoneTemp = document.getElementById('zone-temp');
      this.elZoneLanduse = document.getElementById('zone-landuse');
      this.elZoneNdvi = document.getElementById('zone-ndvi');
      this.elZoneRisk = document.getElementById('zone-risk');

      this.elLayerLabel = document.getElementById('current-layer-label');
      this.elLegendLow = document.getElementById('legend-low');
      this.elLegendHigh = document.getElementById('legend-high');
      this.elLegendGrad = document.getElementById('legend-gradient');

      this.layerBtns = document.querySelectorAll('.layer-btn');
    }

    _resize() {
      const parent = this.canvas.parentElement;
      const w = parent.offsetWidth || 600;
      const h = parent.offsetHeight || 450;
      
      const dpr = window.devicePixelRatio || 1;
      this.displayW = w;
      this.displayH = h;

      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.ctx.scale(dpr, dpr);

      this.offscreen.width = w;
      this.offscreen.height = h;

      this.cellW = w / this.gridCols;
      this.cellH = h / this.gridRows;
    }

    _generateNoise() {
      const nw = 120;
      const nh = 120;
      this.noiseCanvas.width = nw;
      this.noiseCanvas.height = nh;

      const imgData = this.noiseCtx.createImageData(nw, nh);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 20; // very low opacity
      }
      this.noiseCtx.putImageData(imgData, 0, 0);
    }

    _computeColors(layerKey) {
      const cfg = LAYER_CONFIG[layerKey];
      this.nextColors = this.zones.map((z) => {
        const t = normalizeValue(cfg.getValue(z), cfg.range);
        return sampleGradient(cfg.stops, t);
      });
    }

    _bindEvents() {
      // Observe container size
      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          this._resize();
        });
        this.resizeObserver.observe(this.canvas.parentElement);
      } else {
        window.addEventListener('resize', () => {
          this._resize();
        });
      }

      // Observe canvas visibility to save resources
      if (window.IntersectionObserver) {
        this.visibilityObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isVisible = entry.isIntersecting;
            if (this.isVisible && !this.animFrameId) {
              this._animate();
            } else if (!this.isVisible && this.animFrameId) {
              cancelAnimationFrame(this.animFrameId);
              this.animFrameId = null;
            }
          });
        }, { threshold: 0.05 });
        this.visibilityObserver.observe(this.canvas);
      } else {
        this.isVisible = true;
      }

      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor(x / this.cellW);
        const row = Math.floor(y / this.cellH);
        const idx = row * this.gridCols + col;

        if (idx >= 0 && idx < this.zones.length && col < this.gridCols && row < this.gridRows) {
          this.hoveredZone = idx;
          const z = this.zones[idx];

          if (this.elZoneName) this.elZoneName.textContent = z.name;
          if (this.elZoneTemp) this.elZoneTemp.textContent = z.temp.toFixed(1) + ' °C';
          if (this.elZoneLanduse) this.elZoneLanduse.textContent = z.type;
          if (this.elZoneNdvi) this.elZoneNdvi.textContent = z.ndvi.toFixed(2);
          
          if (this.elZoneRisk) {
            this.elZoneRisk.textContent = z.risk;
            this.elZoneRisk.className = 'info-value';
            if (z.risk === 'Critical') this.elZoneRisk.style.color = 'var(--accent-red)';
            else if (z.risk === 'High') this.elZoneRisk.style.color = 'var(--accent-amber)';
            else if (z.risk === 'Medium') this.elZoneRisk.style.color = 'var(--accent-blue)';
            else this.elZoneRisk.style.color = 'var(--accent-green)';
          }

          if (this.elInfo) {
            this.elInfo.classList.add('visible');
            const infoW = this.elInfo.offsetWidth;
            const infoH = this.elInfo.offsetHeight;
            let infoX = x + 16;
            let infoY = y + 16;

            if (infoX + infoW > this.displayW) infoX = x - infoW - 16;
            if (infoY + infoH > this.displayH) infoY = y - infoH - 16;

            this.elInfo.style.left = clamp(infoX, 0, this.displayW - infoW) + 'px';
            this.elInfo.style.top = clamp(infoY, 0, this.displayH - infoH) + 'px';
          }
        } else {
          this.hoveredZone = -1;
          if (this.elInfo) this.elInfo.classList.remove('visible');
        }
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.hoveredZone = -1;
        if (this.elInfo) this.elInfo.classList.remove('visible');
      });

      this.layerBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const layer = btn.getAttribute('data-layer');
          if (layer === this.currentLayer && !this.isTransitioning) return;
          this.switchLayer(layer);
          this.layerBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    updateZones(newZones, cityName = null) {
      if (!newZones || newZones.length === 0) return;
      this.zones = newZones;
      this.gridRows = Math.ceil(this.zones.length / this.gridCols);
      
      this.isTransitioning = false;

      if (cityName) {
        this.currentCity = cityName;
        this._loadMapImage(cityName);
      }

      this._resize();
      this._computeColors(this.currentLayer);
      this.prevColors = this.nextColors.map((c) => [...c]);
      this.hoveredZone = -1;
      if (this.elInfo) this.elInfo.classList.remove('visible');
    }

    _loadMapImage(cityName) {
      const img = new Image();
      img.src = `assets/map_${cityName}.png`;
      img.onload = () => {
        this._render(this._getCurrentFrameColors());
      };
      this.mapImage = img;
    }

    switchLayer(layerKey) {
      if (!LAYER_CONFIG[layerKey]) return;
      this.prevColors = this._getCurrentFrameColors();
      this._computeColors(layerKey);
      this.currentLayer = layerKey;
      this.isTransitioning = true;
      this.transitionStart = performance.now();
      this._updateLegend(layerKey);
    }

    _updateLegend(layerKey) {
      const cfg = LAYER_CONFIG[layerKey];
      if (this.elLayerLabel) this.elLayerLabel.textContent = cfg.label;
      if (this.elLegendLow) this.elLegendLow.textContent = cfg.legendLow;
      if (this.elLegendHigh) this.elLegendHigh.textContent = cfg.legendHigh;
      if (this.elLegendGrad) this.elLegendGrad.style.background = cfg.gradient;
    }

    _getCurrentFrameColors() {
      if (!this.isTransitioning) {
        return this.nextColors.map((c) => [...c]);
      }
      const elapsed = performance.now() - this.transitionStart;
      const t = clamp(elapsed / this.transitionDuration, 0, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return this.prevColors.map((pc, i) => {
        if (!this.nextColors[i]) return pc;
        return lerpColor(pc, this.nextColors[i], eased);
      });
    }

    _animate() {
      if (!this.isVisible) {
        this.animFrameId = null;
        return;
      }
      const now = performance.now();
      this.pulsePhase = (now % 2000) / 2000;

      let colors;
      if (this.isTransitioning) {
        const elapsed = now - this.transitionStart;
        const t = clamp(elapsed / this.transitionDuration, 0, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        colors = this.prevColors.map((pc, i) => {
          if (!this.nextColors[i]) return pc;
          return lerpColor(pc, this.nextColors[i], eased);
        });
        if (t >= 1) {
          this.isTransitioning = false;
          this.prevColors = this.nextColors.map((c) => [...c]);
        }
      } else {
        colors = this.nextColors;
      }

      this._render(colors);
      this.animFrameId = requestAnimationFrame(() => this._animate());
    }

    _render(colors) {
      const ctx = this.offCtx;
      const w = this.displayW;
      const h = this.displayH;
      ctx.clearRect(0, 0, w, h);

      // Draw base satellite map first if loaded
      if (this.mapImage && this.mapImage.complete && this.mapImage.naturalWidth !== 0) {
        ctx.drawImage(this.mapImage, 0, 0, w, h);
      }

      this._drawThermalField(ctx, colors, w, h);
      this._drawGrid(ctx, w, h);
      this._drawLabels(ctx, w, h);
      this._drawHoverHighlight(ctx, w, h);

      this.ctx.clearRect(0, 0, w, h);
      this.ctx.drawImage(this.offscreen, 0, 0);
    }

    _drawThermalField(ctx, colors, w, h) {
      const iw = 80;
      const ih = 55;
      const imgData = ctx.createImageData(iw, ih);
      const data = imgData.data;

      for (let py = 0; py < ih; py++) {
        const ry = py / ih;
        for (let px = 0; px < iw; px++) {
          const rx = px / iw;

          const color = this._bilinearSample(colors, rx, ry);
          const pulse = this._pulseForPixel(rx, ry, colors);
          const idx = (py * iw + px) * 4;
          data[idx] = clamp(color[0] + pulse, 0, 255);
          data[idx + 1] = clamp(color[1] + pulse * 0.3, 0, 255);
          data[idx + 2] = clamp(color[2], 0, 255);
          data[idx + 3] = 255;
        }
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = iw;
      tempCanvas.height = ih;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.putImageData(imgData, 0, 0);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Blend thermal overlay over base map
      ctx.globalAlpha = 0.55;
      ctx.drawImage(tempCanvas, 0, 0, w, h);

      // Noise filter overlay
      ctx.globalAlpha = 0.06;
      ctx.drawImage(this.noiseCanvas, 0, 0);
      ctx.globalAlpha = 1.0;
    }

    _bilinearSample(colors, rx, ry) {
      const gx = rx * this.gridCols - 0.5;
      const gy = ry * this.gridRows - 0.5;

      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const x1 = x0 + 1;
      const y1 = y0 + 1;
      const fx = gx - x0;
      const fy = gy - y0;

      const getColor = (c, r) => {
        c = clamp(c, 0, this.gridCols - 1);
        r = clamp(r, 0, this.gridRows - 1);
        const idx = r * this.gridCols + c;
        return colors[idx] || [0, 0, 0];
      };

      const c00 = getColor(x0, y0);
      const c10 = getColor(x1, y0);
      const c01 = getColor(x0, y1);
      const c11 = getColor(x1, y1);

      const sfx = fx * fx * (3 - 2 * fx);
      const sfy = fy * fy * (3 - 2 * fy);

      const top = lerpColor(c00, c10, sfx);
      const bot = lerpColor(c01, c11, sfx);
      return lerpColor(top, bot, sfy);
    }

    _pulseForPixel(rx, ry, colors) {
      const col = Math.floor(rx * this.gridCols);
      const row = Math.floor(ry * this.gridRows);
      const idx = row * this.gridCols + col;
      if (idx >= this.zones.length) return 0;

      const zone = this.zones[idx];
      const cfg = LAYER_CONFIG[this.currentLayer];
      const val = normalizeValue(cfg.getValue(zone), cfg.range);
      if (val < 0.7) return 0;

      const px = (col + 0.5) / this.gridCols;
      const py = (row + 0.5) / this.gridRows;
      const dist = Math.sqrt(Math.pow(rx - px, 2) + Math.pow(ry - py, 2));

      const radial = Math.max(0, 1 - dist * 4);
      const sinWave = 0.5 + 0.5 * Math.sin(this.pulsePhase * Math.PI * 2);
      return radial * sinWave * 20 * (val - 0.7) / 0.3;
    }

    _drawGrid(ctx, w, h) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      for (let c = 1; c < this.gridCols; c++) {
        const x = c * this.cellW;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      for (let r = 1; r < this.gridRows; r++) {
        const y = r * this.cellH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    _drawLabels(ctx, w, h) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '9px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      this.zones.forEach((z, i) => {
        const col = i % this.gridCols;
        const row = Math.floor(i / this.gridCols);
        const x = col * this.cellW + this.cellW / 2;
        const y = row * this.cellH + this.cellH / 2;

        ctx.fillText(z.name, x, y);
      });
    }

    _drawHoverHighlight(ctx, w, h) {
      if (this.hoveredZone === -1 || this.hoveredZone >= this.zones.length) return;

      const col = this.hoveredZone % this.gridCols;
      const row = Math.floor(this.hoveredZone / this.gridCols);
      const x = col * this.cellW;
      const y = row * this.cellH;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(x + 1, y + 1, this.cellW - 2, this.cellH - 2);
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(x, y, this.cellW, this.cellH);
    }

    setLayer(layerKey) {
      this.switchLayer(layerKey);
      this.layerBtns.forEach((b) => {
        if (b.getAttribute('data-layer') === layerKey) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }

    getZones() {
      return this.zones;
    }

    getCurrentLayer() {
      return this.currentLayer;
    }

    destroy() {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.visibilityObserver) this.visibilityObserver.disconnect();
    }
  }

  function init() {
    const canvas = document.getElementById('heatmap-canvas');
    if (!canvas) return;
    const engine = new HeatmapEngine();
    engine._updateLegend(engine.currentLayer);
    window.HeatmapEngine = engine;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
