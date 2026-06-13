import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { MapPattern, MapType, Nightlord, PatternData, SpawnPoint, SpecialEvent } from '../models/nightreign.models';

@Injectable({ providedIn: 'root' })
export class PatternDataService {
  private readonly http = inject(HttpClient);

  load(): Observable<PatternData> {
    return forkJoin({
      nightlords: this.http.get<Nightlord[]>('assets/data/nightlords.json'),
      mapTypes: this.http.get<MapType[]>('assets/data/map-types.json'),
      spawnPoints: this.http.get<SpawnPoint[]>('assets/data/spawn-points.json'),
      events: this.http.get<SpecialEvent[]>('assets/data/events.json'),
      patterns: this.http.get<MapPattern[]>('assets/data/patterns.json'),
    });
  }
}
