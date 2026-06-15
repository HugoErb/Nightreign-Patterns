export const GREAT_HOLLOW_SPAWN_IDS = new Set(['northeast', 'south', 'southwest']);

export const PATTERN_MAP_X_OFFSET = -0.02;

export const BLANK_MAP_OVERRIDES = {
  'above-stormhill-tunnel-entrance': { x: 0.37152103559870554, y: 0.4168284789644013 },
  'east-of-cavalry-bridge': { x: 0.5825242718446602, y: 0.662135922330097 },
  'minor-erdtree': { x: 0.859546925566343, y: 0.5857605177993528 },
  'stormhill-south-of-gate': { x: 0.2045307443365696, y: 0.5838187702265372 },
  'west-of-warmaster-s-shack': { x: 0.20841423948220065, y: 0.3553398058252427 },
};

export const PATTERN_MAP_OVERRIDES = {
  'above-stormhill-tunnel-entrance': { x: 0.37152103559870554, y: 0.3968284789644013 },
  'below-summonwater-hawk': { x: 0.7088025889967638, y: 0.3741100323624595 },
  'east-of-cavalry-bridge': { x: 0.5625242718446602, y: 0.642135922330097 },
  'far-southwest': { x: 0.22388349514563105, y: 0.7 },
  'minor-erdtree': { x: 0.82, y: 0.5857605177993528 },
  'northeast-of-saintsbridge': { x: 0.545 },
  'southeast-of-lake': { x: 0.58, y: 0.8 },
  'stormhill-south-of-gate': { x: 0.22453074433656958, y: 0.555 },
  'west-of-warmaster-s-shack': { x: 0.22841423948220064, y: 0.3553398058252427 },
};

export const ATTACK_TYPE_NAMES = {
  0: 'Slash',
  1: 'Strike',
  2: 'Pierce',
  3: 'Standard',
};

export const ELEMENTAL_TYPE_NAMES = {
  10: 'Magic',
  11: 'Fire',
  12: 'Lightning',
  13: 'Holy',
  20: 'Poison',
  21: 'Scarlet Rot',
  22: 'Bloodloss',
  23: 'Frostbite',
  24: 'Sleep',
  25: 'Madness',
  26: 'Blight',
};

export const BOSS_TYPE_NAMES = {
  7: 'Final Boss',
  8: 'Everdark Boss',
};

export const EFFECT_ICON_URLS = {
  0: 'https://relics.pro/assets/attack_slash-CI9F4dry.png',
  1: 'https://relics.pro/assets/attack_strike-Cgph_98_.png',
  2: 'https://relics.pro/assets/attack_pierce-DGUr4adj.png',
  3: 'https://relics.pro/assets/attack_standard-D-05LDa8.png',
  10: 'https://relics.pro/assets/status_magic-DjMV7Yt_.png',
  11: 'https://relics.pro/assets/status_fire-BF8ztGvW.png',
  12: 'https://relics.pro/assets/status_lightning-Ckn6M2XK.png',
  13: 'https://relics.pro/assets/status_holy-BVwpk6da.png',
  20: 'https://relics.pro/assets/status_poison-Ds7gnFRt.png',
  21: 'https://relics.pro/assets/status_rot-CD6o1CEq.png',
  22: 'https://relics.pro/assets/status_bleed-Dm1BTG_P.png',
  23: 'https://relics.pro/assets/status_frost-BL1dbQpR.png',
  24: 'https://relics.pro/assets/status_sleep-DbyIubp3.png',
  25: 'https://relics.pro/assets/status_madness-BKpi4YEH.png',
};

export function assetUrl(url) {
  return url?.startsWith('assets/') ? `src/${url}` : url;
}

export function bossNegationGroups(bossNpc) {
  const weakAgainst = [];
  const strongAgainst = [];
  collectNegations(bossNpc.attackNegations, ATTACK_TYPE_NAMES, 'attack', weakAgainst, strongAgainst);
  collectNegations(bossNpc.elementalNegations, ELEMENTAL_TYPE_NAMES, 'elemental', weakAgainst, strongAgainst);
  return { weakAgainst, strongAgainst };
}

export function bossResistances(bossNpc) {
  return Object.entries(bossNpc.resistances ?? {})
    .map(([id, values]) => ({
      id,
      name: ELEMENTAL_TYPE_NAMES[id] ?? id,
      value: formatResistanceValue(values),
      category: 'elemental',
    }))
    .filter((item) => item.value && item.id !== '26');
}

export function effectIconUrl(id) {
  return EFFECT_ICON_URLS[id] ?? '';
}

export function bossTypeName(type) {
  return BOSS_TYPE_NAMES[type] ?? `Type ${type}`;
}

export function formatPartyValues(values) {
  return values
    .toReversed()
    .map((value) => Number(value).toLocaleString('de-DE'))
    .join(' / ');
}

export function formatResistanceValue(values = []) {
  if (!values.length) {
    return '';
  }
  return values[0] === 999 ? 'Immune' : String(values[0]);
}

function collectNegations(negations = {}, names, category, weakAgainst, strongAgainst) {
  Object.entries(negations).forEach(([id, rawValue]) => {
    const value = Number(rawValue);
    const item = {
      id,
      name: names[id] ?? id,
      value: value < 0 ? Math.abs(value) : -value,
      category,
    };
    if (value < 0) {
      weakAgainst.push(item);
    } else if (value > 0) {
      strongAgainst.push(item);
    }
  });
}

export function blankMapImageForMapType(mapTypeId) {
  return mapTypeId === 'great-hollow' ? 'src/assets/images/map/great-hollow.webp' : 'src/assets/images/map/default.webp';
}

export function isSpawnPointAvailableForMapType(spawnPointId, mapTypeId) {
  const isGreatHollowSpawn = GREAT_HOLLOW_SPAWN_IDS.has(spawnPointId);
  return mapTypeId === 'great-hollow' ? isGreatHollowSpawn : !isGreatHollowSpawn;
}

export function filterSpawnPointsForMapType(spawnPoints, mapTypeId) {
  return spawnPoints.filter((spawn) => isSpawnPointAvailableForMapType(spawn.id, mapTypeId));
}

export function spawnMarkerPosition(spawn, mode) {
  if (typeof spawn?.x !== 'number' || typeof spawn?.y !== 'number') {
    return null;
  }

  const override = mode === 'blank-map' ? BLANK_MAP_OVERRIDES[spawn.id] : PATTERN_MAP_OVERRIDES[spawn.id];
  const x = override?.x ?? spawn.x;

  return {
    ...spawn,
    x: mode === 'pattern-map' ? x + PATTERN_MAP_X_OFFSET : x,
    y: override?.y ?? spawn.y,
  };
}

export function patternMatchesFilters(pattern, filters) {
  return (!filters.nightlordId || pattern.nightlordId === filters.nightlordId)
    && (!filters.mapTypeId || pattern.mapTypeId === filters.mapTypeId)
    && (!filters.spawnPointId || pattern.spawnPointId === filters.spawnPointId);
}

export function updatePatternCardSelection(patternList, selectedPattern) {
  const scrollTop = patternList.scrollTop;

  for (const card of patternList.querySelectorAll('.pattern-card')) {
    card.classList.toggle(
      'selected',
      Boolean(selectedPattern)
        && card.dataset.patternId === String(selectedPattern.id)
        && card.dataset.nightlordId === selectedPattern.nightlordId,
    );
  }

  patternList.scrollTop = scrollTop;
}

export function patternEventDisplay(pattern, fallbackEventNames = []) {
  if (pattern.eventText) {
    return pattern.eventText === 'None' ? 'Aucun événement' : pattern.eventText;
  }

  return fallbackEventNames.length ? fallbackEventNames.join(', ') : 'Aucun événement';
}
