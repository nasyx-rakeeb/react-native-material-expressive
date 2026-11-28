/**
 * Internal icon path data, 24×24 viewBox.
 *
 * Derived from Google Material Icons (`material-design-icons`,
 * Apache-2.0). These paths are the fallback for consumers who do not
 * bundle the Material Symbols font; they are deliberately a small core
 * set, not a replacement for the full symbol font.
 */
export const INTERNAL_ICON_PATHS = {
  check: ['M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'],
  close: [
    'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  ],
  menu: ['M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'],
  search: [
    'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  ],
  arrow_back: ['M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z'],
  arrow_forward: ['M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z'],
  chevron_right: ['M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'],
  expand_more: ['M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z'],
  add: ['M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'],
  remove: ['M19 13H5v-2h14v2z'],
  more_vert: [
    'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  ],
  star: [
    'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  ],
} as const;

export type InternalIconName = keyof typeof INTERNAL_ICON_PATHS;

export const INTERNAL_ICON_NAMES = Object.freeze(
  Object.keys(INTERNAL_ICON_PATHS) as InternalIconName[],
);
