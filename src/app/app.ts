import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FiltersComponent } from './components/filters/filters.component';
import { InteractiveMapComponent } from './components/interactive-map/interactive-map.component';
import { PatternListComponent } from './components/pattern-list/pattern-list.component';
import { MapPattern, PatternData, PatternFilters } from './models/nightreign.models';
import { PatternDataService } from './services/pattern-data.service';
import { filterSpawnPointsForMapType, isSpawnPointAvailableForMapType } from './spawn-point-filters';

@Component({
  selector: 'app-root',
  imports: [FiltersComponent, InteractiveMapComponent, PatternListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly dataService = inject(PatternDataService);

  readonly emptyFilters: PatternFilters = {
    nightlordId: '',
    mapTypeId: 'default',
    spawnPointId: '',
  };

  readonly data = signal<PatternData | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly filters = signal<PatternFilters>({ ...this.emptyFilters });
  readonly displayedPattern = signal<MapPattern | null>(null);

  readonly nightlordById = computed(() => new Map((this.data()?.nightlords ?? []).map((item) => [item.id, item])));
  readonly mapTypeById = computed(() => new Map((this.data()?.mapTypes ?? []).map((item) => [item.id, item])));
  readonly spawnById = computed(() => new Map((this.data()?.spawnPoints ?? []).map((item) => [item.id, item])));
  readonly eventById = computed(() => new Map((this.data()?.events ?? []).map((item) => [item.id, item])));
  readonly filteredSpawnPoints = computed(() => filterSpawnPointsForMapType(this.data()?.spawnPoints ?? [], this.filters().mapTypeId));

  readonly filteredPatterns = computed(() => {
    const data = this.data();
    if (!data) {
      return [];
    }

    const filters = this.filters();
    return data.patterns.filter((pattern) => {
      if (filters.nightlordId && pattern.nightlordId !== filters.nightlordId) {
        return false;
      }
      if (filters.mapTypeId && pattern.mapTypeId !== filters.mapTypeId) {
        return false;
      }
      if (filters.spawnPointId && pattern.spawnPointId !== filters.spawnPointId) {
        return false;
      }
      return true;
    });
  });

  readonly selectedSpawnName = computed(() => this.spawnName(this.filters().spawnPointId));

  readonly nightlordName = (id: string): string => {
    const nightlord = this.nightlordById().get(id);
    return nightlord ? `${nightlord.name}${nightlord.alternateName ? ` (${nightlord.alternateName})` : ''}` : id;
  };

  readonly mapTypeName = (id: string): string => this.mapTypeById().get(id)?.name ?? id;
  readonly spawnName = (id?: string): string => (id ? (this.spawnById().get(id)?.name ?? id) : '');
  readonly eventNames = (ids: string[]): string[] => ids.map((id) => this.eventById().get(id)?.name ?? id);

  constructor() {
    this.dataService
      .load()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Impossible de charger les fichiers JSON locaux.');
          this.loading.set(false);
        },
      });
  }

  updateFilters(filters: PatternFilters): void {
    this.filters.set(this.sanitizeFilters(filters));
  }

  selectSpawn(spawnPointId: string): void {
    this.displayedPattern.set(null);
    this.filters.update((filters) => this.sanitizeFilters({ ...filters, spawnPointId }));
  }

  resetFilters(): void {
    this.filters.set({ ...this.emptyFilters });
    this.displayedPattern.set(null);
  }

  showPatternOnMap(pattern: MapPattern): void {
    this.displayedPattern.set(pattern);
  }

  showBlankMap(): void {
    this.displayedPattern.set(null);
  }

  private sanitizeFilters(filters: PatternFilters): PatternFilters {
    if (filters.spawnPointId && !isSpawnPointAvailableForMapType(filters.spawnPointId, filters.mapTypeId)) {
      return { ...filters, spawnPointId: '' };
    }
    return filters;
  }
}
