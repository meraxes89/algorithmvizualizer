/// <reference types="vite/client" />

/**
 * Ambient declarations for the app.
 *
 * The typed surface is deliberately narrow: `tsconfig.json` only pulls in
 * `.ts` / `.tsx` files, and `checkJs` type-checks the plain `.js` files
 * that those pull in as dependencies. Legacy `.js` files that nothing in
 * the typed surface imports are converted deliberately, one at a time.
 */

interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
