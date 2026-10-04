import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ArrowDownToLine, ArrowRight, Copy, CornerDownLeft, Github, Linkedin, Moon, Search, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { contacts } from './resume-data';
import { sections, RESUME_FILENAME, RESUME_URL } from '../lib/sections';
import type { ThemeMode } from '../lib/useThemeMode';
import { toast } from './Toast';

interface Action {
  id: string;
  label: string;
  group: 'Go to' | 'Actions';
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  mode: ThemeMode;
  onToggleTheme: () => void;
}

const email = contacts.find((c) => c.id === 'email')?.value ?? '';
const linkedin = contacts.find((c) => c.id === 'linkedin')?.href ?? '';
const github = contacts.find((c) => c.id === 'github')?.href ?? '';

/**
 * ⌘K / Ctrl+K quick menu, like Spotlight: type to filter, arrow keys to move,
 * Enter to run. Built on <dialog> (focus trapped, Escape closes) with the
 * WAI-ARIA combobox + listbox pattern for the search field and results.
 */
export function CommandPalette({ open, onClose, mode, onToggleTheme }: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  const actions = useMemo<Action[]>(
    () => [
      ...sections.map((s) => ({
        id: `go-${s.id}`,
        label: s.label,
        group: 'Go to' as const,
        icon: ArrowRight,
        // Same as the nav links: the browser scrolls there and moves focus.
        run: () => {
          window.location.hash = s.id;
        },
      })),
      {
        id: 'download',
        label: 'Download CV (PDF)',
        group: 'Actions',
        icon: ArrowDownToLine,
        keywords: 'resume pdf',
        run: () => {
          const a = document.createElement('a');
          a.href = RESUME_URL;
          a.download = RESUME_FILENAME;
          a.click();
        },
      },
      {
        id: 'copy-email',
        label: 'Copy email address',
        group: 'Actions',
        icon: Copy,
        keywords: `mail contact ${email}`,
        run: () => {
          navigator.clipboard?.writeText(email).then(
            () => toast('Email address copied'),
            () => toast(email),
          );
        },
      },
      {
        id: 'linkedin',
        label: 'Open LinkedIn',
        group: 'Actions',
        icon: Linkedin,
        run: () => window.open(linkedin, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'github',
        label: 'Open GitHub',
        group: 'Actions',
        icon: Github,
        keywords: 'code projects repos',
        run: () => window.open(github, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'theme',
        label: mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        group: 'Actions',
        icon: mode === 'dark' ? Sun : Moon,
        keywords: 'theme appearance dark light',
        run: onToggleTheme,
      },
    ],
    [mode, onToggleTheme],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => `${a.group} ${a.label} ${a.keywords ?? ''}`.toLowerCase().includes(q));
  }, [actions, query]);

  // Open / close the native dialog with the prop.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      setQuery('');
      setIndex(0);
      d.showModal();
      inputRef.current?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  // Keep the highlighted option in view.
  useEffect(() => {
    document.getElementById(`cmd-${results[index]?.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [index, results]);

  const run = (a: Action | undefined) => {
    if (!a) return;
    onClose();
    // Let the dialog close (and focus return) before acting.
    requestAnimationFrame(() => a.run());
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[index]);
    }
  };

  const activeId = results[index] ? `cmd-${results[index].id}` : undefined;
  let lastGroup = '';

  return (
    <dialog
      ref={dialogRef}
      className="palette"
      aria-label="Quick actions"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="palette-search">
        <Search size={18} strokeWidth={2} aria-hidden="true" />
        <input
          ref={inputRef}
          className="palette-input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-label="Search sections and actions"
          placeholder="Search sections and actions"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <kbd className="palette-esc">esc</kbd>
      </div>
      <ul id="palette-list" className="palette-list" role="listbox" aria-label="Results">
        {results.length === 0 && <li className="palette-empty">No matches</li>}
        {results.map((a, i) => {
          const header = a.group !== lastGroup ? a.group : null;
          lastGroup = a.group;
          const Icon = a.icon;
          return (
            <li key={a.id} role="presentation">
              {header && (
                <div className="palette-group" aria-hidden="true">
                  {header}
                </div>
              )}
              <div
                id={`cmd-${a.id}`}
                role="option"
                aria-selected={i === index}
                className={`palette-option${i === index ? ' is-active' : ''}`}
                onMouseMove={() => setIndex(i)}
                onClick={() => run(a)}
              >
                <Icon size={17} strokeWidth={2} aria-hidden="true" />
                <span>{a.label}</span>
                {i === index && <CornerDownLeft className="palette-enter" size={15} strokeWidth={2} aria-hidden="true" />}
              </div>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
