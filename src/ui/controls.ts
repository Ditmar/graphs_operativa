import Vertex from '../graph/Vertex';

// ── Pan ───────────────────────────────────────────────────────────────────────
let isPanning = false;
let panMoved  = false;
let panStartX = 0;
let panStartY = 0;
let scrollStartX = 0;
let scrollStartY = 0;

export function isPanMoved() { return panMoved; }

export function setupPan(wrapper: HTMLElement) {
    wrapper.addEventListener('mousedown', (e) => {
        isPanning  = true;
        panMoved   = false;
        panStartX  = e.clientX;
        panStartY  = e.clientY;
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
}

// ── Zoom ──────────────────────────────────────────────────────────────────────
const ZOOM_STEP = 0.15;
const ZOOM_MIN  = 0.1;
const ZOOM_MAX  = 3;
let currentZoom = 1;

export function getZoom() { return currentZoom; }

export function setupZoom(wrapper: HTMLElement, canvas: HTMLCanvasElement) {
    function applyZoom(newZoom: number) {
        newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, newZoom));
        const viewW   = wrapper.clientWidth;
        const viewH   = wrapper.clientHeight;
        const centerX = (wrapper.scrollLeft + viewW / 2) / currentZoom;
        const centerY = (wrapper.scrollTop  + viewH / 2) / currentZoom;
        currentZoom = newZoom;
        canvas.style.width  = `${canvas.width  * currentZoom}px`;
        canvas.style.height = `${canvas.height * currentZoom}px`;
        requestAnimationFrame(() => {
            wrapper.scrollLeft = centerX * currentZoom - viewW / 2;
            wrapper.scrollTop  = centerY * currentZoom - viewH / 2;
        });
        document.getElementById('zoom-label')!.textContent = `${Math.round(currentZoom * 100)}%`;
    }

    applyZoom(1);

    document.getElementById('zoom-in')!   .addEventListener('click', () => applyZoom(currentZoom + ZOOM_STEP));
    document.getElementById('zoom-out')!  .addEventListener('click', () => applyZoom(currentZoom - ZOOM_STEP));
    document.getElementById('zoom-reset')!.addEventListener('click', () => applyZoom(1));

    wrapper.addEventListener('wheel', (e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        applyZoom(currentZoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
    }, { passive: false });
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
export function setupTooltip(canvas: HTMLCanvasElement, graph: Record<string, Vertex>) {
    const tooltip        = document.getElementById('node-tooltip')!;
    const tooltipContent = document.getElementById('tooltip-content')!;
    const tooltipHeader  = document.getElementById('tooltip-header')!;
    const closeBtn       = document.getElementById('tooltip-close')!;

    // Show on node click
    canvas.addEventListener('click', (e) => {
        if (isPanMoved()) return;

        const rect    = canvas.getBoundingClientRect();
        const canvasX = (e.clientX - rect.left) / getZoom();
        const canvasY = (e.clientY - rect.top)  / getZoom();

        const THRESHOLD = Math.max(8, 12 / getZoom());
        let nearest: Vertex | null = null;
        let minDist = THRESHOLD;

        Object.values(graph).forEach((v) => {
            const dx = v.getX() - canvasX;
            const dy = v.getY() - canvasY;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < minDist) { minDist = d; nearest = v; }
        });

        if (!nearest) { tooltip.style.display = 'none'; return; }

        const v = nearest as Vertex;
        const streets = [...new Set(
            v.getNeighbors().map(e => e.streetName).filter(n => n !== '')
        )];
        tooltipContent.innerHTML = `
            <strong>&#9679; Nodo</strong>
            <span><em>Label</em>    <b>${v.label}</b></span>
            <span><em>Canvas X</em> <b>${v.getX().toFixed(1)}</b></span>
            <span><em>Canvas Y</em> <b>${v.getY().toFixed(1)}</b></span>
            <span><em>Vecinos</em>  <b>${v.getNeighbors().length}</b></span>
            <span><em>Visitado</em> <b>${v.visited ? 'Sí' : 'No'}</b></span>
            ${v.distance !== Infinity ? `<span><em>Distancia</em> <b>${v.distance.toFixed(2)}</b></span>` : ''}
            ${v.predecessor ? `<span><em>Predecesor</em> <b>${v.predecessor.label}</b></span>` : ''}
            ${streets.length > 0 ? `<span><em>Calles</em> <b>${streets.join(' / ')}</b></span>` : ''}
        `;

        let tx = e.clientX + 14;
        let ty = e.clientY + 14;
        if (tx + 220 > window.innerWidth)  tx = e.clientX - 224;
        if (ty + 200 > window.innerHeight) ty = e.clientY - 204;
        tooltip.style.left    = `${tx}px`;
        tooltip.style.top     = `${ty}px`;
        tooltip.style.display = 'block';
    });

    // Close button
    closeBtn.addEventListener('mousedown', (e) => { e.stopPropagation(); });
    closeBtn.addEventListener('click',     (e) => { e.stopPropagation(); tooltip.style.display = 'none'; });

    // Drag
    let dragActive = false;
    let dragOffX = 0;
    let dragOffY = 0;

    tooltipHeader.addEventListener('mousedown', (e) => {
        dragActive = true;
        const rect = tooltip.getBoundingClientRect();
        dragOffX = e.clientX - rect.left;
        dragOffY = e.clientY - rect.top;
        e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
        if (!dragActive) return;
        tooltip.style.left  = `${e.clientX - dragOffX}px`;
        tooltip.style.top   = `${e.clientY - dragOffY}px`;
        tooltip.style.right = 'auto';
    });
    window.addEventListener('mouseup', () => { dragActive = false; });
}

// ── Graph utilities ───────────────────────────────────────────────────────────
export function findFarthestReachable(src: Vertex): Vertex {
    const visited = new Map<Vertex, number>();
    const queue: Vertex[] = [src];
    visited.set(src, 0);
    let farthest = src;
    let maxHops = 0;
    while (queue.length > 0) {
        const cur = queue.shift()!;
        const hops = visited.get(cur)!;
        if (hops > maxHops) { maxHops = hops; farthest = cur; }
        cur.getNeighbors().forEach((edge) => {
            const nb = edge.destination;
            if (nb && !visited.has(nb)) { visited.set(nb, hops + 1); queue.push(nb); }
        });
    }
    console.log(`[FF] Sink auto-selected: "${farthest.label}" (${maxHops} hops from source)`);
    return farthest;
}
