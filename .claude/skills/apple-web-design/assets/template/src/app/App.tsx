import { useEffect, useState } from 'react';
import { GlobalNav } from './components/GlobalNav';
import { Hero } from './components/Hero';
import { SectionBlock } from './components/Sections';
import { DetailsModal } from './components/DetailsModal';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { CommandPalette } from './components/CommandPalette';
import { Toaster } from './components/Toast';
import { SectionChips } from './components/SectionChips';
import { sections } from '../site-data';
import type { Details } from '../site-data';
import { useThemeMode } from './lib/useThemeMode';
import { useScrollEffects, useSpotlight } from './lib/motion';

export default function App() {
  const { mode, toggle } = useThemeMode();
  const [openDetails, setOpenDetails] = useState<Details | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useSpotlight();
  useScrollEffects();

  // ⌘K (Mac) / Ctrl+K (others) opens the quick-actions palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <GlobalNav mode={mode} onToggleTheme={toggle} onOpenPalette={() => setPaletteOpen(true)} />
      <SectionChips />

      <main id="main" tabIndex={-1}>
        <Hero />
        {sections.map((s) => (
          <SectionBlock key={s.id} section={s} onOpen={setOpenDetails} />
        ))}
      </main>

      <Footer />
      <BackToTop />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} mode={mode} onToggleTheme={toggle} />
      <Toaster />
      <DetailsModal entry={openDetails} onClose={() => setOpenDetails(null)} />
    </>
  );
}
