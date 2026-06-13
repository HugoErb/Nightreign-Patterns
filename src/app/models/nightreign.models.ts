export interface Nightlord {
  id: string;
  name: string;
  alternateName?: string;
  imageUrl?: string;
}

export interface MapType {
  id: string;
  name: string;
}

export interface SpawnPoint {
  id: string;
  name: string;
  x?: number | null;
  y?: number | null;
}

export interface SpecialEvent {
  id: string;
  name: string;
  description?: string;
}

export interface MapPattern {
  id: string;
  nightlordId: string;
  mapTypeId: string;
  spawnPointId?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  eventIds: string[];
  eventText?: string;
  pointsOfInterest: string[];
  sourceUrl?: string;
}

export interface PatternData {
  nightlords: Nightlord[];
  mapTypes: MapType[];
  spawnPoints: SpawnPoint[];
  events: SpecialEvent[];
  patterns: MapPattern[];
}

export interface PatternFilters {
  nightlordId: string;
  mapTypeId: string;
  spawnPointId: string;
}
