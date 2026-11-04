/** Can this browser draw the 3D desk? Kept apart from three.js so it is cheap. */
export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Set when leaving the desk for a case study, read when coming back. */
export const RETURN_KEY = 'deskside:return';

/** The color that covers the screen between the desk and a case study. */
export const transition = { color: '' };
