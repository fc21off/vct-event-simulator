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
        if (s !== 'sandbox-editor') {
          el.classList.add('animate-fade-in');
        } else {
          el.classList.remove('animate-fade-in');
        }
      }
    }
  });
}
