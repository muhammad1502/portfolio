import type { ReactNode } from 'react';

// Matches a run wrapped in **double asterisks**. Emphasis is opt-in per token,
// so dates, phone numbers, and years left unmarked in the data are never touched.
const METRIC = /\*\*(.+?)\*\*/g;

/**
 * Renders body copy from resume-data.ts, promoting each **marked** run to an
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
 * Splits a comma-separated skills string into items, ignoring commas inside
 * parentheses — "Python (Pandas, NumPy, OOP), Bash" -> ["Python (Pandas, NumPy, OOP)", "Bash"].
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
