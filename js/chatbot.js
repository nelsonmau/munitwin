let _features = [];
let _highlightFn = null;

export function initChatbot(features, highlightFn) {
  _features = features;
  _highlightFn = highlightFn;
  _setupUI();
}

const QUERIES = [
  {
    label: 'Streetlights near end of life',
    pattern: /streetlight|lamp|light|end.of.life|replac/i,
    handler: _queryEndOfLifeLights
  },
  {
    label: 'Uninspected manholes',
    pattern: /manhole|inspection|inspect|drain|sewer/i,
    handler: _queryUninspectedManholes
  },
  {
    label: 'Worst road sections',
    pattern: /road|street|pothole|degrad|asphalt|surface/i,
    handler: _queryWorstRoads
  },
  {
    label: 'Trees with risk alerts',
    pattern: /tree|green|alert|risk|plant|branch/i,
    handler: _queryRiskyTrees
  },
  {
    label: 'Estimated maintenance cost',
    pattern: /cost|budget|estimat|money|spend|euro/i,
    handler: _queryCostEstimate
  }
];

function _setupUI() {
  const chips = document.getElementById('chat-chips');
  QUERIES.forEach(q => {
    const btn = document.createElement('button');
    btn.textContent = q.label;
    btn.className = 'whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-white/20 text-gray-300 hover:border-blue-500 hover:text-white transition-colors';
    btn.addEventListener('click', () => _handleInput(q.label));
    chips.appendChild(btn);
  });

  const form = document.getElementById('chat-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const val = input.value.trim();
    if (!val) return;
    _handleInput(val);
    input.value = '';
  });
}

function _handleInput(text) {
  _appendMessage(text, 'user');

  const match = QUERIES.find(q => q.pattern.test(text));
  if (match) {
    const { html, ids } = match.handler();
    setTimeout(() => {
      _appendMessage(html, 'bot');
      if (ids.length && _highlightFn) _highlightFn(ids);
    }, 320);
  } else {
    setTimeout(() => {
      _appendMessage(
        'Try one of the suggested queries, or ask about streetlights, manholes, roads, trees, or maintenance costs.',
        'bot'
      );
    }, 320);
  }
}

function _appendMessage(content, role) {
  const area = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = role === 'user' ? 'chat-msg-user' : 'chat-msg-bot';
  div.innerHTML = content;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}

function _statusDot(status) {
  const colors = { critical: '#e4002b', warning: '#f59e0b', ok: '#10b981' };
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[status]};margin-right:4px;"></span>`;
}

function _queryEndOfLifeLights() {
  const lights = _features.filter(f =>
    f.properties.asset_type === 'streetlight' &&
    (f.properties.status === 'critical' || f.properties.status === 'warning')
  ).sort((a, b) => {
    const order = { critical: 0, warning: 1 };
    return order[a.properties.status] - order[b.properties.status];
  });

  if (!lights.length) {
    return { html: 'All streetlights are within their service life.', ids: [] };
  }

  const rows = lights.map(f => {
    const p = f.properties;
    const expiry = p.year_installed + p.useful_life_years;
    return `<tr>
      <td>${_statusDot(p.status)}${p.id}</td>
      <td>${p.street}</td>
      <td>${p.lamp_type}</td>
      <td>${expiry}</td>
    </tr>`;
  }).join('');

  const critCount = lights.filter(f => f.properties.status === 'critical').length;
  const warnCount = lights.filter(f => f.properties.status === 'warning').length;

  return {
    html: `<strong>${lights.length} streetlights</strong> need attention — ${critCount} critical (past end of life), ${warnCount} warning (≤ 2 years remaining).
    <table>
      <tr><th>ID</th><th>Street</th><th>Type</th><th>Expires</th></tr>
      ${rows}
    </table>`,
    ids: lights.map(f => f.properties.id)
  };
}

function _queryUninspectedManholes() {
  const now = new Date();
  const manholes = _features
    .filter(f => f.properties.asset_type === 'manhole' &&
      (f.properties.status === 'critical' || f.properties.status === 'warning'))
    .map(f => {
      const months = (now - new Date(f.properties.last_inspection)) / (1000 * 60 * 60 * 24 * 30.44);
      return { ...f, months };
    })
    .sort((a, b) => b.months - a.months);

  if (!manholes.length) {
    return { html: 'All manholes have been inspected within the past 12 months.', ids: [] };
  }

  const rows = manholes.map(({ properties: p, months }) =>
    `<tr>
      <td>${_statusDot(p.status)}${p.id}</td>
      <td>${p.street}</td>
      <td>${p.network_type}</td>
      <td>${Math.round(months)} mo</td>
    </tr>`
  ).join('');

  return {
    html: `<strong>${manholes.length} manholes</strong> overdue for inspection.
    <table>
      <tr><th>ID</th><th>Street</th><th>Network</th><th>Last seen</th></tr>
      ${rows}
    </table>`,
    ids: manholes.map(f => f.properties.id)
  };
}

function _queryWorstRoads() {
  const roads = _features
    .filter(f => f.properties.asset_type === 'road')
    .sort((a, b) => b.properties.degradation_index - a.properties.degradation_index)
    .slice(0, 6);

  const rows = roads.map(f => {
    const p = f.properties;
    return `<tr>
      <td>${_statusDot(p.status)}${p.id}</td>
      <td>${p.label}</td>
      <td>${p.degradation_index}/10</td>
      <td>${p.year_last_resurfacing}</td>
    </tr>`;
  }).join('');

  const worst = roads[0].properties;
  return {
    html: `Worst road: <strong>${worst.label}</strong> (degradation ${worst.degradation_index}/10, last resurfaced ${worst.year_last_resurfacing}).
    <table>
      <tr><th>ID</th><th>Road</th><th>Index</th><th>Last resurfaced</th></tr>
      ${rows}
    </table>`,
    ids: roads.map(f => f.properties.id)
  };
}

function _queryRiskyTrees() {
  const trees = _features
    .filter(f => f.properties.asset_type === 'tree' && f.properties.alerts.length > 0)
    .sort((a, b) => b.properties.alerts.length - a.properties.alerts.length);

  if (!trees.length) {
    return { html: 'No trees have active risk alerts.', ids: [] };
  }

  const rows = trees.map(f => {
    const p = f.properties;
    return `<tr>
      <td>${_statusDot(p.status)}${p.id}</td>
      <td>${p.common_name}</td>
      <td>${p.street}</td>
      <td>${p.alerts.join(', ')}</td>
    </tr>`;
  }).join('');

  return {
    html: `<strong>${trees.length} trees</strong> have active risk alerts.
    <table>
      <tr><th>ID</th><th>Species</th><th>Street</th><th>Alerts</th></tr>
      ${rows}
    </table>`,
    ids: trees.map(f => f.properties.id)
  };
}

function _queryCostEstimate() {
  const COSTS = {
    streetlight_replace: 2500,
    manhole_inspect: 150,
    road_resurface_per_sqm: 45,
    road_avg_width_m: 6,
    tree_intervention: 500
  };

  const critLights = _features.filter(f =>
    f.properties.asset_type === 'streetlight' && f.properties.status === 'critical').length;
  const warnLights = _features.filter(f =>
    f.properties.asset_type === 'streetlight' && f.properties.status === 'warning').length;
  const critManholes = _features.filter(f =>
    f.properties.asset_type === 'manhole' &&
    (f.properties.status === 'critical' || f.properties.status === 'warning')).length;
  const critRoads = _features.filter(f =>
    f.properties.asset_type === 'road' && f.properties.status === 'critical');
  const critTrees = _features.filter(f =>
    f.properties.asset_type === 'tree' && f.properties.status === 'critical').length;

  const lightCost = (critLights + warnLights) * COSTS.streetlight_replace;
  const manholeCost = critManholes * COSTS.manhole_inspect;
  const roadCost = critRoads.reduce((sum, f) =>
    sum + f.properties.length_m * COSTS.road_avg_width_m * COSTS.road_resurface_per_sqm, 0);
  const treeCost = critTrees * COSTS.tree_intervention;
  const total = lightCost + manholeCost + roadCost + treeCost;

  const fmt = n => '€' + n.toLocaleString('en-GB');

  return {
    html: `Estimated extraordinary maintenance budget for this year:
    <table>
      <tr><th>Category</th><th>Items</th><th>Estimate</th></tr>
      <tr><td>Streetlights (replace)</td><td>${critLights + warnLights}</td><td>${fmt(lightCost)}</td></tr>
      <tr><td>Manholes (inspect)</td><td>${critManholes}</td><td>${fmt(manholeCost)}</td></tr>
      <tr><td>Roads (resurface)</td><td>${critRoads.length}</td><td>${fmt(Math.round(roadCost))}</td></tr>
      <tr><td>Trees (intervention)</td><td>${critTrees}</td><td>${fmt(treeCost)}</td></tr>
      <tr><td><strong>Total</strong></td><td></td><td><strong>${fmt(Math.round(total))}</strong></td></tr>
    </table>
    <small style="color:#9ca3af">Unit costs: streetlight €2,500 · manhole inspection €150 · resurfacing €45/m² · tree €500</small>`,
    ids: []
  };
}
