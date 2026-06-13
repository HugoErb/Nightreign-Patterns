import { strict as assert } from 'node:assert';
import test from 'node:test';
import {
  assetUrl,
  blankMapImageForMapType,
  filterSpawnPointsForMapType,
  isSpawnPointAvailableForMapType,
  patternMatchesFilters,
  spawnMarkerPosition,
} from './logic.js';

const spawnPoints = [
  { id: 'east-of-cavalry-bridge', name: 'East of Cavalry Bridge', x: 0.859546925566343, y: 0.5857605177993528 },
  { id: 'minor-erdtree', name: 'Minor Erdtree', x: 0.5825242718446602, y: 0.662135922330097 },
  { id: 'south', name: 'South', x: 0.55, y: 0.79 },
  { id: 'northeast', name: 'Northeast', x: 0.74, y: 0.28 },
  { id: 'southwest', name: 'Southwest', x: 0.27, y: 0.77 },
  { id: 'stormhill-south-of-gate', name: 'Stormhill South of Gate', x: 0.37152103559870554, y: 0.4168284789644013 },
  { id: 'west-of-warmaster-s-shack', name: "West of Warmaster's Shack", x: 0.2045307443365696, y: 0.5838187702265372 },
  { id: 'far-southwest', name: 'Far Southwest', x: 0.20388349514563106, y: 0.7307443365695792 },
  { id: 'southeast-of-lake', name: 'Southeast of Lake', x: 0.6019417475728155, y: 0.8588996763754045 },
  { id: 'above-stormhill-tunnel-entrance', name: 'Above Stormhill Tunnel Entrance', x: 0.20841423948220065, y: 0.3553398058252427 },
];

function assertPosition(spawn, mode, expectedX, expectedY) {
  const position = spawnMarkerPosition(spawn, mode);
  assert.equal(position.id, spawn.id);
  assert.ok(Math.abs(position.x - expectedX) < 0.0000000001);
  assert.ok(Math.abs(position.y - expectedY) < 0.0000000001);
}

test('asset paths are adapted for root GitHub Pages hosting', () => {
  assert.equal(assetUrl('assets/images/pattern/000.jpg'), 'src/assets/images/pattern/000.jpg');
});

test('blank map image depends on map type', () => {
  assert.equal(blankMapImageForMapType('great-hollow'), 'src/assets/images/map/great-hollow.webp');
  assert.equal(blankMapImageForMapType('default'), 'src/assets/images/map/default.webp');
});

test('Great Hollow has its own spawn list', () => {
  assert.deepEqual(filterSpawnPointsForMapType(spawnPoints, 'great-hollow').map((spawn) => spawn.id), ['south', 'northeast', 'southwest']);
  assert.equal(isSpawnPointAvailableForMapType('south', 'default'), false);
  assert.equal(isSpawnPointAvailableForMapType('east-of-cavalry-bridge', 'great-hollow'), false);
});

test('spawn positions keep blank map and pattern map offsets separate', () => {
  assertPosition(spawnPoints[0], 'blank-map', 0.5825242718446602, 0.662135922330097);
  assertPosition(spawnPoints[0], 'pattern-map', 0.5625242718446602, 0.662135922330097);
  assertPosition(spawnPoints[1], 'blank-map', 0.859546925566343, 0.5857605177993528);
  assertPosition(spawnPoints[1], 'pattern-map', 0.82, 0.5857605177993528);
  assertPosition(spawnPoints[6], 'blank-map', 0.20841423948220065, 0.3553398058252427);
  assertPosition(spawnPoints[5], 'pattern-map', 0.20453074433656958, 0.555);
  assertPosition(spawnPoints[6], 'pattern-map', 0.20841423948220064, 0.3553398058252427);
  assertPosition(spawnPoints[7], 'pattern-map', 0.20388349514563106, 0.7);
  assertPosition(spawnPoints[8], 'pattern-map', 0.56, 0.8);
  assertPosition(spawnPoints[9], 'blank-map', 0.37152103559870554, 0.4168284789644013);
  assertPosition(spawnPoints[9], 'pattern-map', 0.3515210355987055, 0.4168284789644013);
});

test('pattern filters match selected values', () => {
  const pattern = { nightlordId: 'gladius', mapTypeId: 'default', spawnPointId: 'south' };
  assert.equal(patternMatchesFilters(pattern, { nightlordId: 'gladius', mapTypeId: 'default', spawnPointId: 'south' }), true);
  assert.equal(patternMatchesFilters(pattern, { nightlordId: 'adel', mapTypeId: 'default', spawnPointId: 'south' }), false);
});
