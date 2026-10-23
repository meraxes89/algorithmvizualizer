/**
 * Type surface for the not-yet-ported Toast module.
 *
 * `Toast.jsx` is grandfathered JS; once a typed module imports it, `checkJs`
 * would have to pass over the whole file. This declaration is the boundary
 * instead: typed consumers see the real API, the body stays unchecked until
 * the file converts to `.tsx` — then this shim is deleted.
 */
export declare const toast: {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

/** The host that renders toasts. Mount once, near the app root. */
declare const ToastContainer: () => null;

export default ToastContainer;
