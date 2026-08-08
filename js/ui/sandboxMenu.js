import { getSavedCustomEvents, deleteCustomEvent } from '../data/sandbox.js';
import { initSandboxEditor } from './sandboxEditor.js';
import { setupTeamSelect } from './teamSelect.js';
import { createSandboxTournament } from '../engine/sandboxEngine.js';

/**
 * Renders the Sandbox Landing Menu ("Create New Event" vs "Choose Event").
 * @param {HTMLElement} container 
 */
export function renderSandboxMenu(container) {
  container.innerHTML = '';

  const savedEvents = getSavedCustomEvents();

  const wrap = document.createElement('div');
  wrap.className = 'menu-container esports-grid-bg';
  wrap.style.padding = '3rem 2rem';

  // Header Bar
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; max-width: 900px; margin: 0 auto 2.5rem;';
  header.innerHTML = `
    <button id="btn-sb-menu-back" class="btn-back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>MAIN MENU</span>
    </button>
    <h1 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; background: var(--accent-gradient); -webkit-background-clip: text; background-clip: text; color: transparent; text-transform: uppercase; margin: 0;">SANDBOX EVENT MANAGER</h1>
    <div></div>
  `;
  wrap.appendChild(header);

  // Main Action Cards Row
  const cardsRow = document.createElement('div');
  cardsRow.style.cssText = 'display: flex; gap: 2rem; justify-content: center; max-width: 900px; margin: 0 auto 3rem;';

  // Card 1: Create New Event
  const createCard = document.createElement('div');
  createCard.className = 'ts-team-card';
  createCard.style.cssText = 'flex: 1; padding: 2rem; border-color: rgba(189, 181, 120, 0.5); text-align: center; cursor: pointer;';
  createCard.innerHTML = `
    <div style="font-size: 2.5rem; color: #bdb578; margin-bottom: 1rem;">⚙️</div>
    <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #ece7e1; margin-bottom: 0.5rem; text-transform: uppercase;">CREATE NEW EVENT</h2>
    <p style="color: #999; font-size: 0.9rem;">Build a custom node-based bracket with Gameboxes, Winners/Losers paths, and Champion crowning.</p>
  `;
  createCard.addEventListener('click', () => {
    promptTeamCountAndStartEditor();
  });
  cardsRow.appendChild(createCard);

  wrap.appendChild(cardsRow);

  // Section: Saved Custom Events List
  const savedSec = document.createElement('div');
  savedSec.style.cssText = 'max-width: 900px; margin: 0 auto;';
  savedSec.innerHTML = `<h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: #bdb578; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">CHOOSE SAVED EVENT</h3>`;

  const listGrid = document.createElement('div');
  listGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem;';

  if (savedEvents.length === 0) {
    listGrid.innerHTML = `<div style="grid-column: 1 / -1; color: #777777; font-style: italic; text-align: center; padding: 2rem; background: rgba(0,0,0,0.3); border-radius: 8px;">No custom events created yet. Click "Create New Event" above to build your first bracket!</div>`;
  } else {
    savedEvents.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'ts-team-card';
      card.style.cssText = 'padding: 1.5rem; text-align: left; display: flex; flex-direction: column; justify-content: space-between; border-color: rgba(255,255,255,0.15);';

      const gameCount = ev.nodes ? ev.nodes.filter(n => n.type === 'gamebox').length : 0;

      card.innerHTML = `
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: #fff; margin: 0 0 0.5rem; text-transform: uppercase;">${ev.name}</h4>
          <div style="font-size: 0.85rem; color: #999; margin-bottom: 1rem;">
            <span>👥 ${ev.teamCount} Teams</span> &nbsp;|&nbsp; <span>🎮 ${gameCount} Gameboxes</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.8rem;">
          <button class="ts-btn btn-start btn-play-custom" style="flex: 1; padding: 0.4rem; font-size: 0.8rem;">PLAY EVENT</button>
          <button class="ts-btn btn-delete-custom" style="background: rgba(255,42,95,0.2); border-color: #ff2a5f; color: #ff2a5f; padding: 0.4rem 0.8rem; font-size: 0.8rem;">DELETE</button>
        </div>
      `;

      card.querySelector('.btn-play-custom').addEventListener('click', () => {
        launchCustomEvent(ev);
      });

      card.querySelector('.btn-delete-custom').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${ev.name}"?`)) {
          deleteCustomEvent(ev.id);
          renderSandboxMenu(container);
        }
      });

      listGrid.appendChild(card);
    });
  }

  savedSec.appendChild(listGrid);
  wrap.appendChild(savedSec);

  container.appendChild(wrap);

  container.querySelector('#btn-sb-menu-back').addEventListener('click', () => {
    import('../app.js').then(m => m.showScreen('menu'));
  });
}

function promptTeamCountAndStartEditor() {
  const countStr = prompt('How many teams should participate in this bracket? (e.g. 4, 8, 12, 16):', '8');
  if (!countStr) return;
  const count = parseInt(countStr, 10);
  if (isNaN(count) || count < 2 || count > 32) {
    alert('Please enter a valid team count between 2 and 32!');
    return;
  }

  const screen = document.getElementById('screen-sandbox-editor');
  if (screen) {
    import('../app.js').then(m => {
      m.showScreen('sandbox-editor');
      initSandboxEditor(screen, count);
    });
  }
}

function launchCustomEvent(customEvent) {
  setupTeamSelect(customEvent.teamCount, (teams) => {
    const tournament = createSandboxTournament(customEvent, teams);
    import('../app.js').then(m => {
      appState.tournament = tournament;
      appState.tournamentModule = {
        simulateNextStep: (t) => import('../engine/sandboxEngine.js').then(mod => mod.simulateNextStep(t)),
        simulateAll: (t) => import('../engine/sandboxEngine.js').then(mod => mod.simulateAll(t))
      };
      m.showScreen('tournament');
      m.renderTournament();
    });
  });
}
