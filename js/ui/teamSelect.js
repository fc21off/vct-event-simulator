import { appState, showScreen, renderTournament } from '../app.js';
import { TEAMS_BY_REGION, getRandomTeams } from '../data/teams.js';

let requiredCount = 16;
let quotaPerRegion = 4;

const formatTitles = {
  'masters8': 'VCT MASTERS',
  'masters12': 'VCT MASTERS',
  'champions16': 'VCT CHAMPIONS'
};

const formatCounts = {
  'masters8': 8,
  'masters12': 12,
  'champions16': 16
};

const regionLabels = {
  'AMER': 'Americas',
  'EMEA': 'EMEA',
  'PAC': 'Pacific',
  'CN': 'China'
};

export function initTeamSelect() {
  const btnBack = document.getElementById('btn-ts-back');
  const btnRandom = document.getElementById('btn-ts-randomize');
  const btnStart = document.getElementById('btn-ts-start');

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      showScreen('presets');
    });
  }

  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      appState.selectedTeams = getRandomTeams(requiredCount, true);
      renderTeamGrid();
      updateCounter();
    });
  }

  if (btnStart) {
    btnStart.addEventListener('click', async () => {
      if (validateSelection()) {
        await startTournament();
      }
    });
  }
}

let customCallback = null;

export function setupTeamSelect(format, callback = null) {
  customCallback = callback;
  if (typeof format === 'number') {
    requiredCount = format;
  } else {
    requiredCount = formatCounts[format] || 16;
  }
  quotaPerRegion = Math.ceil(requiredCount / 4);
  
  appState.selectedTeams = [];
  
  const titleEl = document.getElementById('ts-format-title');
  if (titleEl) {
    titleEl.textContent = typeof format === 'string' ? (formatTitles[format] || 'VCT CHAMPIONS') : 'CUSTOM TOURNAMENT';
  }
  
  const maxEl = document.getElementById('ts-counter-max');
  if (maxEl) {
    maxEl.textContent = requiredCount;
  }
  
  renderTeamGrid();
  updateCounter();
}

function getSelectedCountForRegion(region) {
  return appState.selectedTeams.filter(t => t.region === region).length;
}

function getSelectedTeamsForRegion(region) {
  return appState.selectedTeams.filter(t => t.region === region);
}

function renderTeamGrid() {
  const grid = document.getElementById('ts-team-grid');
  if (!grid) return;
  
  grid.innerHTML = '';

  const regions = ['AMER', 'EMEA', 'PAC', 'CN'];
  
  regions.forEach(region => {
    const col = document.createElement('div');
    col.className = 'region-box-column';
    
    const count = getSelectedCountForRegion(region);
    const selectedRegionTeams = getSelectedTeamsForRegion(region);
    
    // Region Header with Title and Fixed-Width Counter
    const header = document.createElement('div');
    header.className = 'region-box-header';
    header.innerHTML = `
      <span class="region-box-title">${regionLabels[region]}</span>
      <span class="region-box-quota ${count === quotaPerRegion ? 'quota-full' : ''}">${count}/${quotaPerRegion}</span>
    `;
    col.appendChild(header);

    // 12 Team Boxes Container
    const boxesContainer = document.createElement('div');
    boxesContainer.className = 'region-boxes-grid';

    const teams = (TEAMS_BY_REGION && TEAMS_BY_REGION[region]) ? TEAMS_BY_REGION[region] : [];
    
    teams.forEach(team => {
      const box = document.createElement('div');
      const selectedIndex = selectedRegionTeams.findIndex(t => t.id === team.id);
      const isSelected = selectedIndex >= 0;
      const seedNum = isSelected ? selectedIndex + 1 : null;
      
      box.className = `team-select-box ${isSelected ? 'selected' : ''}`;
      
      const logoHtml = team.logo ? `<img src="${team.logo}" alt="${team.name}" class="team-select-logo" />` : '';
      const seedBadgeHtml = isSelected && seedNum ? `<span class="seed-badge" title="Seed #${seedNum}">#${seedNum}</span>` : '';
      
      box.innerHTML = `
        ${logoHtml}
        <span class="team-tag-text">${team.tag || team.id}</span>
        ${seedBadgeHtml}
      `;
      
      box.title = `${team.name} ${isSelected ? `(Seed #${seedNum})` : ''}`;
      
      box.addEventListener('click', () => {
        toggleTeam(team);
        renderTeamGrid(); // Refresh grid state
      });
      
      boxesContainer.appendChild(box);
    });
    
    col.appendChild(boxesContainer);
    grid.appendChild(col);
  });
}

function toggleTeam(team) {
  const index = appState.selectedTeams.findIndex(t => t.id === team.id);
  
  if (index >= 0) {
    appState.selectedTeams.splice(index, 1);
  } else {
    const regionCount = getSelectedCountForRegion(team.region);
    if (regionCount < quotaPerRegion) {
      appState.selectedTeams.push(team);
    }
  }
  
  updateCounter();
}

function validateSelection() {
  const regions = ['AMER', 'EMEA', 'PAC', 'CN'];
  const isValid = regions.every(r => getSelectedCountForRegion(r) === quotaPerRegion);
  return isValid && appState.selectedTeams.length === requiredCount;
}

function updateCounter() {
  const totalCount = appState.selectedTeams.length;
  const numEl = document.getElementById('ts-counter-num');
  
  if (numEl) {
    numEl.textContent = totalCount;
  }
  
  const startBtn = document.getElementById('btn-ts-start');
  if (startBtn) {
    const valid = validateSelection();
    if (valid) {
      startBtn.classList.remove('btn-disabled');
      startBtn.disabled = false;
    } else {
      startBtn.classList.add('btn-disabled');
      startBtn.disabled = true;
    }
  }
}

async function startTournament() {
  if (customCallback) {
    const cb = customCallback;
    customCallback = null;
    cb(appState.selectedTeams);
    showScreen('tournament');
    return;
  }

  const format = appState.currentFormat;
  let moduleName = `${format}.js`;
  
  try {
    const formatModule = await import(`../formats/${moduleName}`);
    appState.tournamentModule = formatModule;
    
    const funcName = `create${format.charAt(0).toUpperCase()}${format.slice(1)}`;
    const createFunc = formatModule[funcName];
    
    if (createFunc) {
      appState.grandFinalState = null;
      appState.tournament = createFunc(appState.selectedTeams);
      showScreen('tournament');
      renderTournament();
    } else {
      console.error(`Export ${funcName} not found in ${moduleName}`);
    }
  } catch (err) {
    console.error("Error loading tournament module:", err);
  }
}
