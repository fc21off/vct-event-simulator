import { validateSandboxGraph } from '../engine/sandboxEngine.js';
import { saveCustomEvent } from '../data/sandbox.js';
import { showScreen } from '../navigation.js';

let editorState = {
  teamCount: 8,
  nodes: [],
  connections: [],
  drawingCable: null,
  draggedNode: null,
  dragOffset: { x: 0, y: 0 }
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
    dragOffset: { x: 0, y: 0 }
  };

  container.innerHTML = '';

  const viewport = document.createElement('div');
  viewport.className = 'sandbox-viewport';

  // Top Bar
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
    <div></div>
  `;
  viewport.appendChild(header);

  // Canvas Area
  const canvasArea = document.createElement('div');
  canvasArea.className = 'sandbox-canvas-area';
  canvasArea.id = 'sb-canvas-area';

  // SVG Layer for Wires
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'sandbox-svg-layer');
  svg.id = 'sb-svg-layer';
  canvasArea.appendChild(svg);

  // Nodes Layer
  const nodesLayer = document.createElement('div');
  nodesLayer.className = 'sandbox-nodes-layer';
  nodesLayer.id = 'sb-nodes-layer';
  canvasArea.appendChild(nodesLayer);

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

  // Pre-seed default Starter Nodes (Team Slots, Gameboxes, Champ, Elim)
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

function bindEditorEvents(viewport) {
  // Toolbar Buttons
  viewport.querySelector('#btn-sb-back').addEventListener('click', () => {
    showScreen('sandbox-menu');
    const container = document.getElementById('screen-sandbox-menu');
    if (container) {
      import('./sandboxMenu.js').then(mod => mod.renderSandboxMenu(container));
    }
  });

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

  // Mousemove for dragging nodes or cable drawing
  const canvasArea = viewport.querySelector('#sb-canvas-area');

  canvasArea.addEventListener('mousemove', (e) => {
    if (editorState.draggedNode) {
      const rect = canvasArea.getBoundingClientRect();
      editorState.draggedNode.x = e.clientX - rect.left - editorState.dragOffset.x;
      editorState.draggedNode.y = e.clientY - rect.top - editorState.dragOffset.y;
      renderEditor();
    } else if (editorState.drawingCable) {
      const rect = canvasArea.getBoundingClientRect();
      editorState.drawingCable.tempX = e.clientX - rect.left;
      editorState.drawingCable.tempY = e.clientY - rect.top;
      renderWires();
    }
  });

  canvasArea.addEventListener('mouseup', () => {
    editorState.draggedNode = null;
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
  const canvasArea = document.getElementById('sb-canvas-area');
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

  const node = editorState.nodes.find(n => n.id === nodeId);
  return { x: (node ? node.x : 0) + 50, y: (node ? node.y : 0) + 30 };
}

function renderEditor() {
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
      <span class="sb-node-title">${n.label}</span>
      <button class="sb-node-delete" title="Delete Node">✕</button>
    `;

    header.querySelector('.sb-node-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNode(n.id);
    });

    header.addEventListener('mousedown', (e) => {
      const rect = nodeEl.getBoundingClientRect();
      editorState.draggedNode = n;
      editorState.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
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

      // Grand Final Toggle Button inside body
      const gfBtn = document.createElement('button');
      gfBtn.className = 'sb-tool-btn';
      gfBtn.style.cssText = 'width: 100%; font-size: 0.75rem; padding: 0.3rem; margin-top: 0.4rem;';
      gfBtn.textContent = n.isGrandFinal ? 'GRAND FINAL (BO5)' : 'Make Grand Final';
      gfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        n.isGrandFinal = !n.isGrandFinal;
        n.label = n.isGrandFinal ? 'GRAND FINAL' : 'GAME';
        renderEditor();
      });
      nodeEl.appendChild(gfBtn);

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

    } else if (n.type === 'champion' || n.type === 'elimination') {
      const inPort = document.createElement('div');
      inPort.className = 'sb-port port-input port-in1';
      inPort.style.top = '40%';
      inPort.title = 'Input Path';
      inPort.addEventListener('click', (e) => onPortClick(e, n.id, 'in1', 'input'));
      nodeEl.appendChild(inPort);
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
      // Remove any existing incoming connection to this specific target port
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
    path.addEventListener('click', () => {
      editorState.connections.splice(idx, 1);
      renderWires();
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
