// Pre-paint: resolve the theme and set <html data-theme> + background before
// React mounts, so dark-mode users never see a light flash. Loaded as a
// same-origin file (not inline) so the CSP can forbid inline scripts.
// Mirrors src/app/lib/useThemeMode.ts (same storage key).
(function () {
  var root = document.documentElement;
  var dark = false;
  try {
    var stored = localStorage.getItem('theme-mode');
    dark =
      stored === 'dark' ||
      (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch (e) {}
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.style.backgroundColor = dark ? '#000000' : '#ffffff';
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#161617' : '#fafafc');
})();
