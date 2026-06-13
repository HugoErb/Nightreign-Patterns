import { strict as assert } from 'node:assert';
import { spawnMarkerPosition } from './spawn-marker-position.ts';
import type { SpawnPoint } from './models/nightreign.models.ts';

function assertPosition(spawn: SpawnPoint, mode: 'blank-map' | 'pattern-map', expectedX: number, expectedY: number): void {
  const position = spawnMarkerPosition(spawn, mode);
  assert.equal(position?.id, spawn.id);
  assert.equal(position?.name, spawn.name);
  assert.ok(position && Math.abs(position.x - expectedX) < 0.0000000001);
  assert.ok(position && Math.abs(position.y - expectedY) < 0.0000000001);
}

const eastOfCavalryBridge: SpawnPoint = {
  id: 'east-of-cavalry-bridge',
  name: 'East of Cavalry Bridge',
  x: 0.859546925566343,
  y: 0.5857605177993528,
};

const aboveStormhillTunnelEntrance: SpawnPoint = {
  id: 'above-stormhill-tunnel-entrance',
  name: 'Above Stormhill Tunnel Entrance',
  x: 0.20841423948220065,
  y: 0.3553398058252427,
};

const farSouthwest: SpawnPoint = {
  id: 'far-southwest',
  name: 'Far Southwest',
  x: 0.20388349514563106,
  y: 0.7307443365695792,
};

const minorErdtree: SpawnPoint = {
  id: 'minor-erdtree',
  name: 'Minor Erdtree',
  x: 0.5825242718446602,
  y: 0.662135922330097,
};

const northeastOfSaintsbridge: SpawnPoint = {
  id: 'northeast-of-saintsbridge',
  name: 'Northeast of Saintsbridge',
  x: 0.5650485436893204,
  y: 0.20129449838187703,
};

const southeastOfLake: SpawnPoint = {
  id: 'southeast-of-lake',
  name: 'Southeast of Lake',
  x: 0.6019417475728155,
  y: 0.8588996763754045,
};

const stormhillSouthOfGate: SpawnPoint = {
  id: 'stormhill-south-of-gate',
  name: 'Stormhill South of Gate',
  x: 0.37152103559870554,
  y: 0.4168284789644013,
};

const westOfWarmastersShack: SpawnPoint = {
  id: 'west-of-warmaster-s-shack',
  name: "West of Warmaster's Shack",
  x: 0.2045307443365696,
  y: 0.5838187702265372,
};

assertPosition(eastOfCavalryBridge, 'blank-map', 0.5825242718446602, 0.662135922330097);
assertPosition(aboveStormhillTunnelEntrance, 'blank-map', 0.20841423948220065, 0.3553398058252427);
assertPosition(farSouthwest, 'blank-map', 0.20388349514563106, 0.7307443365695792);
assertPosition(minorErdtree, 'blank-map', 0.859546925566343, 0.5857605177993528);
assertPosition(eastOfCavalryBridge, 'pattern-map', 0.5625242718446602, 0.662135922330097);
assertPosition(aboveStormhillTunnelEntrance, 'pattern-map', 0.20841423948220065, 0.3553398058252427);
assertPosition(farSouthwest, 'pattern-map', 0.20388349514563106, 0.7);
assertPosition(minorErdtree, 'pattern-map', 0.82, 0.5857605177993528);
assertPosition(northeastOfSaintsbridge, 'pattern-map', 0.525, 0.20129449838187703);
assertPosition(southeastOfLake, 'blank-map', 0.6019417475728155, 0.8588996763754045);
assertPosition(southeastOfLake, 'pattern-map', 0.56, 0.8);
assertPosition(stormhillSouthOfGate, 'blank-map', 0.2045307443365696, 0.5838187702265372);
assertPosition(stormhillSouthOfGate, 'pattern-map', 0.20453074433656958, 0.555);
assertPosition(westOfWarmastersShack, 'blank-map', 0.37152103559870554, 0.4168284789644013);
assertPosition(westOfWarmastersShack, 'pattern-map', 0.3515210355987055, 0.4168284789644013);
