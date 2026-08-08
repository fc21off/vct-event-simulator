import { openGrandFinalModal, showChampionCelebration } from '../app.js';

/**
 * Renders a custom Sandbox Tournament Bracket view matching the node graph layout.
 * @param {HTMLElement} container 
 * @param {Object} tournament 
 */
export function renderSandboxView(container, tournament) {
  container.innerHTML = '';

  const viewport = document.createElement('div');
  viewport.className = 'sandbox-viewport';
  viewport.style.cssText = 'position: relative; width: 100%; min-height: 700px; height: calc(100vh - 120px); background: #090c10; background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px); background-size: 24px 24px; overflow: auto; user-select: none;';

  const canvasArea = document.createElement('div');
  canvasArea.id = 'live-sandbox-canvas';
  canvasArea.style.cssText = 'position: relative; min-width: 1200px; min-height: 800px; width: 100%; height: 100%;';

  // SVG Layer for Live Wires
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'sandbox-svg-layer');
  svg.id = 'live-sandbox-svg';
  svg.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;';
  canvasArea.appendChild(svg);

  // Nodes Layer
  const nodesLayer = document.createElement('div');
  nodesLayer.id = 'live-sandbox-nodes';
  nodesLayer.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; z-index: 5;';
  canvasArea.appendChild(nodesLayer);

  viewport.appendChild(canvasArea);
  container.appendChild(viewport);

  // Render Nodes & Wires after DOM attachment
  renderLiveNodes(nodesLayer, tournament);
  
  // Timeout ensures getBoundingClientRect has valid rects for SVG wires
  setTimeout(() => {
    renderLiveWires(svg, canvasArea, tournament);
  }, 30);

  // Check if champion just won and celebrate!
  if (tournament.champion && !tournament.celebrated) {
    tournament.celebrated = true;
    setTimeout(() => {
      showChampionCelebration(tournament.champion, tournament.name);
    }, 500);
  }
}

function renderLiveNodes(layer, tournament) {
  layer.innerHTML = '';

  tournament.nodes.forEach(n => {
    const nodeEl = document.createElement('div');
    const isGF = n.isGrandFinal;
    nodeEl.id = `live-node-${n.id}`;
    nodeEl.className = `sb-node node-${n.type} ${isGF ? 'node-grandfinal' : ''}`;
    nodeEl.style.left = `${n.x}px`;
    nodeEl.style.top = `${n.y}px`;
    nodeEl.style.cursor = 'default';

    // Header
    const header = document.createElement('div');
    header.className = 'sb-node-header';
    header.innerHTML = `<span class="sb-node-title">${isGF ? '🏆 GRAND FINAL (BO5)' : (n.label || n.type.toUpperCase())}</span>`;
    nodeEl.appendChild(header);

    if (n.type === 'gamebox') {
      const isPlayed = n.played;
      const t1 = n.team1;
      const t2 = n.team2;

      const t1Win = isPlayed && n.winner && t1 && n.winner.id === t1.id;
      const t2Win = isPlayed && n.winner && t2 && n.winner.id === t2.id;
      const t1Lose = isPlayed && n.winner && t1 && n.winner.id !== t1.id;
      const t2Lose = isPlayed && n.winner && t2 && n.winner.id !== t2.id;

      const t1Name = t1 ? (t1.tag || t1.name) : 'TBD';
      const t2Name = t2 ? (t2.tag || t2.name) : 'TBD';

      const t1Score = n.team1Score !== null && n.team1Score !== undefined ? n.team1Score : '-';
      const t2Score = n.team2Score !== null && n.team2Score !== undefined ? n.team2Score : '-';

      const t1Logo = t1 && t1.logo ? `<img src="${t1.logo}" alt="" style="width: 18px; height: 18px; object-fit: contain; margin-right: 6px;" />` : '';
      const t2Logo = t2 && t2.logo ? `<img src="${t2.logo}" alt="" style="width: 18px; height: 18px; object-fit: contain; margin-right: 6px;" />` : '';

      // In Ports (Left)
      const in1 = document.createElement('div');
      in1.className = 'sb-port port-input port-in1';
      nodeEl.appendChild(in1);

      const in2 = document.createElement('div');
      in2.className = 'sb-port port-input port-in2';
      nodeEl.appendChild(in2);

      // Out Ports (Right)
      const winPort = document.createElement('div');
      winPort.className = 'sb-port port-winner';
      nodeEl.appendChild(winPort);

      const losePort = document.createElement('div');
      losePort.className = 'sb-port port-loser';
      nodeEl.appendChild(losePort);

      // Match Card
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(0,0,0,0.5); border-radius: 4px; padding: 0.5rem; margin-top: 0.3rem; border: 1px solid rgba(255,255,255,0.1);';
      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.2rem 0; ${t1Win ? 'color: #00ff66; font-weight: 900;' : (t1Lose ? 'color: #777;' : 'color: #fff;')}">
          <div style="display: flex; align-items: center;">${t1Logo}<span>${t1Name}</span></div>
          <span style="font-weight: 900; font-family: var(--font-heading); margin-left: 0.5rem;">${t1Score}</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.2rem 0; ${t2Win ? 'color: #00ff66; font-weight: 900;' : (t2Lose ? 'color: #777;' : 'color: #fff;')}">
          <div style="display: flex; align-items: center;">${t2Logo}<span>${t2Name}</span></div>
          <span style="font-weight: 900; font-family: var(--font-heading); margin-left: 0.5rem;">${t2Score}</span>
        </div>
      `;

      if (isGF) {
        card.style.cursor = 'pointer';
        card.title = 'Click to inspect Grand Final Match';
        card.addEventListener('click', () => {
          openGrandFinalModal();
        });
      }

      nodeEl.appendChild(card);

    } else if (n.type === 'teambox') {
      const teamObj = n.team1 || n.team;
      const logoHtml = teamObj && teamObj.logo ? `<img src="${teamObj.logo}" alt="" style="width: 20px; height: 20px; object-fit: contain; margin-right: 6px;" />` : '';
      const name = teamObj ? (teamObj.tag || teamObj.name) : `SEED #${n.seedIndex || 1}`;
      const elo = teamObj ? `ELO ${teamObj.elo}` : '';

      nodeEl.innerHTML = `
        <div class="sb-node-header" style="margin-bottom: 0.2rem;">
          <span class="sb-node-title" style="font-size: 0.75rem; color: #00aeef;">SEED #${n.seedIndex || 1}</span>
        </div>
        <div style="display: flex; align-items: center; background: rgba(0,174,239,0.1); border: 1px solid rgba(0,174,239,0.3); padding: 0.4rem 0.6rem; border-radius: 4px;">
          ${logoHtml}
          <div>
            <div style="font-weight: 800; color: #fff; font-size: 0.85rem;">${name}</div>
            <div style="font-size: 0.65rem; color: #aaa;">${elo}</div>
          </div>
        </div>
        <div class="sb-port port-out" style="right: -9px; top: 40%; background: #00aeef; border-color: #00aeef;"></div>
      `;

    } else if (n.type === 'champion') {
      const champ = tournament.champion;
      const inPort = document.createElement('div');
      inPort.className = 'sb-port port-input port-in1';
      inPort.style.top = '40%';
      nodeEl.appendChild(inPort);

      const champCard = document.createElement('div');
      champCard.className = 'sb-node-feed-card';
      if (champ) {
        champCard.innerHTML = `
          <div style="font-size: 1.2rem; margin-bottom: 0.2rem;">🏆</div>
          <div style="font-weight: 900; color: #bdb578; font-size: 1rem;">${champ.tag || champ.name}</div>
          <div style="font-size: 0.7rem; color: #fff; font-weight: 700;">TOURNAMENT CHAMPION</div>
        `;
        nodeEl.style.borderColor = '#bdb578';
        nodeEl.style.boxShadow = '0 0 25px rgba(189, 181, 120, 0.6)';
      } else {
        champCard.innerHTML = `
          <div class="feed-champ-title">CROWNS CHAMPION</div>
          <div class="feed-champ-source">TBD</div>
        `;
      }
      nodeEl.appendChild(champCard);

    } else if (n.type === 'elimination') {
      const inPort = document.createElement('div');
      inPort.className = 'sb-port port-input port-in1';
      inPort.style.top = '40%';
      nodeEl.appendChild(inPort);

      // Collect eliminated teams
      const elimTeams = tournament.nodes
        .filter(gb => gb.type === 'gamebox' && gb.played && gb.loser)
        .map(gb => gb.loser.tag || gb.loser.name);

      const elimCard = document.createElement('div');
      elimCard.className = 'sb-node-feed-card';
      elimCard.innerHTML = `
        <div class="feed-elim-title">ELIMINATED TEAMS</div>
        <div class="feed-elim-source" style="font-size: 0.75rem; font-weight: 700;">
          ${elimTeams.length > 0 ? elimTeams.join(', ') : 'NONE YET'}
        </div>
      `;
      nodeEl.appendChild(elimCard);
    }

    layer.appendChild(nodeEl);
  });
}

function getPortCoordinatesInView(canvasArea, nodeId, portType) {
  const nodeEl = document.getElementById(`live-node-${nodeId}`);
  if (!nodeEl || !canvasArea) return { x: 0, y: 0 };

  const canvasRect = canvasArea.getBoundingClientRect();
  const portEl = nodeEl.querySelector(`.port-${portType}`);

  if (portEl) {
    const portRect = portEl.getBoundingClientRect();
    return {
      x: portRect.left + portRect.width / 2 - canvasRect.left,
      y: portRect.top + portRect.height / 2 - canvasRect.top
    };
  }

  return { x: 0, y: 0 };
}

function renderLiveWires(svg, canvasArea, tournament) {
  svg.innerHTML = '';
  if (!tournament.connections) return;

  tournament.connections.forEach(c => {
    const start = getPortCoordinatesInView(canvasArea, c.fromNodeId, c.fromPort);
    const end = getPortCoordinatesInView(canvasArea, c.toNodeId, c.toPort);

    if (start.x === 0 && start.y === 0 || end.x === 0 && end.y === 0) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const sourceNode = tournament.nodes.find(n => n.id === c.fromNodeId);

    let cableClass = 'cable-team';
    if (c.fromPort === 'winner') cableClass = 'cable-winner';
    else if (c.fromPort === 'loser') cableClass = 'cable-loser';

    if (sourceNode && sourceNode.played) {
      cableClass += ' cable-played';
    }

    path.setAttribute('class', `sandbox-cable ${cableClass}`);

    const dx = Math.abs(end.x - start.x) * 0.5;
    const d = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
    path.setAttribute('d', d);

    svg.appendChild(path);
  });
}
