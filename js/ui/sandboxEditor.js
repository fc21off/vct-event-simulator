import { validateSandboxGraph } from '../engine/sandboxEngine.js';
import { saveCustomEvent } from '../data/sandbox.js';
import { showScreen } from '../navigation.js';

let editorState = {
  teamCount: 8,
  nodes: [],
  connections: [],
  drawingCable: null,
  draggedNode: null,
  dragOffset: { x: 0, y: 0 },
  zoom: 1.0
};

/**
 * Initializes and launches the Sandbox Node Editor for a specified team count.
 * @param {HTMLElement} container 
 * @param {number} teamCount 
 */
export function initSandboxEditor(container, teamCount = 8) {
  editorState = {
    teamCount,
    nodes: [],
    connections: [],
    drawingCable: null,
    draggedNode: null,
    dragOffset: { x: 0, y: 0 },
    zoom: 1.0
  };

  container.innerHTML = '';

  const viewport = document.createElement('div');
  viewport.className = 'sandbox-viewport';

  // Top Bar with Header & Zoom Controls
  const header = document.createElement('div');
  header.className = 'sandbox-header-bar';
  header.innerHTML = `
    <button id="btn-sb-back" class="btn-back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>CANCEL</span>
    </button>
    <div class="sandbox-title">SANDBOX BRACKET EDITOR (${teamCount} TEAMS)</div>
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <button id="btn-sb-zoom-out" class="sb-tool-btn" style="padding: 0.3rem 0.7rem; font-size: 0.9rem;" title="Zoom Out (-)">−</button>
      <span id="sb-zoom-level" style="font-family: var(--font-heading); font-size: 0.85rem; font-weight: 800; color: #bdb578; width: 48px; text-align: center;">100%</span>
      <button id="btn-sb-zoom-in" class="sb-tool-btn" style="padding: 0.3rem 0.7rem; font-size: 0.9rem;" title="Zoom In (+)">+</button>
      <button id="btn-sb-zoom-reset" class="sb-tool-btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" title="Reset Zoom">RESET</button>
    </div>
  `;
  viewport.appendChild(header);

  // Canvas Area
  const canvasArea = document.createElement('div');
  canvasArea.className = 'sandbox-canvas-area';
  canvasArea.id = 'sb-canvas-area';

  const zoomContainer = document.createElement('div');
  zoomContainer.id = 'sb-zoom-container';

  // SVG Layer for Wires
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'sandbox-svg-layer');
  svg.id = 'sb-svg-layer';
  zoomContainer.appendChild(svg);

  // Nodes Layer
  const nodesLayer = document.createElement('div');
  nodesLayer.className = 'sandbox-nodes-layer';
  nodesLayer.id = 'sb-nodes-layer';
  zoomContainer.appendChild(nodesLayer);

  canvasArea.appendChild(zoomContainer);
  viewport.appendChild(canvasArea);

  // Bottom Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'sandbox-toolbar';
  toolbar.innerHTML = `
    <button id="btn-sb-add-teambox" class="sb-tool-btn" style="border-color: #00aeef; color: #00aeef;">+ SEED / TEAM</button>
    <button id="btn-sb-add-gamebox" class="sb-tool-btn">+ GAMEBOX</button>
    <button id="btn-sb-add-elim" class="sb-tool-btn">+ ELIMINATION (X)</button>
    <button id="btn-sb-add-champ" class="sb-tool-btn">+ CHAMPION BOX</button>
    <button id="btn-sb-clear" class="sb-tool-btn">CLEAR ALL</button>
    <button id="btn-sb-finish" class="sb-tool-btn btn-finish">DONE! FINISH BRACKET</button>
  `;
  viewport.appendChild(toolbar);

  container.appendChild(viewport);

  // Bind Events
  bindEditorEvents(viewport);

  // Pre-seed default Starter Nodes
  createDefaultStarterNodes();
  renderEditor();
}

function createDefaultStarterNodes() {
  const count = editorState.teamCount || 8;
  const nodes = [];

  // Team Box Nodes (Column 1)
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: `tb_${i + 1}`,
      type: 'teambox',
      seedIndex: i + 1,
      label: `SEED #${i + 1}`,
      x: 50,
      y: 40 + i * 75
    });
  }

  // Initial Gameboxes (Column 2)
  const gameCount = Math.max(1, Math.floor(count / 2));
  for (let g = 0; g < gameCount; g++) {
    nodes.push({
      id: `gb_${g + 1}`,
      type: 'gamebox',
      label: `GAME ${g + 1}`,
      x: 280,
      y: 80 + g * 160,
      isGrandFinal: false
    });
  }

  // Champion Box (Column 4)
  nodes.push({
    id: 'node_champ',
    type: 'champion',
    label: 'CHAMPION',
    x: 750,
    y: 180
  });

  // Elimination Box (Column 3)
  nodes.push({
    id: 'node_elim_1',
    type: 'elimination',
    label: 'ELIMINATED (X)',
    x: 520,
    y: 360
  });

  editorState.nodes = nodes;
}

function applyZoomTransform() {
  const zoomContainer = document.getElementById('sb-zoom-container');
  const zoomLabel = document.getElementById('sb-zoom-level');

  if (zoomContainer) {
    zoomContainer.style.transform = `scale(${editorState.zoom})`;
    zoomContainer.style.transformOrigin = '0 0';
  }
  if (zoomLabel) {
    zoomLabel.textContent = `${Math.round(editorState.zoom * 100)}%`;
  }
}

function bindEditorEvents(viewport) {
  // Navigation Back
  viewport.querySelector('#btn-sb-back').addEventListener('click', () => {
    showScreen('sandbox-menu');
    const container = document.getElementById('screen-sandbox-menu');
    if (container) {
      import('./sandboxMenu.js').then(mod => mod.renderSandboxMenu(container));
    }
  });

  // Zoom Controls
  viewport.querySelector('#btn-sb-zoom-in').addEventListener('click', () => {
    editorState.zoom = Math.min(2.0, +(editorState.zoom + 0.15).toFixed(2));
    applyZoomTransform();
    renderWires();
  });

  viewport.querySelector('#btn-sb-zoom-out').addEventListener('click', () => {
    editorState.zoom = Math.max(0.4, +(editorState.zoom - 0.15).toFixed(2));
    applyZoomTransform();
    renderWires();
  });

  viewport.querySelector('#btn-sb-zoom-reset').addEventListener('click', () => {
    editorState.zoom = 1.0;
    applyZoomTransform();
    renderWires();
  });

  // Toolbar Add Buttons
  viewport.querySelector('#btn-sb-add-teambox').addEventListener('click', () => {
    const teamboxes = editorState.nodes.filter(n => n.type === 'teambox');
    const seedIdx = teamboxes.length + 1;
    const tb = {
      id: `tb_${Date.now()}`,
      type: 'teambox',
      seedIndex: seedIdx,
      label: `SEED #${seedIdx}`,
      x: 50,
      y: 40 + teamboxes.length * 75
    };
    editorState.nodes.push(tb);
    renderEditor();
  });

  viewport.querySelector('#btn-sb-add-gamebox').addEventListener('click', () => {
    const count = editorState.nodes.filter(n => n.type === 'gamebox').length + 1;
    const gb = {
      id: `gb_${Date.now()}`,
      type: 'gamebox',
      label: `GAME ${count}`,
      x: 280 + (count * 20),
      y: 100 + (count * 20),
      isGrandFinal: false
    };
    editorState.nodes.push(gb);
    renderEditor();
  });

  viewport.querySelector('#btn-sb-add-elim').addEventListener('click', () => {
    const count = editorState.nodes.filter(n => n.type === 'elimination').length + 1;
    const elim = {
      id: `elim_${Date.now()}`,
      type: 'elimination',
      label: 'ELIMINATED (X)',
      x: 520 + (count * 20),
      y: 300 + (count * 20)
    };
    editorState.nodes.push(elim);
    renderEditor();
  });

  viewport.querySelector('#btn-sb-add-champ').addEventListener('click', () => {
    if (editorState.nodes.some(n => n.type === 'champion')) {
      alert('Champion Box already exists!');
      return;
    }
    const champ = {
      id: 'node_champ',
      type: 'champion',
      label: 'CHAMPION',
      x: 750,
      y: 180
    };
    editorState.nodes.push(champ);
    renderEditor();
  });

  viewport.querySelector('#btn-sb-clear').addEventListener('click', () => {
    editorState.nodes = [];
    editorState.connections = [];
    renderEditor();
  });

  viewport.querySelector('#btn-sb-finish').addEventListener('click', () => {
    finishAndValidateBracket();
  });

  const canvasArea = viewport.querySelector('#sb-canvas-area');

  // Mouse Wheel Zoom
  canvasArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    editorState.zoom = Math.min(Math.max(0.4, +(editorState.zoom + delta).toFixed(2)), 2.0);
    applyZoomTransform();
    renderWires();
  }, { passive: false });

  // Mousemove for dragging nodes or cable drawing
  canvasArea.addEventListener('mousemove', (e) => {
    const zoomContainer = document.getElementById('sb-zoom-container');
    if (!zoomContainer) return;
    const rect = zoomContainer.getBoundingClientRect();
    const zoom = editorState.zoom || 1.0;

    if (editorState.draggedNode) {
      editorState.draggedNode.x = (e.clientX - rect.left - editorState.dragOffset.x) / zoom;
      editorState.draggedNode.y = (e.clientY - rect.top - editorState.dragOffset.y) / zoom;
      renderEditor();
    } else if (editorState.drawingCable) {
      editorState.drawingCable.tempX = (e.clientX - rect.left) / zoom;
      editorState.drawingCable.tempY = (e.clientY - rect.top) / zoom;
      renderWires();
    }
  });

  canvasArea.addEventListener('mouseup', () => {
    editorState.draggedNode = null;
  });

  // Clicking empty canvas area cancels active cable drawing
  canvasArea.addEventListener('click', (e) => {
    if (editorState.drawingCable && !e.target.classList.contains('sb-port')) {
      editorState.drawingCable = null;
      renderWires();
    }
  });

  // ESC key cancels active cable drawing
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editorState.drawingCable) {
      editorState.drawingCable = null;
      renderWires();
    }
  });
}

function finishAndValidateBracket() {
  const validation = validateSandboxGraph(editorState.nodes, editorState.connections, editorState.teamCount);
  if (!validation.isValid) {
    alert(`Validation Failed:\n\n${validation.error}`);
    return;
  }

  const modal = document.getElementById('modal-sandbox-save');
  if (!modal) return;

  const btnClose = document.getElementById('btn-close-sb-save');
  const btnConfirm = document.getElementById('btn-sb-confirm-save');
  const inputName = document.getElementById('input-sb-event-name');

  if (btnClose) {
    btnClose.onclick = () => modal.classList.remove('active');
  }

  if (btnConfirm && inputName) {
    inputName.value = `VCT CUSTOM BRACKET ${editorState.teamCount}T`;
    btnConfirm.onclick = () => {
      const name = inputName.value.trim();
      if (!name) return;

      const customEvent = {
        id: `custom_${Date.now()}`,
        name: name.toUpperCase(),
        teamCount: editorState.teamCount,
        nodes: editorState.nodes,
        connections: editorState.connections
      };

      saveCustomEvent(customEvent);
      modal.classList.remove('active');

      showScreen('sandbox-menu');
      const container = document.getElementById('screen-sandbox-menu');
      if (container) {
        import('./sandboxMenu.js').then(mod => mod.renderSandboxMenu(container));
      }
    };
  }

  modal.classList.add('active');
}

function getPortCoordinates(nodeId, portType) {
  const nodeEl = document.getElementById(`node-${nodeId}`);
  const zoomContainer = document.getElementById('sb-zoom-container');
  if (!nodeEl || !zoomContainer) return { x: 0, y: 0 };

  const containerRect = zoomContainer.getBoundingClientRect();
  const portEl = nodeEl.querySelector(`.port-${portType}`);
  const zoom = editorState.zoom || 1.0;

  if (portEl) {
    const portRect = portEl.getBoundingClientRect();
    return {
      x: (portRect.left + portRect.width / 2 - containerRect.left) / zoom,
      y: (portRect.top + portRect.height / 2 - containerRect.top) / zoom
    };
  }

  const node = editorState.nodes.find(n => n.id === nodeId);
  return { x: (node ? node.x : 0) + 50, y: (node ? node.y : 0) + 30 };
}

function getIncomingFeedLabel(nodeId, portType) {
  const conn = editorState.connections.find(c => c.toNodeId === nodeId && c.toPort === portType);
  if (!conn) return 'TBD (EMPTY)';

  const sourceNode = editorState.nodes.find(n => n.id === conn.fromNodeId);
  if (!sourceNode) return 'TBD';

  if (sourceNode.type === 'teambox') {
    return sourceNode.label || `SEED #${sourceNode.seedIndex}`;
  } else if (sourceNode.type === 'gamebox') {
    const isWinner = conn.fromPort === 'winner';
    const isGF = sourceNode.isGrandFinal;
    const prefix = isGF ? 'GRAND FINAL' : (sourceNode.label || 'GAME');
    return `${isWinner ? 'WINNER' : 'LOSER'} OF ${prefix}`;
  }
  return 'TBD';
}

function renderEditor() {
  applyZoomTransform();

  // Auto-detect Grand Final: The Gamebox whose winner output connects directly to the Champion Box
  const champNode = editorState.nodes.find(n => n.type === 'champion');
  let gfNodeId = null;
  if (champNode) {
    const connToChamp = editorState.connections.find(c => c.toNodeId === champNode.id);
    if (connToChamp) {
      gfNodeId = connToChamp.fromNodeId;
    }
  }

  // Update Gamebox titles & grand final status
  let gameCounter = 1;
  editorState.nodes.forEach(n => {
    if (n.type === 'gamebox') {
      n.isGrandFinal = (n.id === gfNodeId);
      if (n.isGrandFinal) {
        n.label = 'GRAND FINAL';
      } else {
        n.label = `GAME ${gameCounter++}`;
      }
    }
  });

  renderNodes();
  renderWires();
}

function renderNodes() {
  const layer = document.getElementById('sb-nodes-layer');
  if (!layer) return;
  layer.innerHTML = '';

  editorState.nodes.forEach(n => {
    const nodeEl = document.createElement('div');
    const isGF = n.isGrandFinal;
    nodeEl.id = `node-${n.id}`;
    nodeEl.className = `sb-node node-${n.type} ${isGF ? 'node-grandfinal' : ''}`;
    nodeEl.style.left = `${n.x}px`;
    nodeEl.style.top = `${n.y}px`;

    // Drag header
    const header = document.createElement('div');
    header.className = 'sb-node-header';
    header.innerHTML = `
      <span class="sb-node-title">${isGF ? '🏆 GRAND FINAL (BO5)' : n.label}</span>
      <button class="sb-node-delete" title="Delete Node">✕</button>
    `;

    header.querySelector('.sb-node-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNode(n.id);
    });

    header.addEventListener('mousedown', (e) => {
      const rect = nodeEl.getBoundingClientRect();
      const zoom = editorState.zoom || 1.0;
      editorState.draggedNode = n;
      editorState.dragOffset = {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom
      };
    });

    nodeEl.appendChild(header);

    // Node Ports & Controls based on Type
    if (n.type === 'gamebox') {
      // In Ports (Left)
      const in1 = document.createElement('div');
      in1.className = 'sb-port port-input port-in1';
      in1.title = 'Input 1';
      in1.addEventListener('click', (e) => onPortClick(e, n.id, 'in1', 'input'));
      nodeEl.appendChild(in1);

      const in2 = document.createElement('div');
      in2.className = 'sb-port port-input port-in2';
      in2.title = 'Input 2';
      in2.addEventListener('click', (e) => onPortClick(e, n.id, 'in2', 'input'));
      nodeEl.appendChild(in2);

      // Out Ports (Right)
      const winPort = document.createElement('div');
      winPort.className = 'sb-port port-winner';
      winPort.title = 'Winner Path (Green)';
      winPort.addEventListener('click', (e) => onPortClick(e, n.id, 'winner', 'output'));
      nodeEl.appendChild(winPort);

      const losePort = document.createElement('div');
      losePort.className = 'sb-port port-loser';
      losePort.title = 'Loser Path (Red)';
      losePort.addEventListener('click', (e) => onPortClick(e, n.id, 'loser', 'output'));
      nodeEl.appendChild(losePort);

      // Display incoming feeds VS card inside Gamebox
      const feed1 = getIncomingFeedLabel(n.id, 'in1');
      const feed2 = getIncomingFeedLabel(n.id, 'in2');

      const feedCard = document.createElement('div');
      feedCard.className = 'sb-node-feed-card';
      feedCard.innerHTML = `
        <div class="feed-team">${feed1}</div>
        <div class="feed-vs">VS</div>
        <div class="feed-team">${feed2}</div>
      `;
      nodeEl.appendChild(feedCard);

    } else if (n.type === 'teambox') {
      const info = document.createElement('div');
      info.style.cssText = 'font-size: 0.75rem; color: #00aeef; font-weight: 700; text-transform: uppercase; margin-top: 0.3rem;';
      info.textContent = `SLOT #${n.seedIndex || 1}`;
      nodeEl.appendChild(info);

      const outPort = document.createElement('div');
      outPort.className = 'sb-port port-out';
      outPort.style.right = '-9px';
      outPort.style.top = '40%';
      outPort.style.background = '#00aeef';
      outPort.style.borderColor = '#00aeef';
      outPort.title = 'Connect to Gamebox Input';
      outPort.addEventListener('click', (e) => onPortClick(e, n.id, 'out', 'output'));
      nodeEl.appendChild(outPort);

    } else if (n.type === 'champion') {
      const inPort = document.createElement('div');
      inPort.className = 'sb-port port-input port-in1';
      inPort.style.top = '40%';
      inPort.title = 'Input Path';
      inPort.addEventListener('click', (e) => onPortClick(e, n.id, 'in1', 'input'));
      nodeEl.appendChild(inPort);

      const champFeed = getIncomingFeedLabel(n.id, 'in1');
      const feedCard = document.createElement('div');
      feedCard.className = 'sb-node-feed-card';
      feedCard.innerHTML = `
        <div class="feed-champ-title">CROWNS CHAMPION:</div>
        <div class="feed-champ-source">${champFeed}</div>
      `;
      nodeEl.appendChild(feedCard);

    } else if (n.type === 'elimination') {
      const inPort = document.createElement('div');
      inPort.className = 'sb-port port-input port-in1';
      inPort.style.top = '40%';
      inPort.title = 'Input Path';
      inPort.addEventListener('click', (e) => onPortClick(e, n.id, 'in1', 'input'));
      nodeEl.appendChild(inPort);

      const elimFeed = getIncomingFeedLabel(n.id, 'in1');
      const feedCard = document.createElement('div');
      feedCard.className = 'sb-node-feed-card';
      feedCard.innerHTML = `
        <div class="feed-elim-title">ELIMINATES:</div>
        <div class="feed-elim-source">${elimFeed}</div>
      `;
      nodeEl.appendChild(feedCard);
    }

    layer.appendChild(nodeEl);
  });
}

function deleteNode(nodeId) {
  editorState.nodes = editorState.nodes.filter(n => n.id !== nodeId);
  editorState.connections = editorState.connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
  renderEditor();
}

function onPortClick(e, nodeId, portType, direction) {
  e.stopPropagation();

  if (direction === 'output') {
    // SINGLE CONNECTION RULE: Output port can only connect to ONE target.
    // Clear any existing connection originating from this output port
    editorState.connections = editorState.connections.filter(c => !(c.fromNodeId === nodeId && c.fromPort === portType));

    // Start drawing cable
    const startCoords = getPortCoordinates(nodeId, portType);
    editorState.drawingCable = {
      fromNodeId: nodeId,
      fromPort: portType,
      tempX: startCoords.x,
      tempY: startCoords.y
    };
    renderWires();
  } else if (direction === 'input' && editorState.drawingCable) {
    // Complete cable connection
    const fromId = editorState.drawingCable.fromNodeId;
    const fromPort = editorState.drawingCable.fromPort;

    // Prevent self-connection
    if (fromId !== nodeId) {
      // SINGLE CONNECTION RULE: Input port can only receive ONE incoming cable.
      // Clear any existing connection arriving at this input port
      editorState.connections = editorState.connections.filter(c => !(c.toNodeId === nodeId && c.toPort === portType));

      editorState.connections.push({
        fromNodeId: fromId,
        fromPort: fromPort,
        toNodeId: nodeId,
        toPort: portType
      });
    }

    editorState.drawingCable = null;
    renderEditor();
  }
}

function renderWires() {
  const svg = document.getElementById('sb-svg-layer');
  if (!svg) return;
  svg.innerHTML = '';

  // Render existing connections
  editorState.connections.forEach((c, idx) => {
    const start = getPortCoordinates(c.fromNodeId, c.fromPort);
    const end = getPortCoordinates(c.toNodeId, c.toPort);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const cableClass = c.fromPort === 'winner' ? 'cable-winner' : (c.fromPort === 'out' ? 'cable-team' : 'cable-loser');
    path.setAttribute('class', `sandbox-cable ${cableClass}`);

    // Cubic Bezier curve
    const dx = Math.abs(end.x - start.x) * 0.5;
    const d = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
    path.setAttribute('d', d);

    // Click cable to remove it
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      editorState.connections.splice(idx, 1);
      renderEditor();
    });

    svg.appendChild(path);
  });

  // Render cable currently being drawn
  if (editorState.drawingCable) {
    const start = getPortCoordinates(editorState.drawingCable.fromNodeId, editorState.drawingCable.fromPort);
    const end = { x: editorState.drawingCable.tempX, y: editorState.drawingCable.tempY };

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'sandbox-cable cable-drawing');

    const dx = Math.abs(end.x - start.x) * 0.5;
    const d = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
    path.setAttribute('d', d);

    svg.appendChild(path);
  }
}
