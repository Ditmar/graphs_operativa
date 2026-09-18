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
    const ctx            = canvas.getContext('2d');
    const allVertices    = Object.values(graph);

    // Capacidad total (suma de 'lanes') entrante y saliente de cada nodo.
    // Se precalcula una sola vez para poder sugerir, al hacer clic, una
    // intersección cercana de mayor capacidad en vez de una esquina residencial
    // de baja capacidad (ver discusión sobre cuellos de botella "triviales").
    const outCapacity = new Map<Vertex, number>();
    const inCapacity  = new Map<Vertex, number>();
    allVertices.forEach((v) => {
        outCapacity.set(v, 0);
        inCapacity.set(v, 0);
    });
    allVertices.forEach((v) => {
        let out = 0;
        v.getNeighbors().forEach((edge) => {
            out += edge.lanes;
            if (edge.destination) {
                inCapacity.set(edge.destination, (inCapacity.get(edge.destination) ?? 0) + edge.lanes);
            }
        });
        outCapacity.set(v, out);
    });

    const SUGGEST_RADIUS = 80;   // radio de búsqueda, en unidades de canvas
    const SUGGEST_FACTOR = 1.5;  // solo sugiere si tiene 50%+ más capacidad total

    function findHigherCapacityNeighbor(origin: Vertex): Vertex | null {
        const originCap = (inCapacity.get(origin) ?? 0) + (outCapacity.get(origin) ?? 0);
        let best: Vertex | null = null;
        let bestCap = originCap * SUGGEST_FACTOR;
        allVertices.forEach((v) => {
            if (v === origin) return;
            const dx = v.getX() - origin.getX();
            const dy = v.getY() - origin.getY();
            if (Math.sqrt(dx * dx + dy * dy) > SUGGEST_RADIUS) return;
            const cap = (inCapacity.get(v) ?? 0) + (outCapacity.get(v) ?? 0);
            if (cap > bestCap) { bestCap = cap; best = v; }
        });
        return best;
    }

    function highlightSuggestion(v: Vertex) {
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(v.getX(), v.getY(), 9, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(v.getX(), v.getY(), 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
        ctx.restore();
    }

    function copyToClipboard(text: string): Promise<void> {
        if (navigator.clipboard?.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    // Delegado: los botones de copiar se recrean en cada clic (innerHTML se
    // reescribe), así que el listener vive en el contenedor estable.
    tooltipContent.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('.copy-btn') as HTMLButtonElement | null;
        if (!btn) return;
        const text = btn.dataset.copy ?? '';
        copyToClipboard(text)
            .then(() => {
                btn.textContent = '✓';
                btn.classList.add('copied');
                setTimeout(() => { btn.textContent = '📋'; btn.classList.remove('copied'); }, 1200);
            })
            .catch(() => {
                btn.textContent = '✗';
                setTimeout(() => { btn.textContent = '📋'; }, 1200);
            });
    });

    // Show on node click
    canvas.addEventListener('click', (e) => {
        if (isPanMoved()) return;

        const rect    = canvas.getBoundingClientRect();
        const canvasX = (e.clientX - rect.left) / getZoom();
        const canvasY = (e.clientY - rect.top)  / getZoom();

        const THRESHOLD = Math.max(8, 12 / getZoom());
        let nearest: Vertex | null = null;
        let minDist = THRESHOLD;

        allVertices.forEach((v) => {
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
        const highways = [...new Set(
            v.getNeighbors().map(e => e.highway).filter(n => n !== '')
        )];
        const vOutCap    = outCapacity.get(v) ?? 0;
        const vInCap     = inCapacity.get(v) ?? 0;
        const suggestion = findHigherCapacityNeighbor(v);
        if (suggestion) highlightSuggestion(suggestion);

        tooltipContent.innerHTML = `
            <strong>&#9679; Nodo</strong>
            <span><em>Label</em> <span class="value-with-copy"><b>${v.label}</b><button class="copy-btn" data-copy="'${v.label}'" title="Copiar clave lista para graph['...']">📋</button></span></span>
            <span><em>Canvas X</em> <b>${v.getX().toFixed(1)}</b></span>
            <span><em>Canvas Y</em> <b>${v.getY().toFixed(1)}</b></span>
            <span><em>Vecinos</em>  <b>${v.getNeighbors().length}</b></span>
            <span><em>Capacidad</em> <b>↑${vOutCap} / ↓${vInCap}</b></span>
            <span><em>Visitado</em> <b>${v.visited ? 'Sí' : 'No'}</b></span>
            ${v.distance !== Infinity ? `<span><em>Distancia</em> <b>${v.distance.toFixed(2)}</b></span>` : ''}
            ${v.predecessor ? `<span><em>Predecesor</em> <b>${v.predecessor.label}</b></span>` : ''}
            ${highways.length > 0 ? `<span><em>Tipo</em>    <b>${highways.join(' / ')}</b></span>` : ''}
            ${streets.length > 0 ? `<span><em>Calles</em> <b>${streets.join(' / ')}</b></span>` : ''}
            ${suggestion ? `<span style="color:#ffd700"><em>⚡ Mayor capacidad cerca</em> <b>${suggestion.label}</b> (↑${outCapacity.get(suggestion)}/↓${inCapacity.get(suggestion)})</span>` : ''}
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
