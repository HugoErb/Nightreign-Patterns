import { strict as assert } from 'node:assert';
import { blankMapImageForMapType } from './map-background.ts';

assert.equal(blankMapImageForMapType('great-hollow'), 'assets/images/map/great-hollow.webp');
assert.equal(blankMapImageForMapType('default'), 'assets/images/map/default.webp');
assert.equal(blankMapImageForMapType('crater'), 'assets/images/map/default.webp');
