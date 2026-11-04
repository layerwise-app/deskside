import { portfolio, type FontSetting } from '~/portfolio.config';

function fontFaces(setting: FontSetting) {
  return setting.files
    .map(
      (file) =>
        `@font-face{font-family:'${setting.family}';src:url('${file.src}') format('woff2');font-weight:${file.weight};font-style:${file.style};font-display:swap;}`
    )
    .join('');
}

function stack(setting: FontSetting) {
  return `'${setting.family}', ${setting.fallback}`;
}

/** The `:root` variables and `@font-face` rules built from the config. */
export function themeCss() {
  const { fonts, colors } = portfolio;
  const vars = {
    '--ds-font-sans': stack(fonts.sans),
    '--ds-font-mono': stack(fonts.mono),
    '--ds-paper': colors.paper,
    '--ds-paper-deep': colors.paperDeep,
    '--ds-ink': colors.ink,
    '--ds-muted': colors.muted,
    '--ds-line': colors.line,
    '--ds-accent': colors.accent
  };
  const root = Object.entries(vars)
    .map(([key, value]) => `${key}:${value};`)
    .join('');
  return `${fontFaces(fonts.sans)}${fontFaces(fonts.mono)}:root{${root}}`;
}

/** Preload the regular face of each site font so text never reflows. */
export function fontPreloads() {
  return [portfolio.fonts.sans.files[0], portfolio.fonts.mono.files[0]].map(
    (file) => ({
      rel: 'preload',
      href: file.src,
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous' as const
    })
  );
}
