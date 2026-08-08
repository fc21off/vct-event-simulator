import { appState, setTheme, showScreen } from '../app.js';
import { setupTeamSelect } from './teamSelect.js';

export function initMenu() {
  const btnPresets = document.getElementById('btn-menu-presets');
  const btnSandbox = document.getElementById('btn-menu-sandbox');
  const btnPresetsBack = document.getElementById('btn-presets-back');
  
  const modalMasters = document.getElementById('modal-masters-choice');
  const btnCloseMastersModal = document.getElementById('btn-close-masters-modal');

  // Main menu navigation
  if (btnPresets) {
    btnPresets.addEventListener('click', () => {
      showScreen('presets');
    });
  }

  if (btnPresetsBack) {
    btnPresetsBack.addEventListener('click', () => {
      showScreen('menu');
    });
  }

  if (btnSandbox) {
    btnSandbox.addEventListener('click', () => {
      showScreen('sandbox-menu');
      import('./sandboxMenu.js').then(mod => {
        const container = document.getElementById('screen-sandbox-menu');
        if (container) mod.renderSandboxMenu(container);
      });
    });
  }

  // Event Preset Cards (MASTERS vs CHAMPIONS)
  const presetCards = document.querySelectorAll('.event-preset-card');
  presetCards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-type');
      
      if (type === 'masters') {
        // Open Masters choice modal (8 or 12 Teams)
        if (modalMasters) {
          modalMasters.classList.add('active');
        }
      } else if (type === 'champions') {
        // Champions 16 Team direct start
        appState.currentFormat = 'champions16';
        setTheme('champions');
        setupTeamSelect('champions16');
        showScreen('team-select');
      }
    });
  });

  // Close Masters Modal
  if (btnCloseMastersModal && modalMasters) {
    btnCloseMastersModal.addEventListener('click', () => {
      modalMasters.classList.remove('active');
    });
  }

  // Masters Choice Buttons (8 Teams vs 12 Teams)
  const mastersBtns = document.querySelectorAll('.masters-choice-btn');
  mastersBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.getAttribute('data-format'); // 'masters8' or 'masters12'
      if (modalMasters) {
        modalMasters.classList.remove('active');
      }
      appState.currentFormat = format;
      setTheme('masters');
      setupTeamSelect(format);
      showScreen('team-select');
    });
  });
}
