// ============================================
// CAMPUS MAP DATA
// ============================================
const campusData = {
    nodes: [
        { id: 1, name: "Main Entrance", x: 100, y: 350, type: "entrance" },
        { id: 2, name: "Reception", x: 200, y: 300, type: "building" },
        { id: 3, name: "Admin Office", x: 300, y: 250, type: "building" },
        { id: 4, name: "Corridor A", x: 400, y: 300, type: "corridor" },
        { id: 5, name: "Lab 101", x: 350, y: 400, type: "lab" },
        { id: 6, name: "Lab 102", x: 450, y: 400, type: "lab" },
        { id: 7, name: "Library", x: 550, y: 250, type: "library" },
        { id: 8, name: "Main Hall", x: 400, y: 150, type: "hall" },
        { id: 9, name: "Cafeteria", x: 600, y: 350, type: "cafeteria" },
        { id: 10, name: "Computer Lab", x: 550, y: 150, type: "lab" },
        { id: 11, name: "Auditorium", x: 700, y: 200, type: "auditorium" },
        { id: 12, name: "Science Block", x: 500, y: 500, type: "science" },
        { id: 13, name: "Sports Complex", x: 750, y: 400, type: "sports" },
        { id: 14, name: "Parking Area", x: 150, y: 450, type: "parking" },
        { id: 15, name: "Garden", x: 250, y: 180, type: "garden" }
    ],
    edges: [
        { from: 1, to: 2, weight: 15 },
        { from: 2, to: 3, weight: 12 },
        { from: 2, to: 14, weight: 20 },
        { from: 2, to: 15, weight: 18 },
        { from: 3, to: 4, weight: 14 },
        { from: 3, to: 15, weight: 10 },
        { from: 4, to: 5, weight: 12 },
        { from: 4, to: 6, weight: 10 },
        { from: 4, to: 7, weight: 18 },
        { from: 4, to: 8, weight: 16 },
        { from: 5, to: 6, weight: 10 },
        { from: 5, to: 12, weight: 15 },
        { from: 6, to: 12, weight: 12 },
        { from: 7, to: 9, weight: 14 },
        { from: 7, to: 8, weight: 18 },
        { from: 7, to: 10, weight: 12 },
        { from: 8, to: 10, weight: 15 },
        { from: 8, to: 11, weight: 20 },
        { from: 9, to: 11, weight: 16 },
        { from: 9, to: 13, weight: 18 },
        { from: 10, to: 11, weight: 14 },
        { from: 12, to: 13, weight: 25 }
    ]
};

// ============================================
// DIJKSTRA'S ALGORITHM
// ============================================
function dijkstra(edges, startNode, endNode) {
    const graph = {};
    const allNodes = new Set();
    campusData.nodes.forEach(node => graph[node.id] = []);
    edges.forEach(edge => {
        graph[edge.from].push({ to: edge.to, weight: edge.weight });
        graph[edge.to].push({ to: edge.from, weight: edge.weight });
        allNodes.add(edge.from);
        allNodes.add(edge.to);
    });

    const distances = {};
    const predecessors = {};
    const visited = new Set();
    const pq = [];

    allNodes.forEach(node => {
        distances[node] = Infinity;
        predecessors[node] = null;
    });

    distances[startNode] = 0;
    pq.push({ node: startNode, distance: 0 });

    while (pq.length > 0) {
        pq.sort((a, b) => a.distance - b.distance);
        const { node: currentNode, distance: currentDist } = pq.shift();
        if (visited.has(currentNode)) continue;
        visited.add(currentNode);
        if (currentNode === endNode) break;

        if (graph[currentNode]) {
            graph[currentNode].forEach(neighbor => {
                if (!visited.has(neighbor.to)) {
                    const newDist = currentDist + neighbor.weight;
                    if (newDist < distances[neighbor.to]) {
                        distances[neighbor.to] = newDist;
                        predecessors[neighbor.to] = currentNode;
                        pq.push({ node: neighbor.to, distance: newDist });
                    }
                }
            });
        }
    }

    const path = [];
    let current = endNode;
    while (current !== null) {
        path.unshift(current);
        current = predecessors[current];
    }
    return distances[endNode] === Infinity ? { path: [], distance: 0 } : { path, distance: distances[endNode] };
}

// ============================================
// CANVAS RENDERING & UI LOGIC
// ============================================
const canvas = document.getElementById('campusCanvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 550;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let selectedStart = null;
let selectedDest = null;
let currentPath = [];
const NODE_RADIUS = 12;
const SELECTED_RADIUS = 16;

function render() {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawGrid();
    drawEdges(currentPath);
    drawNodes();
}

function drawGrid() {
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }
}

function drawOrthogonalPath(x1, y1, x2, y2, isPath) {
    if (isPath) {
        ctx.strokeStyle = '#84cc16'; ctx.lineWidth = 4;
        ctx.shadowColor = '#84cc16'; ctx.shadowBlur = 15;
    } else {
        ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 2; ctx.shadowBlur = 0;
    }
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, y2); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawEdges(pathNodes = []) {
    const pathSet = new Set(pathNodes);
    campusData.edges.forEach(edge => {
        const fromNode = campusData.nodes.find(n => n.id === edge.from);
        const toNode = campusData.nodes.find(n => n.id === edge.to);
        if (fromNode && toNode) {
            const isPath = pathSet.has(edge.from) && pathSet.has(edge.to) && isAdjacentInPath(pathNodes, edge.from, edge.to);
            drawOrthogonalPath(fromNode.x, fromNode.y, toNode.x, toNode.y, isPath);
        }
    });
}

function isAdjacentInPath(path, n1, n2) {
    for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === n1 && path[i+1] === n2) || (path[i] === n2 && path[i+1] === n1)) return true;
    }
    return false;
}

function drawNodes() {
    campusData.nodes.forEach(node => {
        const isStart = selectedStart === node.id;
        const isDest = selectedDest === node.id;
        const isInPath = currentPath.includes(node.id);
        const isHighlighted = isStart || isDest || isInPath;

        let radius = isHighlighted ? SELECTED_RADIUS : NODE_RADIUS;
        let color = isHighlighted ? '#06b6d4' : '#6b7280';
        if (isInPath && !isStart && !isDest) color = '#84cc16';

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 11px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + radius + 15);
    });
}

// UI HANDLERS
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    campusData.nodes.forEach(node => {
        const dist = Math.sqrt((x - node.x)**2 + (y - node.y)**2);
        if (dist <= 20) {
            if (!selectedStart || (selectedStart && selectedDest)) {
                selectedStart = node.id; selectedDest = null;
                document.getElementById('startInput').value = node.name;
                document.getElementById('destInput').value = '';
            } else {
                selectedDest = node.id;
                document.getElementById('destInput').value = node.name;
                findAndDisplayPath();
            }
            render();
        }
    });
});

function findAndDisplayPath() {
    if (selectedStart && selectedDest) {
        const result = dijkstra(campusData.edges, selectedStart, selectedDest);
        currentPath = result.path;
        render();
        updateDirections(result.path);
    }
}

function updateDirections(path) {
    const panel = document.getElementById('directionsPanel');
    if (!path.length) { panel.innerHTML = "No path found."; return; }
    let html = `<div class='p-2 bg-gray-700 rounded mb-2'>Path Found!</div>`;
    path.forEach((id, i) => {
        const node = campusData.nodes.find(n => n.id === id);
        html += `<div class='text-sm border-l-2 border-cyan-400 pl-2 mb-1'>${i+1}. ${node.name}</div>`;
    });
    panel.innerHTML = html;
}

document.getElementById('clearBtn').addEventListener('click', () => {
    selectedStart = selectedDest = null; currentPath = [];
    document.getElementById('startInput').value = '';
    document.getElementById('destInput').value = '';
    render();
});

// Init
populateLegend();
render();

function populateLegend() {
    const list = document.getElementById('legendList');
    campusData.nodes.forEach(node => {
        const div = document.createElement('div');
        div.className = "cursor-pointer hover:text-cyan-400 truncate";
        div.innerText = node.name;
        div.onclick = () => { selectedDest = node.id; document.getElementById('destInput').value = node.name; findAndDisplayPath(); };
        list.appendChild(div);
    });
}