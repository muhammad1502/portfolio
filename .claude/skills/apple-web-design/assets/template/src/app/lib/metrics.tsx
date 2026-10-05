import type { ReactNode } from 'react';

// Matches a run wrapped in **double asterisks**. Emphasis is opt-in per token,
// so dates, prices and years left unmarked in the data are never touched.
const METRIC = /\*\*(.+?)\*\*/g;

/**
 * Renders body copy from site-data.ts, promoting each **marked** run to an
 * emphasized <strong class="metric"> (weight + primary colour). Keeps the data
 * layer pure strings.
 */
export function renderMetrics(text: string): ReactNode {
  if (!text.includes('**')) return text;

  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;

  for (const m of text.matchAll(METRIC)) {
    const start = m.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    nodes.push(
      <strong key={i++} className="metric">
        {m[1]}
      </strong>,
    );
    last = start + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Strips the **markers** for places that need plain text (e.g. aria labels). */
export function plainText(text: string): string {
  return text.replace(METRIC, '$1');
}

/**
 * Splits a comma-separated string into items, ignoring commas inside
 * parentheses, "Python (Pandas, NumPy), Bash" -> ["Python (Pandas, NumPy)", "Bash"].
 */
export function splitList(value: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      if (current.trim()) items.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) items.push(current.trim());
  return items;
}

/**
 * Like renderMetrics, but every word is its own span ([data-word]) so a text
 * section can light up word by word as you scroll. **Metric** runs keep
 * their emphasis.
 */
export function renderWords(text: string): ReactNode {
  const parts: { text: string; metric: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(METRIC)) {
    const start = m.index ?? 0;
    if (start > last) parts.push({ text: text.slice(last, start), metric: false });
    parts.push({ text: m[1], metric: true });
    last = start + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), metric: false });

  let key = 0;
  return parts.flatMap((part) =>
    part.text
      .split(/(\s+)/)
      .filter(Boolean)
      .map((token) =>
        /^\s+$/.test(token) ? (
          token
        ) : (
          <span key={key++} data-word="" className={part.metric ? 'metric' : undefined}>
            {token}
          </span>
        ),
      ),
  );
}
