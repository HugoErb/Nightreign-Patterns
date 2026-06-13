import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { blankMapImageForMapType } from '../../map-background';
import { MapPattern, SpawnPoint } from '../../models/nightreign.models';
import { spawnMarkerPosition, type SpawnMarkerPosition } from '../../spawn-marker-position';

@Component({
  selector: 'app-interactive-map',
  standalone: true,
  templateUrl: './interactive-map.component.html',
})
export class InteractiveMapComponent {
  @Input({ required: true }) spawnPoints: SpawnPoint[] = [];
  @Input() selectedMapTypeId = 'default';
  @Input() selectedSpawnId = '';
  @Input() selectedSpawnName = '';
  @Input() displayedPattern: MapPattern | null = null;

  @Output() spawnSelected = new EventEmitter<string>();

  readonly zoom = signal(0.86);
  readonly offsetX = signal(0);
  readonly offsetY = signal(0);
  readonly isDragging = signal(false);
  readonly hasMoved = signal(false);
  private dragStart = { x: 0, y: 0, offsetX: 0, offsetY: 0 };

  placedSpawns(): SpawnMarkerPosition[] {
    return this.spawnPoints
      .map((spawn) => spawnMarkerPosition(spawn, 'blank-map'))
      .filter((spawn): spawn is SpawnMarkerPosition => spawn !== null);
  }

  displayedPatternSpawn(): SpawnMarkerPosition | null {
    const spawnId = this.displayedPattern?.spawnPointId;
    const spawn = this.spawnPoints.find((item) => item.id === spawnId);
    return spawn ? spawnMarkerPosition(spawn, 'pattern-map') : null;
  }

  blankMapImage(): string {
    return blankMapImageForMapType(this.selectedMapTypeId);
  }

  zoomIn(): void {
    this.zoom.set(Math.min(4, Number((this.zoom() + 0.2).toFixed(2))));
  }

  zoomOut(): void {
    this.zoom.set(Math.max(0.6, Number((this.zoom() - 0.2).toFixed(2))));
  }

  resetView(): void {
    this.zoom.set(0.86);
    this.offsetX.set(0);
    this.offsetY.set(0);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    event.deltaY < 0 ? this.zoomIn() : this.zoomOut();
  }

  startDrag(event: MouseEvent): void {
    this.isDragging.set(true);
    this.hasMoved.set(false);
    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
      offsetX: this.offsetX(),
      offsetY: this.offsetY(),
    };
  }

  drag(event: MouseEvent): void {
    if (!this.isDragging()) {
      return;
    }
    const nextX = this.dragStart.offsetX + event.clientX - this.dragStart.x;
    const nextY = this.dragStart.offsetY + event.clientY - this.dragStart.y;
    this.offsetX.set(nextX);
    this.offsetY.set(nextY);
    this.hasMoved.set(true);
  }

  stopDrag(): void {
    this.isDragging.set(false);
  }
}
