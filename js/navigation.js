const screens = ['menu', 'presets', 'sandbox-menu', 'sandbox-editor', 'team-select', 'tournament'];

/**
 * Switches active visible screen across the application.
 * @param {string} screenId 
 */
export function showScreen(screenId) {
  screens.forEach(s => {
    const el = document.getElementById(`screen-${s}`);
    if (el) {
      el.classList.toggle('hidden', s !== screenId);
      if (s === screenId) {
        el.classList.add('animate-fade-in');
      }
    }
  });
}
