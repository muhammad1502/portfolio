import type { ThemeMode } from '../lib/useThemeMode';

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * One icon that morphs between sun and moon (styles in site.css, "theme
 * icon"). Light: a small disc with eight rays. Dark: the rays spin away and
 * shrink, the disc grows, and a masking circle slides in to carve a crescent.
 */
export function ThemeIcon({ mode }: { mode: ThemeMode }) {
  return (
    <svg className="theme-icon" data-mode={mode} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <mask id="theme-icon-mask">
        <rect width="24" height="24" fill="#fff" />
        <circle className="theme-icon-cut" cx="24" cy="4" r="7" fill="#000" />
      </mask>
      {/* Mask on an untransformed group, so scaling the disc doesn't move the cut. */}
      <g mask="url(#theme-icon-mask)">
        <circle className="theme-icon-core" cx="12" cy="12" r="4.5" fill="currentColor" />
      </g>
      <g className="theme-icon-rays" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        {RAYS.map((deg) => (
          <line key={deg} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${deg} 12 12)`} />
        ))}
      </g>
    </svg>
  );
}
