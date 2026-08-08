'use strict'

/**
 * The capture matrix: card type x variant x size.
 *
 * Each case is a set of overrides applied on top of src/defaultConfig.json. The
 * harness applies the invariants in BASE_OVERRIDES to every case as well; see
 * README.md for why each one is there.
 */

/**
 * Applied to every case, before the case's own overrides.
 *
 * animated and showClock are required by the harness specification
 * (docs/review/09-kickoff.md section 6). showInfo is a harness decision: the info
 * circle is centred text over the card, so leaving it on would make centre
 * samples depend on font rendering — the exact fragility the specification warns
 * about. The consequence is that the info circle is NOT covered by this harness.
 */
const BASE_OVERRIDES = {
  animated: false,
  showClock: false,
  showInfo: false,
  infoCircleAnimated: false,
  visible: true,
  windowed: false,
  fullsize: true,
  raster: false,
  screen: 0,
  notFilledCard: { bounds: false, rotate: 0 },
  mask: { enabled: false, applyBounds: false, image: '', imageSource: '' }
}

const HD = [1920, 1080]
const SMALL = [1280, 720]

/**
 * `stable: false` marks a card that animates by design. Those cases are still
 * captured, but the recorder is expected to find few or no stable sample points,
 * and that is reported rather than treated as a failure.
 */
const CASES = [
  // ---- the two cases the day-one validation depends on ----
  {
    id: 'bars-simple-100',
    card: 'bars',
    variant: 'simple @ 100%',
    size: HD,
    config: { cardType: 'bars', bars: { type: 'simple', level: '100', overlay: false, color: 'white' } }
  },
  {
    id: 'bars-simple-75',
    card: 'bars',
    variant: 'simple @ 75%',
    size: HD,
    config: { cardType: 'bars', bars: { type: 'simple', level: '75', overlay: false, color: 'white' } }
  },

  // ---- the rest of the matrix ----
  {
    id: 'bars-simple-75-small',
    card: 'bars',
    variant: 'simple @ 75%, 1280x720',
    size: SMALL,
    config: { cardType: 'bars', bars: { type: 'simple', level: '75', overlay: false, color: 'white' } }
  },
  {
    id: 'bars-simple-0',
    card: 'bars',
    variant: 'simple @ 0%',
    size: HD,
    config: { cardType: 'bars', bars: { type: 'simple', level: '0', overlay: false, color: 'white' } }
  },
  {
    id: 'bars-smpte',
    card: 'bars',
    variant: 'smpte',
    size: HD,
    config: { cardType: 'bars', bars: { type: 'smpte', level: '75', overlay: false, color: 'white' } }
  },
  {
    id: 'bars-arib',
    card: 'bars',
    variant: 'arib',
    size: HD,
    config: { cardType: 'bars', bars: { type: 'arib', level: '75', overlay: false, color: 'white' } }
  },
  {
    id: 'bars-hdr',
    card: 'bars',
    variant: 'hdr',
    size: HD,
    config: { cardType: 'bars', bars: { type: 'hdr', level: '75', overlay: false, color: 'white' } }
  },
  {
    id: 'bars-sdi',
    card: 'bars',
    variant: 'sdi',
    size: HD,
    config: { cardType: 'bars', bars: { type: 'sdi', level: '75', overlay: false, color: 'white' } }
  },
  {
    id: 'bars-single',
    card: 'bars',
    variant: 'single',
    size: HD,
    config: { cardType: 'bars', bars: { type: 'single', level: '75', overlay: false, color: 'white' } }
  },
  {
    id: 'grid',
    card: 'grid',
    variant: 'default',
    size: HD,
    config: { cardType: 'grid' }
  },
  {
    id: 'grid-diagonals',
    card: 'grid',
    variant: 'diagonals + circles',
    size: HD,
    config: { cardType: 'grid', grid: { diagonals: true, circles: true } }
  },
  {
    id: 'ramp',
    card: 'ramp',
    variant: 'horizontal',
    size: HD,
    // A smooth gradient is flat nowhere, so no neighbourhood test can pass. These
    // two cases rely on the two-capture stability check alone, which is sound
    // here: the ramp is deterministic and there is no text at the lattice points.
    // See README.md, 'Choosing sample points'.
    uniformRadius: 0,
    config: { cardType: 'ramp', ramp: { direction: 'Horizontal', reverse: false, stepped: false, double: false } }
  },
  {
    id: 'ramp-stepped',
    card: 'ramp',
    variant: 'horizontal stepped',
    size: HD,
    config: { cardType: 'ramp', ramp: { direction: 'Horizontal', reverse: false, stepped: true, double: false } }
  },
  // The horizontal and vertical stepped ramps draw swatch labels over the whole
  // gradient, so the gradient itself is invisible there. Diagonal and Radial set
  // showSteps false, which is the only place the stepped gradient is actually
  // seen — and therefore the only place F-008's missing step was visible.
  {
    id: 'ramp-stepped-diagonal',
    card: 'ramp',
    variant: 'diagonal stepped (bare gradient)',
    size: HD,
    config: { cardType: 'ramp', ramp: { direction: 'Diagonal', reverse: false, stepped: true, double: false } }
  },
  {
    id: 'ramp-stepped-radial',
    card: 'ramp',
    variant: 'radial stepped (bare gradient)',
    size: HD,
    config: { cardType: 'ramp', ramp: { direction: 'Radial', reverse: false, stepped: true, double: false } }
  },
  {
    id: 'ramp-vertical',
    card: 'ramp',
    variant: 'vertical',
    size: HD,
    // A smooth gradient is flat nowhere, so no neighbourhood test can pass. These
    // two cases rely on the two-capture stability check alone, which is sound
    // here: the ramp is deterministic and there is no text at the lattice points.
    // See README.md, 'Choosing sample points'.
    uniformRadius: 0,
    config: { cardType: 'ramp', ramp: { direction: 'Vertical', reverse: false, stepped: false, double: false } }
  },
  {
    id: 'alteka',
    card: 'alteka',
    variant: 'default',
    size: HD,
    // A smooth gradient is never flat over a 9x9 block; a 3x3 one still rejects
    // text and hard edges. See README.md, 'Choosing sample points'.
    uniformRadius: 1,
    config: { cardType: 'alteka' }
  },
  {
    id: 'led',
    card: 'led',
    variant: 'default',
    size: HD,
    config: { cardType: 'led' }
  },
  {
    id: 'placeholder',
    card: 'placeholder',
    variant: 'default',
    size: HD,
    // A smooth gradient is never flat over a 9x9 block; a 3x3 one still rejects
    // text and hard edges. See README.md, 'Choosing sample points'.
    uniformRadius: 1,
    config: { cardType: 'placeholder' }
  },
  {
    id: 'clock',
    card: 'clock',
    variant: 'default',
    size: HD,
    config: { cardType: 'clock' }
  },
  {
    id: 'deghost',
    card: 'deghost',
    variant: 'default',
    size: HD,
    stable: false,
    config: { cardType: 'deghost' }
  },
  {
    id: 'audioSync',
    card: 'audioSync',
    variant: 'default',
    size: HD,
    stable: false,
    config: { cardType: 'audioSync' }
  }
]

/** Case ids the day-one validation in run.js --validate depends on. */
const VALIDATION_CASES = ['bars-simple-100', 'bars-simple-75']

module.exports = { BASE_OVERRIDES, CASES, VALIDATION_CASES }
