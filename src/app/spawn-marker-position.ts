import type { SpawnPoint } from './models/nightreign.models';

export type SpawnMarkerMode = 'blank-map' | 'pattern-map';

export type SpawnMarkerPosition = SpawnPoint & { x: number; y: number };

const PATTERN_MAP_X_OFFSET = -0.02;

const BLANK_MAP_OVERRIDES: Record<string, { x: number; y: number }> = {
  'east-of-cavalry-bridge': { x: 0.5825242718446602, y: 0.662135922330097 },
  'minor-erdtree': { x: 0.859546925566343, y: 0.5857605177993528 },
  'stormhill-south-of-gate': { x: 0.2045307443365696, y: 0.5838187702265372 },
  'west-of-warmaster-s-shack': { x: 0.37152103559870554, y: 0.4168284789644013 },
};

const PATTERN_MAP_OVERRIDES: Record<string, Partial<{ x: number; y: number }>> = {
  'above-stormhill-tunnel-entrance': { x: 0.22841423948220064 },
  'east-of-cavalry-bridge': { x: 0.5825242718446602, y: 0.662135922330097 },
  'far-southwest': { x: 0.22388349514563105, y: 0.7 },
  'minor-erdtree': { x: 0.84, y: 0.5857605177993528 },
  'northeast-of-saintsbridge': { x: 0.545 },
  'southeast-of-lake': { x: 0.58, y: 0.8 },
  'stormhill-south-of-gate': { x: 0.22453074433656958, y: 0.555 },
  'west-of-warmaster-s-shack': { x: 0.37152103559870554, y: 0.4168284789644013 },
};

export function spawnMarkerPosition(spawn: SpawnPoint, mode: SpawnMarkerMode): SpawnMarkerPosition | null {
  if (typeof spawn.x !== 'number' || typeof spawn.y !== 'number') {
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
