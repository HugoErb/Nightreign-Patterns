import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapPattern } from '../../models/nightreign.models';

@Component({
  selector: 'app-pattern-card',
  standalone: true,
  templateUrl: './pattern-card.component.html',
})
export class PatternCardComponent {
  @Input({ required: true }) pattern!: MapPattern;
  @Input({ required: true }) nightlordName = '';
  @Input({ required: true }) mapTypeName = '';
  @Input() spawnName = '';
  @Input() eventNames: string[] = [];
  @Input() selected = false;

  @Output() selectPattern = new EventEmitter<MapPattern>();
}
