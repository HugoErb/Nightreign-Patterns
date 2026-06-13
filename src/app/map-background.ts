export function blankMapImageForMapType(mapTypeId: string): string {
  return mapTypeId === 'great-hollow' ? 'assets/images/map/great-hollow.webp' : 'assets/images/map/default.webp';
}
