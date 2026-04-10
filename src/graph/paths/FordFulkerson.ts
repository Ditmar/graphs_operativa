import Vertex from '../Vertex';
import getCanvas from '../../graph-ui/canvas/canvas';
import { delay } from '../../graph-ui/utils';

// ─── Result types ────────────────────────────────────────────────────────────

/** Data recorded for each augmenting path found during the algorithm. */
export interface AugmentingPath {
    /** Iteration number (1-based). */
    iteration: number;
    /** Ordered list of vertices from source to sink. */
    path: Vertex[];
    /** Human-readable vertex labels for the path. */
    pathLabels: string[];
    /** Bottleneck capacity (minimum residual capacity along the path). */
    bottleneck: number;
    /** Cumulative max-flow after this iteration. */
    cumulativeFlow: number;
}

/** Full result returned by FordFulkerson. */
export interface FordFulkersonResult {
    /** Source vertex of the flow network. */
    source: Vertex;
    /** Sink vertex of the flow network. */
    sink: Vertex;
    /** Total maximum flow value. */
    maxFlow: number;
    /** Every augmenting path found, in order of discovery. */
    augmentingPaths: AugmentingPath[];
    /**
     * Residual capacity map after the algorithm terminates.
     * residualCapacities.get(u)?.get(v) gives the remaining capacity on u→v.
     */
    residualCapacities: Map<Vertex, Map<Vertex, number>>;
    /**
     * Net flow on every edge in the original graph.
     * flow.get(u)?.get(v) > 0  ⟹  that unit of flow travels u→v.
     * Negative values represent backward (reverse) flow.
     */
    flow: Map<Vertex, Map<Vertex, number>>;
    /** Bottleneck value of each iteration (convenience array). */
    bottlenecks: number[];
    /**
     * Minimum-cut vertex set (S-side, i.e. vertices reachable from source in
     * the residual graph after the algorithm terminates).
     */
    minCutS: Set<Vertex>;
    /**
     * Minimum-cut edges: every original edge (u→v) where u ∈ S and v ∉ S.
     * Their capacities sum to the max-flow (max-flow min-cut theorem).
     */
    minCutEdges: Array<{ from: Vertex; to: Vertex; capacity: number }>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Collect all vertices reachable from `source` via a simple BFS on the
 * original (non-residual) adjacency list.  Used to initialise the maps.
 */
function collectAllVertices(source: Vertex): Vertex[] {
    const visited = new Set<Vertex>();
    const queue: Vertex[] = [source];
    visited.add(source);
    while (queue.length > 0) {
        const current = queue.shift()!;
        current.getNeighbors().forEach((edge) => {
            if (edge.destination && !visited.has(edge.destination)) {
                visited.add(edge.destination);
                queue.push(edge.destination);
            }
        });
    }
    return Array.from(visited);
}

/**
 * BFS on the residual graph to find an augmenting path from `source` to
 * `sink`.  Returns the predecessor map if a path exists, or `null` when the
 * sink is unreachable.
 */
function bfsResidual(
    source: Vertex,
    sink: Vertex,
    residual: Map<Vertex, Map<Vertex, number>>
): Map<Vertex, Vertex | null> | null {
    const visited = new Set<Vertex>();
    const predecessor = new Map<Vertex, Vertex | null>();
    const queue: Vertex[] = [];

    visited.add(source);
    predecessor.set(source, null);
    queue.push(source);

    while (queue.length > 0) {
        const current = queue.shift()!;

        if (current === sink) {
            return predecessor;
        }

        const neighbors = residual.get(current);
        if (!neighbors) continue;

        for (const [neighbor, cap] of neighbors) {
            if (!visited.has(neighbor) && cap > 0) {
                visited.add(neighbor);
                predecessor.set(neighbor, current);
                queue.push(neighbor);
            }
        }
    }
    return null; // sink not reachable
}

/**
 * BFS from `source` in the residual graph – used after termination to
 * identify the minimum-cut S-side.
 */
function reachableInResidual(
    source: Vertex,
    residual: Map<Vertex, Map<Vertex, number>>
): Set<Vertex> {
    const visited = new Set<Vertex>();
    const queue: Vertex[] = [source];
    visited.add(source);
    while (queue.length > 0) {
        const current = queue.shift()!;
        const neighbors = residual.get(current);
        if (!neighbors) continue;
        for (const [neighbor, cap] of neighbors) {
            if (!visited.has(neighbor) && cap > 0) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    return visited;
}

// ─── Main algorithm ───────────────────────────────────────────────────────────

/**
 * Ford-Fulkerson maximum-flow algorithm using BFS (Edmonds-Karp variant).
 *
 * @param source  Source vertex (s).
 * @param sink    Sink vertex (t).
 * @returns       {@link FordFulkersonResult} with max-flow, every augmenting
 *                path + its bottleneck, residual capacities, flow map and
 *                minimum-cut information.
 */
export const FordFulkerson = async (
    source: Vertex,
    sink: Vertex
): Promise<FordFulkersonResult> => {
    const ctx = getCanvas().getContext('2d');

    // ── 1. Initialise residual-capacity and flow maps ─────────────────────────
    const residual = new Map<Vertex, Map<Vertex, number>>();
    const flow = new Map<Vertex, Map<Vertex, number>>();

    const allVertices = collectAllVertices(source);
    allVertices.forEach((v) => {
        residual.set(v, new Map());
        flow.set(v, new Map());
    });

    // Store the original capacity of every edge (needed for min-cut output)
    const originalCapacity = new Map<Vertex, Map<Vertex, number>>();
    allVertices.forEach((v) => originalCapacity.set(v, new Map()));

    allVertices.forEach((v) => {
        v.getNeighbors().forEach((edge) => {
            if (!edge.destination) return;
            const u = v;
            const w = edge.destination;
            const rawCap = Number(edge.weight);
            const cap = isFinite(rawCap) ? rawCap : 0;

            // Forward residual capacity (additive for parallel edges)
            residual.get(u)!.set(w, (residual.get(u)!.get(w) ?? 0) + cap);

            // Backward residual edge starts at 0 (only inserted once)
            if (!residual.get(w)!.has(u)) residual.get(w)!.set(u, 0);

            // Original capacity (also additive for parallel edges)
            originalCapacity.get(u)!.set(w, (originalCapacity.get(u)!.get(w) ?? 0) + cap);

            // Flow initialised to 0
            flow.get(u)!.set(w, 0);
            if (!flow.get(w)!.has(u)) flow.get(w)!.set(u, 0);
        });
    });

    // ── 2. Ford-Fulkerson main loop ───────────────────────────────────────────
    let maxFlow = 0;
    let iteration = 0;
    const augmentingPaths: AugmentingPath[] = [];
    const bottlenecks: number[] = [];

    console.log(`[FF] Starting Ford-Fulkerson from "${source.label}" to "${sink.label}"`);

    let predecessorMap = bfsResidual(source, sink, residual);

    while (predecessorMap !== null) {
        iteration++;

        // Reconstruct path from predecessor map
        const path: Vertex[] = [];
        let node: Vertex | null = sink;
        while (node !== null) {
            path.unshift(node);
            node = predecessorMap.get(node) ?? null;
        }

        // Find bottleneck: minimum residual capacity along the path
        let bottleneck = Infinity;
        for (let i = 0; i < path.length - 1; i++) {
            const cap = residual.get(path[i])!.get(path[i + 1]) ?? 0;
            if (cap < bottleneck) bottleneck = cap;
        }

        // Update residual capacities and flow along the path
        for (let i = 0; i < path.length - 1; i++) {
            const u = path[i];
            const v = path[i + 1];
            // Decrease forward residual
            residual.get(u)!.set(v, (residual.get(u)!.get(v) ?? 0) - bottleneck);
            // Increase backward residual
            residual.get(v)!.set(u, (residual.get(v)!.get(u) ?? 0) + bottleneck);
            // Update net flow
            flow.get(u)!.set(v, (flow.get(u)!.get(v) ?? 0) + bottleneck);
            flow.get(v)!.set(u, (flow.get(v)!.get(u) ?? 0) - bottleneck);
        }

        maxFlow += bottleneck;
        bottlenecks.push(bottleneck);

        const record: AugmentingPath = {
            iteration,
            path,
            pathLabels: path.map((v) => v.label),
            bottleneck,
            cumulativeFlow: maxFlow,
        };
        augmentingPaths.push(record);

        console.log(
            `[FF] Iter ${iteration} | Path: ${record.pathLabels.join(' → ')} | Bottleneck: ${bottleneck} | Cumulative flow: ${maxFlow}`
        );

        // Draw augmenting path on canvas
        if (ctx && path.length > 1) {
            const hue = (iteration * 55) % 360;

            // Draw edges of the augmenting path
            ctx.beginPath();
            ctx.strokeStyle = `hsl(${hue}, 100%, 55%)`;
            ctx.lineWidth = 2;
            ctx.moveTo(path[0].getX(), path[0].getY());
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].getX(), path[i].getY());
            }
            ctx.stroke();

            // Paint each vertex along the path (like Dijkstra does)
            path.forEach((v) => v.paint(v.getX(), v.getY(), ctx));

            // Label the bottleneck near the path midpoint
            const mid = path[Math.floor(path.length / 2)];
            ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`#${iteration} bn:${bottleneck}`, mid.getX() + 5, mid.getY() - 5);
        }

        await delay(1);
        predecessorMap = bfsResidual(source, sink, residual);
    }

    // ── 3. Minimum cut (S-T partition after termination) ─────────────────────
    const minCutS = reachableInResidual(source, residual);

    const minCutEdges: FordFulkersonResult['minCutEdges'] = [];
    minCutS.forEach((u) => {
        const capRow = originalCapacity.get(u);
        if (!capRow) return;
        capRow.forEach((cap, v) => {
            if (!minCutS.has(v) && cap > 0) {
                minCutEdges.push({ from: u, to: v, capacity: cap });
            }
        });
    });

    // ── 4. Summary ────────────────────────────────────────────────────────────
    console.log(`\n[FF] ── RESULT ──────────────────────────────────`);
    console.log(`[FF] Max Flow (${source.label} → ${sink.label}): ${maxFlow}`);
    console.log(`[FF] Total augmenting paths found: ${augmentingPaths.length}`);
    console.log(`[FF] Bottlenecks per iteration: [${bottlenecks.join(', ')}]`);
    console.log(`[FF] Min-cut edges (capacity sum = ${maxFlow}):`);
    minCutEdges.forEach((e) =>
        console.log(`  ${e.from.label} → ${e.to.label}  (capacity: ${e.capacity})`)
    );

    // Draw min-cut edges in red and paint their vertices
    if (ctx) {
        minCutEdges.forEach((e) => {
            ctx.beginPath();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 3]);
            ctx.moveTo(e.from.getX(), e.from.getY());
            ctx.lineTo(e.to.getX(), e.to.getY());
            ctx.stroke();
            ctx.setLineDash([]);
            e.from.paint(e.from.getX(), e.from.getY(), ctx);
            e.to.paint(e.to.getX(), e.to.getY(), ctx);
        });
    }

    return {
        source,
        sink,
        maxFlow,
        augmentingPaths,
        residualCapacities: residual,
        flow,
        bottlenecks,
        minCutS,
        minCutEdges,
    };
};
