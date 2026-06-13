import { strict as assert } from 'node:assert';
import { filterSpawnPointsForMapType, isSpawnPointAvailableForMapType } from './spawn-point-filters.ts';
import type { SpawnPoint } from './models/nightreign.models.ts';

const spawnPoints: SpawnPoint[] = [
  { id: 'east-of-cavalry-bridge', name: 'East of Cavalry Bridge' },
  { id: 'northeast', name: 'Northeast' },
  { id: 'south', name: 'South' },
  { id: 'southwest', name: 'Southwest' },
];

assert.deepEqual(
  filterSpawnPointsForMapType(spawnPoints, 'default').map((spawn) => spawn.id),
  ['east-of-cavalry-bridge'],
);

assert.deepEqual(
  filterSpawnPointsForMapType(spawnPoints, 'great-hollow').map((spawn) => spawn.id),
  ['northeast', 'south', 'southwest'],
);

assert.equal(isSpawnPointAvailableForMapType('south', 'default'), false);
assert.equal(isSpawnPointAvailableForMapType('south', 'great-hollow'), true);
assert.equal(isSpawnPointAvailableForMapType('east-of-cavalry-bridge', 'great-hollow'), false);
