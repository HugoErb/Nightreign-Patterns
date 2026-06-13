import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapPattern } from '../../models/nightreign.models';
import { PatternCardComponent } from '../pattern-card/pattern-card.component';

@Component({
  selector: 'app-pattern-list',
  standalone: true,
  imports: [PatternCardComponent],
  templateUrl: './pattern-list.component.html',
})
export class PatternListComponent {
  @Input({ required: true }) patterns: MapPattern[] = [];
  @Input() selectedPattern: MapPattern | null = null;
  @Input({ required: true }) nightlordName!: (id: string) => string;
  @Input({ required: true }) mapTypeName!: (id: string) => string;
  @Input({ required: true }) spawnName!: (id?: string) => string;
  @Input({ required: true }) eventNames!: (ids: string[]) => string[];

  @Output() selectPattern = new EventEmitter<MapPattern>();

  isSelected(pattern: MapPattern): boolean {
    return this.selectedPattern?.id === pattern.id && this.selectedPattern.nightlordId === pattern.nightlordId;
  }
}
