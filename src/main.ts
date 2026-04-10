import { drawGraph } from './graph-ui/index';
// import { Bfs } from './graph/paths/Bfs'
// import { Dfs } from './graph/paths/Dfs'
// import { Prim } from './graph/paths/Prim'
// import { Dijkstra } from './graph/paths/Dijkstra'
import { FordFulkerson } from './graph/paths/FordFulkerson'

// ── Mouse drag-to-pan on the canvas wrapper ──────────────────────────────────
const wrapper = document.getElementById('canvas-wrapper')!;
const canvas  = document.getElementById('app') as HTMLCanvasElement;
let isPanning = false;
let panMoved  = false;
let panStartX = 0;
let panStartY = 0;
let scrollStartX = 0;
let scrollStartY = 0;

wrapper.addEventListener('mousedown', (e) => {
    isPanning = true;
    panMoved  = false;
    panStartX = e.clientX;
    panStartY = e.clientY;
    scrollStartX = wrapper.scrollLeft;
    scrollStartY = wrapper.scrollTop;
});
window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panMoved = true;
    wrapper.scrollLeft = scrollStartX - (e.clientX - panStartX);
    wrapper.scrollTop  = scrollStartY - (e.clientY - panStartY);
});
window.addEventListener('mouseup', () => { isPanning = false; });

// ── Zoom toolbar ─────────────────────────────────────────────────────────────
const ZOOM_STEP = 0.15;
const ZOOM_MIN  = 0.1;
const ZOOM_MAX  = 3;
let currentZoom = 1;

const scaler = null; // unused, kept to avoid reference errors

function applyZoom(newZoom: number) {
    newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, newZoom));

    // Canvas center point in canvas-pixel space (before zoom change)
    const viewW   = wrapper.clientWidth;
    const viewH   = wrapper.clientHeight;
    const centerX = (wrapper.scrollLeft + viewW / 2) / currentZoom;
    const centerY = (wrapper.scrollTop  + viewH / 2) / currentZoom;

    currentZoom = newZoom;

    // Resize the canvas CSS display size — the internal buffer (6000×5000) stays intact
    // so nothing needs to be redrawn. The browser stretches/shrinks the pixels.
    canvas.style.width  = `${canvas.width  * currentZoom}px`;
    canvas.style.height = `${canvas.height * currentZoom}px`;

    // Restore the same canvas point at the viewport center
    requestAnimationFrame(() => {
        wrapper.scrollLeft = centerX * currentZoom - viewW / 2;
        wrapper.scrollTop  = centerY * currentZoom - viewH / 2;
    });

    document.getElementById('zoom-label')!.textContent = `${Math.round(currentZoom * 100)}%`;
}

// Initialise canvas display size
applyZoom(1);

document.getElementById('zoom-in')!   .addEventListener('click', () => applyZoom(currentZoom + ZOOM_STEP));
document.getElementById('zoom-out')!  .addEventListener('click', () => applyZoom(currentZoom - ZOOM_STEP));
document.getElementById('zoom-reset')!.addEventListener('click', () => applyZoom(1));

// Ctrl+Wheel zoom
wrapper.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    applyZoom(currentZoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
}, { passive: false });


const graph = drawGraph();
const startVertex = graph['500.52501333341934_450.13266666652635'];

// ── Node click → tooltip ─────────────────────────────────────────────────────
const tooltip        = document.getElementById('node-tooltip')!;
const tooltipContent = document.getElementById('tooltip-content')!;

canvas.addEventListener('click', (e) => {
    // Ignore if the user was panning
    if (panMoved) return;

    // Convert viewport click → internal canvas pixel coordinates
    const rect    = canvas.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) / currentZoom;
    const canvasY = (e.clientY - rect.top)  / currentZoom;

    // Find the nearest vertex within a threshold (canvas pixels)
    const THRESHOLD = Math.max(8, 12 / currentZoom);
    let nearest: { label: string; x: number; y: number; neighbors: any[] } | null = null;
    let minDist = THRESHOLD;

    Object.values(graph).forEach((v) => {
        const dx = v.getX() - canvasX;
        const dy = v.getY() - canvasY;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < minDist) { minDist = d; nearest = v as any; }
    });

    if (!nearest) { tooltip.classList.add('hidden'); return; }

    const v = nearest as any;
    tooltipContent.innerHTML = `
        <strong>&#9679; Nodo</strong>
        <span><em>Label</em>    <b>${v.label}</b></span>
        <span><em>Canvas X</em> <b>${v.getX().toFixed(1)}</b></span>
        <span><em>Canvas Y</em> <b>${v.getY().toFixed(1)}</b></span>
        <span><em>Vecinos</em>  <b>${v.getNeighbors().length}</b></span>
        <span><em>Visitado</em> <b>${v.visited ? 'Sí' : 'No'}</b></span>
        ${v.distance !== Infinity ? `<span><em>Distancia</em> <b>${v.distance.toFixed(2)}</b></span>` : ''}
        ${v.predecessor ? `<span><em>Predecesor</em> <b>${v.predecessor.label}</b></span>` : ''}
    `;

    // Position tooltip near click, avoid going off-screen
    let tx = e.clientX + 14;
    let ty = e.clientY + 14;
    if (tx + 220 > window.innerWidth)  tx = e.clientX - 224;
    if (ty + 200 > window.innerHeight) ty = e.clientY - 204;
    tooltip.style.left = `${tx}px`;
    tooltip.style.top  = `${ty}px`;
    tooltip.classList.remove('hidden');
});

document.getElementById('tooltip-close')!.addEventListener('click', () => {
    tooltip.classList.add('hidden');
});

// ── Drag the floating panel ────────────────────────────────────────────
const tooltipHeader = document.getElementById('tooltip-header')!;
let dragActive = false;
let dragOffX = 0;
let dragOffY = 0;

tooltipHeader.addEventListener('mousedown', (e) => {
    dragActive = true;
    const rect = tooltip.getBoundingClientRect();
    dragOffX = e.clientX - rect.left;
    dragOffY = e.clientY - rect.top;
    e.preventDefault(); // prevent text selection while dragging
});
window.addEventListener('mousemove', (e) => {
    if (!dragActive) return;
    tooltip.style.left = `${e.clientX - dragOffX}px`;
    tooltip.style.top  = `${e.clientY - dragOffY}px`;
    tooltip.style.right = 'auto';
});
window.addEventListener('mouseup', () => { dragActive = false; });

console.log(startVertex);
//Bfs(startVertex);
//Dfs(startVertex);
//Prim(startVertex);
//Dijkstra(startVertex);

// Ford-Fulkerson: define source and sink vertices
const sourceVertex = startVertex;
const sinkVertex = Object.values(graph)[Object.values(graph).length - 1];
FordFulkerson(sourceVertex, sinkVertex).then((result) => {
    console.log('[FF] Max Flow:', result.maxFlow);
    console.log('[FF] Augmenting paths:', result.augmentingPaths);
    console.log('[FF] Bottlenecks:', result.bottlenecks);
    console.log('[FF] Min-cut edges:', result.minCutEdges);
});