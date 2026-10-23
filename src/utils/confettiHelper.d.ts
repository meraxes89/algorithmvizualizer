/**
 * Type surface for the not-yet-ported confetti helper.
 *
 * `confettiHelper.js` is grandfathered JS and imports `soundEngine.js`
 * (17 known `checkJs` errors). This declaration is the typed boundary so a
 * typed module can finish a run with confetti without pulling the sound
 * engine into the checked graph. Delete it when the helper converts to
 * `.ts`.
 */
export declare const getColorsFromTailwind: (colorString: string) => string[];

export declare const triggerVictoryConfetti: (colors?: string[]) => void;
