import {
  assetUrl,
  blankMapImageForMapType,
  filterSpawnPointsForMapType,
  isSpawnPointAvailableForMapType,
  patternEventDisplay,
  patternMatchesFilters,
  bossNegationGroups,
  bossResistances,
  bossTypeName,
  effectIconUrl,
  formatPartyValues,
  updatePatternCardSelection,
  spawnMarkerPosition,
} from './logic.js';

const DATA_FILES = {
  nightlords: 'src/assets/data/nightlords.json',
  nightlordBosses: 'src/assets/data/nightlord-bosses.json',
  mapTypes: 'src/assets/data/map-types.json',
  spawnPoints: 'src/assets/data/spawn-points.json',
  events: 'src/assets/data/events.json',
  patterns: 'src/assets/data/patterns.json',
};

const MAP_FIT_PADDING_PX = 2;

const state = {
  data: null,
  filters: {
    nightlordId: '',
    mapTypeId: 'default',
    spawnPointId: '',
  },
  displayedPattern: null,
  zoom: 0.86,
  offsetX: 0,
  offsetY: 0,
  dragging: false,
  dragStart: { x: 0, y: 0, offsetX: 0, offsetY: 0 },
  nightlordsPanelVisible: true,
};

const els = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  bindElements();
  bindStaticEvents();

  try {
    state.data = await loadData();
    populateFilters();
    renderNightlordCompendium();
    renderAll();
    fitMapWhenImageIsReady();
  } catch {
    document.body.innerHTML = '<div class="load-error">Unable to load local JSON files.</div>';
  }
}

function bindElements() {
  Object.assign(els, {
    appShell: document.getElementById('app-shell'),
    patternCount: document.getElementById('pattern-count'),
    nightlordSelect: document.getElementById('nightlord-select'),
    nightlordButton: document.getElementById('nightlord-button'),
    nightlordMenu: document.getElementById('nightlord-menu'),
    selectedNightlordIcon: document.getElementById('selected-nightlord-icon'),
    selectedNightlordName: document.getElementById('selected-nightlord-name'),
    mapTypeFilter: document.getElementById('map-type-filter'),
    spawnFilter: document.getElementById('spawn-filter'),
    blankMapButton: document.getElementById('blank-map-button'),
    resetButton: document.getElementById('reset-button'),
    mapSubtitle: document.getElementById('map-subtitle'),
    mapViewport: document.getElementById('map-viewport'),
    mapStage: document.getElementById('map-stage'),
    mapImage: document.getElementById('map-image'),
    spawnLayer: document.getElementById('spawn-layer'),
    patternList: document.getElementById('pattern-list'),
    nightlordsPanel: document.querySelector('.nightlords-panel'),
    nightlordsPanelToggle: document.getElementById('nightlords-panel-toggle'),
    nightlordCompendiumList: document.getElementById('nightlord-compendium-list'),
    zoomIn: document.getElementById('zoom-in'),
    zoomOut: document.getElementById('zoom-out'),
    resetView: document.getElementById('reset-view'),
  });
}

function bindStaticEvents() {
  els.nightlordButton.addEventListener('click', () => setNightlordMenuOpen(els.nightlordMenu.hidden));

  els.nightlordsPanelToggle.addEventListener('click', () => {
    state.nightlordsPanelVisible = !state.nightlordsPanelVisible;
    renderNightlordsPanelVisibility({ fitMap: true });
  });

  els.nightlordCompendiumList.addEventListener('click', (event) => {
    const card = event.target.closest('.nightlord-boss-card');
    if (state.nightlordsPanelVisible || !card) {
      return;
    }
    event.preventDefault();
    card.open = true;
    state.nightlordsPanelVisible = true;
    renderNightlordsPanelVisibility({ fitMap: true });
  });

  document.addEventListener('click', (event) => {
    if (!els.nightlordSelect.contains(event.target)) {
      setNightlordMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setNightlordMenuOpen(false);
    }
  });

  els.mapTypeFilter.addEventListener('change', () => {
    state.filters.mapTypeId = els.mapTypeFilter.value;
    if (state.filters.spawnPointId && !isSpawnPointAvailableForMapType(state.filters.spawnPointId, state.filters.mapTypeId)) {
      state.filters.spawnPointId = '';
    }
    renderAll();
  });

  els.spawnFilter.addEventListener('change', () => {
    state.displayedPattern = null;
    state.filters.spawnPointId = els.spawnFilter.value;
    renderAll();
  });

  els.blankMapButton.addEventListener('click', () => {
    state.displayedPattern = null;
    renderAll();
  });

  els.resetButton.addEventListener('click', (event) => {
    state.filters = { nightlordId: '', mapTypeId: 'default', spawnPointId: '' };
    state.displayedPattern = null;
    renderAll();
    event.currentTarget.blur();
  });

  els.zoomIn.addEventListener('click', () => {
    state.zoom = Math.min(4, roundZoom(state.zoom + 0.2));
    updateMapTransform();
  });

  els.zoomOut.addEventListener('click', () => {
    state.zoom = Math.max(0.6, roundZoom(state.zoom - 0.2));
    updateMapTransform();
  });

  els.resetView.addEventListener('click', () => {
    fitMapToViewport();
  });

  els.mapViewport.addEventListener('wheel', (event) => {
    event.preventDefault();
    state.zoom = event.deltaY < 0 ? Math.min(4, roundZoom(state.zoom + 0.2)) : Math.max(0.6, roundZoom(state.zoom - 0.2));
    updateMapTransform();
  }, { passive: false });

  els.mapViewport.addEventListener('mousedown', (event) => {
    state.dragging = true;
    state.dragStart = { x: event.clientX, y: event.clientY, offsetX: state.offsetX, offsetY: state.offsetY };
    els.mapViewport.classList.add('dragging');
  });

  window.addEventListener('mousemove', (event) => {
    if (!state.dragging) {
      return;
    }
    state.offsetX = state.dragStart.offsetX + event.clientX - state.dragStart.x;
    state.offsetY = state.dragStart.offsetY + event.clientY - state.dragStart.y;
    updateMapTransform();
  });

  window.addEventListener('mouseup', () => {
    state.dragging = false;
    els.mapViewport.classList.remove('dragging');
  });
}

async function loadData() {
  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, url]) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Cannot load ${url}`);
      }
      return [key, await response.json()];
    }),
  );
  return Object.fromEntries(entries);
}

function populateFilters() {
  els.mapTypeFilter.replaceChildren(...state.data.mapTypes.map((mapType) => option(mapType.id, mapType.name)));
  renderNightlordMenu();
}

function renderAll() {
  renderNightlordSelection();
  renderSpawnOptions();
  renderMap();
  renderNightlordCompendium();
  renderNightlordsPanelVisibility();
  renderPatterns();
}

function renderNightlordMenu() {
  const unknown = document.createElement('button');
  unknown.type = 'button';
  unknown.className = 'nightlord-option';
  unknown.innerHTML = '<span class="unknown-icon">?</span><span>Unknown</span>';
  unknown.addEventListener('click', () => selectNightlord(''));

  const options = state.data.nightlords.map((nightlord) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nightlord-option';
    button.innerHTML = `<img src="${assetUrl(nightlord.imageUrl)}" alt=""><span>${escapeHtml(nightlord.name)}</span>`;
    button.addEventListener('click', () => selectNightlord(nightlord.id));
    return button;
  });

  els.nightlordMenu.replaceChildren(unknown, ...options);
}

function renderNightlordSelection() {
  const nightlord = nightlordById(state.filters.nightlordId);
  if (nightlord) {
    els.selectedNightlordIcon.outerHTML = `<img id="selected-nightlord-icon" src="${assetUrl(nightlord.imageUrl)}" alt="${escapeHtml(nightlord.name)}">`;
    els.selectedNightlordIcon = document.getElementById('selected-nightlord-icon');
    els.selectedNightlordName.textContent = nightlord.name;
  } else {
    els.selectedNightlordIcon.outerHTML = '<span class="unknown-icon" id="selected-nightlord-icon">?</span>';
    els.selectedNightlordIcon = document.getElementById('selected-nightlord-icon');
    els.selectedNightlordName.textContent = 'Unknown';
  }
}

function renderSpawnOptions() {
  const spawns = filterSpawnPointsForMapType(state.data.spawnPoints, state.filters.mapTypeId);
  els.spawnFilter.replaceChildren(option('', 'All / unknown'), ...spawns.map((spawn) => option(spawn.id, spawn.name)));
  els.spawnFilter.value = state.filters.spawnPointId;
  els.mapTypeFilter.value = state.filters.mapTypeId;
}

function renderMap() {
  const pattern = state.displayedPattern;
  const selectedSpawnName = spawnName(state.filters.spawnPointId);

  if (pattern) {
    els.mapSubtitle.innerHTML = `Displayed pattern: <span>#${escapeHtml(pattern.id)}</span>`;
    els.mapImage.src = assetUrl(pattern.imageUrl);
    els.mapImage.alt = `Pattern ${pattern.id}`;
    renderPatternSpawn(pattern);
  } else {
    els.mapSubtitle.innerHTML = `Selected spawn: <span>${escapeHtml(selectedSpawnName || 'unknown / undefined')}</span>`;
    els.mapImage.src = blankMapImageForMapType(state.filters.mapTypeId);
    els.mapImage.alt = 'Blank spawn map';
    renderBlankMapSpawns();
  }

  updateMapTransform();
}

function renderBlankMapSpawns() {
  const markers = filterSpawnPointsForMapType(state.data.spawnPoints, state.filters.mapTypeId)
    .map((spawn) => spawnMarkerPosition(spawn, 'blank-map'))
    .filter(Boolean)
    .map((spawn) => createSpawnMarker(spawn, {
      selected: spawn.id === state.filters.spawnPointId,
      asButton: true,
      onClick: () => {
        state.displayedPattern = null;
        state.filters.spawnPointId = spawn.id;
        renderAll();
      },
    }));

  els.spawnLayer.replaceChildren(...markers);
}

function renderPatternSpawn(pattern) {
  const spawn = state.data.spawnPoints.find((item) => item.id === pattern.spawnPointId);
  const position = spawnMarkerPosition(spawn, 'pattern-map');
  els.spawnLayer.replaceChildren(position ? createSpawnMarker(position, { pattern: true }) : document.createDocumentFragment());
}

function createSpawnMarker(spawn, { selected = false, pattern = false, asButton = false, onClick = null } = {}) {
  const marker = document.createElement(asButton ? 'button' : 'div');
  if (asButton) {
    marker.type = 'button';
  }
  marker.className = `spawn-marker${selected ? ' selected' : ''}${pattern ? ' pattern' : ''}`;
  marker.style.left = `${spawn.x * 100}%`;
  marker.style.top = `${spawn.y * 100}%`;
  marker.title = spawn.name;
  marker.innerHTML = `<span class="spawn-icon"></span><span class="spawn-tooltip">${escapeHtml(spawn.name)}</span>`;

  if (onClick) {
    marker.addEventListener('mousedown', (event) => event.stopPropagation());
    marker.addEventListener('click', (event) => {
      event.stopPropagation();
      onClick();
    });
  }

  return marker;
}

function renderPatterns() {
  const patterns = state.data.patterns.filter((pattern) => patternMatchesFilters(pattern, state.filters));
  els.patternCount.textContent = String(patterns.length);

  if (!patterns.length) {
    els.patternList.innerHTML = '<div class="empty-message">No pattern matches the filters.</div>';
    return;
  }

  els.patternList.replaceChildren(...patterns.map(createPatternCard));
}

function createPatternCard(pattern) {
  const card = document.createElement('button');
  const selected = state.displayedPattern?.id === pattern.id && state.displayedPattern?.nightlordId === pattern.nightlordId;
  card.type = 'button';
  card.className = `pattern-card${selected ? ' selected' : ''}`;
  card.dataset.patternId = String(pattern.id);
  card.dataset.nightlordId = pattern.nightlordId;
  card.innerHTML = `
    <div class="pattern-card-top">
      <span class="pattern-id">#${escapeHtml(pattern.id)}</span>
      <span class="pattern-map-type">${escapeHtml(mapTypeName(pattern.mapTypeId))}</span>
    </div>
    <div class="pattern-nightlord">${escapeHtml(nightlordDisplayName(pattern.nightlordId))}</div>
    <div class="pattern-spawn">${escapeHtml(spawnName(pattern.spawnPointId) || 'Unknown spawn')}</div>
    <div class="pattern-event">${escapeHtml(eventNames(pattern.eventIds).join(', ') || 'No event')}</div>
  `;
  card.querySelector('.pattern-event').textContent = patternEventDisplay(pattern, eventNames(pattern.eventIds));
  card.addEventListener('click', () => {
    state.displayedPattern = pattern;
    renderMap();
    updatePatternCardSelection(els.patternList, state.displayedPattern);
  });
  return card;
}

function renderNightlordCompendium() {
  const bosses = state.filters.nightlordId
    ? state.data.nightlordBosses.filter((boss) => boss.nightlordId === state.filters.nightlordId)
    : state.data.nightlordBosses;
  els.nightlordCompendiumList.replaceChildren(...bosses.map(createNightlordBossCard));
}

function renderNightlordsPanelVisibility({ fitMap = false } = {}) {
  const expanded = state.nightlordsPanelVisible;
  const label = expanded ? 'Collapse Nightlords Compendium' : 'Expand Nightlords Compendium';
  els.appShell.classList.toggle('nightlords-collapsed', !expanded);
  els.nightlordsPanel.classList.toggle('collapsed', !expanded);
  els.nightlordsPanelToggle.setAttribute('aria-expanded', String(expanded));
  els.nightlordsPanelToggle.setAttribute('aria-label', label);
  els.nightlordsPanelToggle.title = label;
  if (fitMap) {
    requestAnimationFrame(() => requestAnimationFrame(fitMapToViewport));
  }
}

function createNightlordBossCard(boss) {
  const nightlord = nightlordById(boss.nightlordId);
  const card = document.createElement('details');
  card.className = 'nightlord-boss-card';
  card.open = state.filters.nightlordId === boss.nightlordId;
  card.title = boss.name;
  card.innerHTML = `
    <summary class="nightlord-boss-header">
      <img src="${assetUrl(nightlord?.imageUrl)}" alt="${escapeHtml(boss.name)}">
      <div>
        <h3>${escapeHtml(boss.name)}</h3>
      </div>
    </summary>
    <div class="nightlord-boss-variants">
      ${boss.npcs.map((npc) => nightlordNpcHtml(boss, npc)).join('')}
    </div>
  `;
  return card;
}

function nightlordNpcHtml(boss, npc) {
  const negations = bossNegationGroups(npc);
  const resistances = bossResistances(npc);
  return `
    <section class="nightlord-npc-card${npc.type === 8 ? ' everdark' : ''}">
      <div class="nightlord-npc-top">
        <span>${escapeHtml(bossTypeName(npc.type))}</span>
      </div>
      ${statGroupHtml('Weak Against', negations.weakAgainst, 'weak')}
      ${statGroupHtml('Strong Against', negations.strongAgainst, 'strong')}
      ${statGroupHtml('Resistances', resistances, 'resistance')}
      <div class="nightlord-meta-grid">
        <div><span>HP</span><b>${escapeHtml(formatPartyValues(npc.hp))}</b></div>
      </div>
    </section>
  `;
}

function statGroupHtml(title, items, variant) {
  const emptyLabel = variant === 'weak'
    ? 'No weaknesses'
    : 'No resistances';
  return `
    <div class="nightlord-stat-group">
      <span>${escapeHtml(title)}</span>
      <div class="nightlord-stat-list">
        ${items.length ? items.map((item) => statPillHtml(item, variant)).join('') : `<em>${emptyLabel}</em>`}
      </div>
    </div>
  `;
}

function statPillHtml(item, variant) {
  const value = variant === 'resistance' ? item.value : `${item.value}%`;
  const iconUrl = effectIconUrl(item.id);
  return `
    <div class="nightlord-stat-pill ${variant}${value === 'Immune' ? ' immune' : ''}">
      ${iconUrl ? `<img src="${escapeHtml(iconUrl)}" alt="">` : ''}
      <span>${escapeHtml(item.name)}</span>
      <b>${escapeHtml(value)}</b>
    </div>
  `;
}

function selectNightlord(nightlordId) {
  state.filters.nightlordId = nightlordId;
  setNightlordMenuOpen(false);
  renderAll();
}

function setNightlordMenuOpen(open) {
  els.nightlordMenu.hidden = !open;
  els.nightlordButton.setAttribute('aria-expanded', String(open));
}

function fitMapToViewport() {
  const viewport = els.mapViewport.getBoundingClientRect();
  const availableWidth = Math.max(0, viewport.width - MAP_FIT_PADDING_PX);
  const availableHeight = Math.max(0, viewport.height - MAP_FIT_PADDING_PX);
  const stageWidth = els.mapStage.offsetWidth;
  const imageRatio = els.mapImage.naturalWidth && els.mapImage.naturalHeight
    ? els.mapImage.naturalHeight / els.mapImage.naturalWidth
    : 1;
  const stageHeight = stageWidth * imageRatio;

  if (!viewport.width || !viewport.height || !stageWidth || !stageHeight) {
    return;
  }

  state.zoom = roundZoom(Math.min(
    4,
    Math.max(
      0.2,
      Math.min(availableWidth / stageWidth, availableHeight / stageHeight),
    ),
  ));
  state.offsetX = 0;
  state.offsetY = 0;
  updateMapTransform();
}

function updateMapTransform() {
  els.mapStage.style.transform = `translate(-50%, -50%) translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.zoom})`;
}

function fitMapWhenImageIsReady() {
  if (els.mapImage.complete) {
    requestAnimationFrame(fitMapToViewport);
    return;
  }

  els.mapImage.addEventListener('load', () => requestAnimationFrame(fitMapToViewport), { once: true });
}

function option(value, label) {
  const item = document.createElement('option');
  item.value = value;
  item.textContent = label;
  return item;
}

function nightlordById(id) {
  return state.data.nightlords.find((item) => item.id === id);
}

function nightlordDisplayName(id) {
  const nightlord = nightlordById(id);
  if (!nightlord) {
    return id;
  }
  return `${nightlord.name}${nightlord.alternateName ? ` (${nightlord.alternateName})` : ''}`;
}

function mapTypeName(id) {
  return state.data.mapTypes.find((item) => item.id === id)?.name ?? id;
}

function spawnName(id) {
  return id ? state.data.spawnPoints.find((item) => item.id === id)?.name ?? id : '';
}

function eventNames(ids) {
  return ids.map((id) => state.data.events.find((event) => event.id === id)?.name ?? id);
}

function roundZoom(value) {
  return Number(value.toFixed(2));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
