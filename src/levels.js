/**
 * The app's level convention, in one place.
 *
 * Kards is a studio-range (legal-range) test card generator: IRE 0-100 maps onto
 * code values 16-235, not 0-255. That is the whole basis of the claim that the
 * levels are right, and it is what the CSS classes in Testcard.vue already
 * encode (.black = 16, .white75 = 180, .white = 235).
 *
 * Before v1.4.0 this mapping lived only in Swatch.vue while Ramp.vue used a
 * 0-255 range instead, so the same app measured two different things depending
 * on which card you picked (finding F-013). Every level in the app now comes
 * from here.
 */

/** Code value for IRE 0. Black, not zero. */
export const BLACK_LEVEL = 16

/** Code value for IRE 100. */
export const WHITE_LEVEL = 235

/**
 * IRE percentage to an 8-bit code value on the 16-235 scale.
 *
 * Values below IRE 0 clamp at 0 rather than going negative, which is what makes
 * the ramp card's deliberate sub-black marker (-7.5 IRE) land on 0. Super-white
 * (109 IRE) is left to reach 255 on purpose.
 */
export function ireToDecimal(ire) {
  const value = (Number(ire) * (WHITE_LEVEL - BLACK_LEVEL)) / 100 + BLACK_LEVEL
  return Math.round(Math.max(0, value))
}

/** `rgb(n, n, n)` for a single code value. */
export function greyString(dec) {
  return 'rgb(' + dec + ', ' + dec + ', ' + dec + ')'
}
