import { initChatbot } from './chatbot.js';

const MAP_CENTER  = [45.9115, 11.3456];
const MAP_ZOOM    = 16;
const TILE_DARK   = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT  = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR   = '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>';

const STATUS_COLOR = { critical: '#e4002b', warning: '#f59e0b', ok: '#10b981' };
const TYPE_STROKE  = { streetlight: '#facc15', manhole: '#94a3b8', tree: '#4ade80', road: null };
const TYPE_RADIUS  = { streetlight: 7, manhole: 6, tree: 8 };

let map;
let tileLayer;
let allFeatures       = [];
let leafletLayers     = {};
let layerGroups       = {
  streetlight: L.layerGroup(),
  manhole:     L.layerGroup(),
  road:        L.layerGroup(),
  tree:        L.layerGroup()
};
let activeStatus      = 'all';
let activeTypes       = new Set(['streetlight', 'manhole', 'road', 'tree']);
let highlightedLayers = [];

function computeStatus(p) {
  const now = new Date();
  const currentYear = now.getFullYear();
  switch (p.asset_type) {
    case 'streetlight': {
      const remaining = p.useful_life_years - (currentYear - p.year_installed);
      if (remaining <= 0) return 'critical';
      if (remaining <= 2) return 'warning';
      return 'ok';
    }
    case 'manhole': {
      const months = (now - new Date(p.last_inspection)) / (1000 * 60 * 60 * 24 * 30.44);
      if (months > 18) return 'critical';
      if (months > 12) return 'warning';
      return 'ok';
    }
    case 'road': {
      if (p.degradation_index >= 7) return 'critical';
      if (p.degradation_index >= 4) return 'warning';
      return 'ok';
    }
    case 'tree': {
      if (p.alerts.length >= 2) return 'critical';
      if (p.alerts.length === 1) return 'warning';
      return 'ok';
    }
  }
}

function makePointLayer(feature) {
  const p     = feature.properties;
  const color  = STATUS_COLOR[p.status];
  const stroke = TYPE_STROKE[p.asset_type] || color;
  const layer  = L.circleMarker(
    [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
    { radius: TYPE_RADIUS[p.asset_type], fillColor: color, color: stroke,
      weight: 2, fillOpacity: 0.85, opacity: 1 }
  );
  layer.on('click', () => showAssetCard(feature));
  layer.bindTooltip(p.label, { direction: 'top', offset: [0, -6] });
  return layer;
}

function makeRoadLayer(feature) {
  const p      = feature.properties;
  const coords = feature.geometry.coordinates.map(c => [c[1], c[0]]);
  const layer  = L.polyline(coords, {
    color: STATUS_COLOR[p.status], weight: 5, opacity: 0.85, lineCap: 'round'
  });
  layer.on('click', () => showAssetCard(feature));
  layer.bindTooltip(`${p.label} — degradation ${p.degradation_index}/10`, { sticky: true });
  return layer;
}

function renderAll() {
  Object.values(layerGroups).forEach(g => g.clearLayers());
  allFeatures.forEach(feature => {
    const p     = feature.properties;
    const layer = feature.geometry.type === 'Point'
      ? makePointLayer(feature)
      : makeRoadLayer(feature);
    leafletLayers[p.id] = layer;
    layerGroups[p.asset_type].addLayer(layer);
  });
  updateSummary();
}

function applyFilters() {
  allFeatures.forEach(feature => {
    const p     = feature.properties;
    const layer = leafletLayers[p.id];
    if (!layer) return;
    const show = activeTypes.has(p.asset_type) &&
                 (activeStatus === 'all' || p.status === activeStatus);
    if (layer.setStyle) layer.setStyle({ opacity: show ? 0.85 : 0, fillOpacity: show ? 0.85 : 0 });
  });
}

export function highlightFeatures(ids) {
  highlightedLayers.forEach(l => {
    if (l.setStyle) l.setStyle({ weight: l._origWeight || 2, opacity: l._origOpacity || 0.85 });
  });
  highlightedLayers = [];

  const targets = allFeatures.filter(f => ids.includes(f.properties.id));
  if (!targets.length) return;

  const bounds = L.latLngBounds([]);
  targets.forEach(feature => {
    const layer = leafletLayers[feature.properties.id];
    if (!layer) return;
    highlightedLayers.push(layer);
    if (layer.setStyle) {
      layer._origWeight  = layer.options.weight;
      layer._origOpacity = layer.options.opacity;
      layer.setStyle({ weight: 4, opacity: 1, fillOpacity: 1 });
    }
    if (feature.geometry.type === 'Point') {
      const c = feature.geometry.coordinates;
      bounds.extend([c[1], c[0]]);
    } else {
      feature.geometry.coordinates.forEach(c => bounds.extend([c[1], c[0]]));
    }
  });
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.3));
}

function showAssetCard(feature) {
  const p    = feature.properties;
  const card = document.getElementById('asset-card');
  card.classList.remove('hidden');

  const typeLabel   = { streetlight: 'Streetlight', manhole: 'Manhole', road: 'Road', tree: 'Tree' };
  const statusLabel = { critical: 'Critical', warning: 'Warning', ok: 'OK' };

  let details = '';
  if (p.asset_type === 'streetlight') {
    const remaining = p.useful_life_years - (new Date().getFullYear() - p.year_installed);
    details = `
      <tr><td class="t-text-sec">Lamp type</td><td>${p.lamp_type}</td></tr>
      <tr><td class="t-text-sec">Power</td><td>${p.power_w} W</td></tr>
      <tr><td class="t-text-sec">Installed</td><td>${p.year_installed}</td></tr>
      <tr><td class="t-text-sec">Service life</td><td>${p.useful_life_years} yr</td></tr>
      <tr><td class="t-text-sec">Remaining</td><td>${remaining > 0 ? remaining + ' yr' : 'Expired'}</td></tr>
      <tr><td class="t-text-sec">Last maintenance</td><td>${p.last_maintenance}</td></tr>`;
  } else if (p.asset_type === 'manhole') {
    const months = Math.round((new Date() - new Date(p.last_inspection)) / (1000 * 60 * 60 * 24 * 30.44));
    details = `
      <tr><td class="t-text-sec">Network</td><td>${p.network_type}</td></tr>
      <tr><td class="t-text-sec">Last inspection</td><td>${p.last_inspection}</td></tr>
      <tr><td class="t-text-sec">Months ago</td><td>${months}</td></tr>`;
  } else if (p.asset_type === 'road') {
    details = `
      <tr><td class="t-text-sec">Surface</td><td>${p.surface_type}</td></tr>
      <tr><td class="t-text-sec">Length</td><td>${p.length_m} m</td></tr>
      <tr><td class="t-text-sec">Last resurfaced</td><td>${p.year_last_resurfacing}</td></tr>
      <tr><td class="t-text-sec">Degradation</td><td>${p.degradation_index}/10</td></tr>`;
  } else if (p.asset_type === 'tree') {
    details = `
      <tr><td class="t-text-sec">Species</td><td><em>${p.species}</em></td></tr>
      <tr><td class="t-text-sec">Height</td><td>${p.height_m} m</td></tr>
      <tr><td class="t-text-sec">Planted</td><td>${p.year_planted}</td></tr>
      <tr><td class="t-text-sec">Alerts</td><td>${p.alerts.length ? p.alerts.join(', ') : '—'}</td></tr>`;
  }

  card.innerHTML = `
    <div class="p-4 border-b t-border">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold uppercase tracking-widest t-text-sec">${typeLabel[p.asset_type]}</span>
        <span class="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full badge-${p.status}">${statusLabel[p.status]}</span>
      </div>
      <div class="font-semibold text-sm leading-snug">${p.label}</div>
      <div class="text-xs t-text-sec mt-0.5">${p.id} · ${p.street}</div>
    </div>
    <div class="p-4">
      <table class="w-full text-xs border-separate" style="border-spacing: 0 4px">${details}</table>
      ${p.notes ? `<p class="text-xs text-yellow-500 mt-3 leading-relaxed">⚠ ${p.notes}</p>` : ''}
    </div>`;
}

function updateSummary() {
  const counts = { critical: 0, warning: 0, ok: 0 };
  allFeatures.forEach(f => counts[f.properties.status]++);
  document.getElementById('count-critical').textContent = counts.critical;
  document.getElementById('count-warning').textContent  = counts.warning;
  document.getElementById('count-ok').textContent       = counts.ok;
}

function setupFilters() {
  document.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-status]').forEach(b => b.classList.remove('filter-active'));
      btn.classList.add('filter-active');
      activeStatus = btn.dataset.status;
      applyFilters();
    });
  });
  document.querySelectorAll('[data-type]').forEach(chk => {
    chk.addEventListener('change', () => {
      if (chk.checked) activeTypes.add(chk.dataset.type);
      else activeTypes.delete(chk.dataset.type);
      applyFilters();
    });
  });
}

async function init() {
  const isDark = document.documentElement.dataset.theme === 'dark';

  map = L.map('map', { zoomControl: true }).setView(MAP_CENTER, MAP_ZOOM);
  tileLayer = L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);

  new MutationObserver(() => {
    const dark = document.documentElement.dataset.theme === 'dark';
    tileLayer.setUrl(dark ? TILE_DARK : TILE_LIGHT);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  Object.values(layerGroups).forEach(g => g.addTo(map));

  const data = await fetch('./data/assets.json').then(r => r.json());
  allFeatures = data.features.map(f => ({
    ...f,
    properties: { ...f.properties, status: computeStatus(f.properties) }
  }));

  renderAll();
  setupFilters();
  initChatbot(allFeatures, highlightFeatures);
}

init();
