import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapType, Nightlord, PatternFilters, SpawnPoint } from '../../models/nightreign.models';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filters.component.html',
})
export class FiltersComponent {
  @Input({ required: true }) filters!: PatternFilters;
  @Input({ required: true }) nightlords: Nightlord[] = [];
  @Input({ required: true }) mapTypes: MapType[] = [];
  @Input({ required: true }) spawnPoints: SpawnPoint[] = [];
  @Input({ required: true }) resultCount = 0;

  @Output() filtersChange = new EventEmitter<PatternFilters>();
  @Output() reset = new EventEmitter<void>();
  @Output() blankMapRequested = new EventEmitter<void>();

  nightlordDropdownOpen = false;

  selectedNightlord(): Nightlord | undefined {
    return this.nightlords.find((nightlord) => nightlord.id === this.filters.nightlordId);
  }

  selectNightlord(nightlordId: string): void {
    this.nightlordDropdownOpen = false;
    this.update({ nightlordId });
  }

  update(patch: Partial<PatternFilters>): void {
    this.filtersChange.emit({ ...this.filters, ...patch });
  }
}
