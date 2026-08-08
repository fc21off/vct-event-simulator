import { initMenu } from './ui/menu.js';
import { initTeamSelect } from './ui/teamSelect.js';
import { renderSwissStage } from './ui/swissView.js';
import { renderGroupStage } from './ui/groupView.js';
import { renderBracket } from './ui/bracketView.js';
import { renderSandboxView } from './ui/sandboxView.js';
import { createGrandFinalMatch, simulateNextGrandFinalMap, simulateEntireGrandFinal } from './engine/grandFinals.js';
import { renderGrandFinalModal } from './ui/grandFinalModal.js';

import { showScreen } from './navigation.js';
export { showScreen };

export const appState = {
  currentFormat: null,
  selectedTeams: [],
  tournament: null,
  tournamentModule: null,
  grandFinalState: null
};

export function setTheme(theme) {
  document.body.className = `theme-${theme}`;
}

export function renderTournament() {
  const t = appState.tournament;
  if (!t) return;
  
  // Set theme based on tournament
  setTheme(t.theme);
  
  document.getElementById('t-name').textContent = t.name;
  
  const logoImg = document.getElementById('t-banner-img');
  if (logoImg) {
    logoImg.src = t.theme === 'champions' ? 'assets/vct_logo.png' : 'assets/masters_logo.svg';
  }

  // Active viewing stage (defaults to current tournament stage if not set)
  const viewingStage = t.viewingStage || t.stage || 'sandbox';
  
  // Show readable stage label
  const stageLabels = {
    'swiss': 'SWISS STAGE',
    'groups': 'GROUP STAGE',
    'bracket': 'PLAYOFFS',
    'sandbox': 'CUSTOM BRACKET',
    'complete': 'COMPLETE'
  };
  document.getElementById('t-stage-indicator').textContent = stageLabels[viewingStage] || (viewingStage ? viewingStage.toUpperCase() : 'CUSTOM BRACKET');
  
  const content = document.getElementById('tournament-content');
  content.innerHTML = '';
  
  // Render based on viewingStage
  if (t.type === 'sandbox') {
    renderSandboxView(content, t);
  } else if (viewingStage === 'swiss' && t.swiss) {
    renderSwissStage(content, t.swiss);
  } else if (viewingStage === 'groups' && t.groups) {
    renderGroupStage(content, t.groups);
  } else if ((viewingStage === 'bracket' || viewingStage === 'complete') && t.bracket) {
    renderBracket(content, t.bracket);
  }
  
  // Check if stage is complete (Group or Swiss) but playoffs not started yet
  let isStageComplete = false;
  if (t.stage === 'groups' && t.groups && t.groups.every(g => g.phase === 'complete')) {
    isStageComplete = true;
  } else if (t.stage === 'swiss' && t.swiss && t.swiss.teams.filter(team => team.status === 'active').length === 0) {
    isStageComplete = true;
  }

  // Update simulation button states
  const simNext = document.getElementById('btn-sim-next');
  const simStage = document.getElementById('btn-sim-stage');
  const simAll = document.getElementById('btn-sim-all');
  
  // If user is currently viewing Groups/Swiss AFTER playoffs bracket has been generated:
  if ((viewingStage === 'groups' || viewingStage === 'swiss') && t.bracket) {
    simNext.textContent = 'VIEW PLAYOFFS';
    simNext.classList.add('btn-proceed-highlight');
    simNext.classList.remove('btn-sim-grand-final', 'btn-disabled');
    simNext.disabled = false;

    simStage.style.display = 'none';
    simAll.style.display = 'none';
    return;
  }

  // Check if Grand Final is ready to be simulated (only when stage is not complete yet)
  const isGrandFinalReady = t.stage !== 'complete' && t.bracket && t.bracket.grandFinal && t.bracket.grandFinal.team1 && t.bracket.grandFinal.team2 && !t.bracket.grandFinal.played;

  if (isGrandFinalReady) {
    simNext.textContent = 'SIMULATE GRAND FINAL';
    simNext.classList.add('btn-sim-grand-final');
    simNext.classList.remove('btn-proceed-highlight', 'btn-disabled');
    simNext.disabled = false;

    simStage.style.display = 'none';
    simAll.style.display = 'none';
  } else {
    simNext.textContent = 'Simulate Next';
    simNext.classList.remove('btn-sim-grand-final', 'btn-proceed-highlight');
    simStage.style.display = 'inline-flex';
    simAll.style.display = 'inline-flex';

    if (isStageComplete && !t.bracket) {
      simNext.classList.add('btn-disabled');
      simNext.disabled = true;

      simStage.textContent = 'PROCEED TO PLAYOFFS';
      simStage.classList.add('btn-proceed-highlight');
      simStage.classList.remove('btn-disabled');
      simStage.disabled = false;
    } else {
      simStage.textContent = 'Simulate Stage';
      simStage.classList.remove('btn-proceed-highlight');

      if (t.stage === 'complete') {
        simNext.classList.add('btn-disabled');
        simNext.disabled = true;
        simStage.classList.add('btn-disabled');
        simStage.disabled = true;
        simAll.classList.add('btn-disabled');
        simAll.disabled = true;
      } else {
        simNext.classList.remove('btn-disabled');
        simNext.disabled = false;
        simStage.classList.remove('btn-disabled');
        simStage.disabled = false;
        simAll.classList.remove('btn-disabled');
        simAll.disabled = false;
      }
    }
  }
  
  // Always keep celebration overlay hidden during view renders (only shown on click or crowning)
  const celeb = document.getElementById('champion-celebration');
  if (celeb && !celeb.classList.contains('active-trigger')) {
    celeb.classList.add('hidden');
  }
}

export function openGrandFinalModal() {
  const gfModal = document.getElementById('modal-grand-finals');
  if (!gfModal) return;

  const t = appState.tournament;
  if (!t) return;

  // Use saved grandFinalState from bracket if available!
  if (t.bracket && t.bracket.grandFinalState) {
    appState.grandFinalState = t.bracket.grandFinalState;
  } else if (!appState.grandFinalState && t.bracket && t.bracket.grandFinal && t.bracket.grandFinal.team1 && t.bracket.grandFinal.team2) {
    appState.grandFinalState = createGrandFinalMatch(t.bracket.grandFinal.team1, t.bracket.grandFinal.team2);
  }

  if (appState.grandFinalState) {
    gfModal.classList.add('active');
    renderGrandFinalModal(appState.grandFinalState, t.name);
  }
}

export function showChampionCelebration(champion, tournamentName) {
  const celeb = document.getElementById('champion-celebration');
  if (!celeb || !champion) return;

  const teamNameEl = document.getElementById('champion-team-name');
  if (teamNameEl) teamNameEl.textContent = champion.name;

  const subtitleEl = celeb.querySelector('.champion-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = tournamentName || 'VCT CHAMPION';
  }

  celeb.classList.remove('hidden');
  celeb.onclick = () => {
    celeb.classList.add('hidden');
  };
}

function handleGrandFinalCompletion() {
  const gf = appState.grandFinalState;
  if (!gf || !gf.isComplete || !appState.tournament) return;

  const t = appState.tournament;
  t.bracket.grandFinalState = gf;
  t.bracket.grandFinal.played = true;
  t.bracket.grandFinal.team1Score = gf.team1MapsWon;
  t.bracket.grandFinal.team2Score = gf.team2MapsWon;
  t.bracket.grandFinal.winner = gf.winner;
  t.bracket.champion = gf.winner;
  t.champion = gf.winner;
  t.stage = 'complete';
  t.viewingStage = 'complete';

  // Wait 1 second before closing modal and crowning champion
  setTimeout(() => {
    const gfModal = document.getElementById('modal-grand-finals');
    if (gfModal) gfModal.classList.remove('active');
    renderTournament();
    showChampionCelebration(t.champion, t.name);
  }, 1000);
}

function initTournamentControls() {
  document.getElementById('btn-t-back').addEventListener('click', () => {
    document.getElementById('champion-celebration').classList.add('hidden');
    const gfModal = document.getElementById('modal-grand-finals');
    if (gfModal) gfModal.classList.remove('active');

    const t = appState.tournament;
    if (t && t.bracket && (t.viewingStage === 'bracket' || t.viewingStage === 'complete' || !t.viewingStage)) {
      // Switch view back to Groups/Swiss stage!
      t.viewingStage = t.groups ? 'groups' : 'swiss';
      renderTournament();
    } else {
      // Return to team select
      if (t) t.viewingStage = null;
      showScreen('team-select');
    }
  });
  
  // Simulate Next Step – advances one round/step OR opens Grand Finals modal OR toggles VIEW PLAYOFFS
  document.getElementById('btn-sim-next').addEventListener('click', () => {
    if (!appState.tournament) return;
    const t = appState.tournament;
    const viewingStage = t.viewingStage || t.stage;

    // Handle VIEW PLAYOFFS click when inspecting Groups
    if ((viewingStage === 'groups' || viewingStage === 'swiss') && t.bracket) {
      t.viewingStage = t.stage === 'complete' ? 'complete' : 'bracket';
      renderTournament();
      return;
    }

    const isGrandFinalReady = t.stage !== 'complete' && t.bracket && t.bracket.grandFinal && t.bracket.grandFinal.team1 && t.bracket.grandFinal.team2 && !t.bracket.grandFinal.played;

    if (isGrandFinalReady) {
      // Open Grand Finals Modal
      if (!appState.grandFinalState) {
        appState.grandFinalState = createGrandFinalMatch(t.bracket.grandFinal.team1, t.bracket.grandFinal.team2);
      }
      const gfModal = document.getElementById('modal-grand-finals');
      if (gfModal) {
        gfModal.classList.add('active');
        renderGrandFinalModal(appState.grandFinalState, t.name);
      }
    } else if (appState.tournamentModule && t.stage !== 'complete') {
      const res = appState.tournamentModule.simulateNextStep(appState.tournament);
      Promise.resolve(res).then(result => {
        if (result && result.tournament) {
          appState.tournament = result.tournament;
        }
        renderTournament();
      });
    }
  });

  // Grand Finals Modal Controls
  const gfModal = document.getElementById('modal-grand-finals');
  const btnGfClose = document.getElementById('btn-gf-close');
  if (btnGfClose && gfModal) {
    btnGfClose.addEventListener('click', () => {
      gfModal.classList.remove('active');
    });
  }

  if (gfModal) {
    gfModal.addEventListener('click', (e) => {
      if (e.target === gfModal) {
        gfModal.classList.remove('active');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gfModal && gfModal.classList.contains('active')) {
      gfModal.classList.remove('active');
    }
  });

  document.getElementById('btn-gf-sim-map').addEventListener('click', () => {
    if (appState.grandFinalState && !appState.grandFinalState.isComplete) {
      appState.grandFinalState = simulateNextGrandFinalMap(appState.grandFinalState);
      renderGrandFinalModal(appState.grandFinalState, appState.tournament.name);
      if (appState.grandFinalState.isComplete) {
        handleGrandFinalCompletion();
      }
    }
  });

  document.getElementById('btn-gf-sim-game').addEventListener('click', () => {
    if (appState.grandFinalState && !appState.grandFinalState.isComplete) {
      appState.grandFinalState = simulateEntireGrandFinal(appState.grandFinalState);
      renderGrandFinalModal(appState.grandFinalState, appState.tournament.name);
      if (appState.grandFinalState.isComplete) {
        handleGrandFinalCompletion();
      }
    }
  });
  
  // Simulate Stage – advances current stage to completion (stops BEFORE playoffs so user sees complete groups!)
  document.getElementById('btn-sim-stage').addEventListener('click', () => {
    if (!appState.tournament || !appState.tournamentModule) return;
    const t = appState.tournament;

    if (t.type === 'sandbox') {
      const res = appState.tournamentModule.simulateAll(appState.tournament);
      Promise.resolve(res).then(result => {
        if (result && result.tournament) {
          appState.tournament = result.tournament;
        }
        renderTournament();
      });
      return;
    }

    let isStageComplete = false;
    if (t.stage === 'groups' && t.groups && t.groups.every(g => g.phase === 'complete')) {
      isStageComplete = true;
    } else if (t.stage === 'swiss' && t.swiss && t.swiss.teams.filter(team => team.status === 'active').length === 0) {
      isStageComplete = true;
    }

    if (isStageComplete && !t.bracket) {
      // User clicked RED HIGHLIGHTED "PROCEED TO PLAYOFFS" button
      appState.tournament = appState.tournamentModule.proceedToPlayoffs(appState.tournament);
      renderTournament();
      return;
    }

    // Simulate matches until current stage is complete or Grand Final is ready
    let safety = 0;
    while (safety < 100) {
      const isGFReady = appState.tournament.bracket && 
                        appState.tournament.bracket.grandFinal && 
                        appState.tournament.bracket.grandFinal.team1 && 
                        appState.tournament.bracket.grandFinal.team2 && 
                        !appState.tournament.bracket.grandFinal.played;

      const checkDone = (appState.tournament.stage === 'groups' && appState.tournament.groups.every(g => g.phase === 'complete')) ||
                        (appState.tournament.stage === 'swiss' && appState.tournament.swiss.teams.filter(team => team.status === 'active').length === 0) ||
                        isGFReady ||
                        appState.tournament.stage === 'complete';
      if (checkDone) break;

      const result = appState.tournamentModule.simulateNextStep(appState.tournament);
      appState.tournament = result.tournament;
      safety++;
    }

    renderTournament();
  });
  
  // Simulate All – runs the entire tournament to completion (skips everything directly to champion coronation banner!)
  document.getElementById('btn-sim-all').addEventListener('click', () => {
    if (!appState.tournament || !appState.tournamentModule) return;
    if (appState.tournament.stage !== 'complete') {
      const res = appState.tournamentModule.simulateAll(appState.tournament);
      Promise.resolve(res).then(result => {
        if (result && result.tournament) {
          appState.tournament = result.tournament;
        }
        appState.tournament.viewingStage = 'complete';
        renderTournament();
        if (appState.tournament.champion) {
          showChampionCelebration(appState.tournament.champion, appState.tournament.name);
        }
      });
    }
  });
}

function init() {
  initMenu();
  initTeamSelect();
  initTournamentControls();
  showScreen('menu');
}

document.addEventListener('DOMContentLoaded', init);
