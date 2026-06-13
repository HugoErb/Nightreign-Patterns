import type { SpawnPoint } from './models/nightreign.models';

const GREAT_HOLLOW_SPAWN_IDS = new Set(['northeast', 'south', 'southwest']);

export function filterSpawnPointsForMapType(spawnPoints: SpawnPoint[], mapTypeId: string): SpawnPoint[] {
  return spawnPoints.filter((spawn) => isSpawnPointAvailableForMapType(spawn.id, mapTypeId));
}

export function isSpawnPointAvailableForMapType(spawnPointId: string, mapTypeId: string): boolean {
  const isGreatHollowSpawn = GREAT_HOLLOW_SPAWN_IDS.has(spawnPointId);
  return mapTypeId === 'great-hollow' ? isGreatHollowSpawn : !isGreatHollowSpawn;
}
