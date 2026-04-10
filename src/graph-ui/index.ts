import json from './city.json';
import getCanvas from './canvas/canvas';
import Vertex from '../graph/Vertex';
import { calculateDistance, drawCircle, getVertex } from './utils';

/** Capacidad de tráfico combinando: carriles OSM > ancho de calle > tipo de vía,
 *  con modificadores por superficie y sentido único.
 */
function highwayCapacity(props: Record<string, any> | undefined): number {
    const highway   = props?.highway   as string | undefined;
    const surface   = props?.surface   as string | undefined;
    const oneway    = props?.oneway    as string | undefined;
    const lanesRaw  = props?.lanes     as string | undefined;
    const widthRaw  = props?.width     as string | undefined;

    // --- 1. Carriles base ---
    let lanes: number;
    if (lanesRaw) {
        // 'lanes' puede venir separado por ';' (ej. "2;1") — tomamos el máximo
        const parsed = lanesRaw.split(';').map(Number).filter(n => !isNaN(n) && n > 0);
        lanes = parsed.length > 0 ? Math.max(...parsed) : 1;
    } else if (widthRaw) {
        // Estimación desde el ancho en metros
        const w = parseFloat(widthRaw.split(';')[0]);
        if (w <= 3.5)     lanes = 1;
        else if (w <= 6)  lanes = 2;
        else if (w <= 9)  lanes = 3;
        else              lanes = 4;
    } else {
        // Fallback por tipo de vía OSM
        switch (highway) {
            case 'trunk':          lanes = 4; break;
            case 'trunk_link':     lanes = 2; break;
            case 'primary':        lanes = 3; break;
            case 'primary_link':   lanes = 2; break;
            case 'secondary':      lanes = 2; break;
            case 'tertiary':       lanes = 2; break;
            case 'residential':    lanes = 1; break;
            default:               lanes = 1;
        }
    }

    // --- 2. Modificador de superficie ---
    let surfaceFactor = 1.0;
    if (surface) {
        if (['paved', 'asphalt', 'concrete', 'concrete:lanes'].some(s => surface.startsWith(s))) {
            surfaceFactor = 1.0;   // pavimento liso
        } else if (['concrete:plates', 'paving_stones', 'stone'].some(s => surface.startsWith(s))) {
            surfaceFactor = 0.8;   // adoquín / losas
        } else if (['unpaved', 'ground', 'dirt'].some(s => surface.startsWith(s))) {
            surfaceFactor = 0.5;   // tierra / sin pavimento
        }
    }

    // --- 3. Multiplicador por tipo de vía OSM ---
    // Refleja la fluidez real: una trunk con 2 carriles fluye mejor que una residential con 2
    let highwayFactor = 1.0;
    switch (highway) {
        case 'trunk':                       highwayFactor = 1.4; break;
        case 'trunk_link':                  highwayFactor = 1.2; break;
        case 'primary':                     highwayFactor = 1.3; break;
        case 'primary_link':                highwayFactor = 1.1; break;
        case 'secondary':                   highwayFactor = 1.2; break;
        case 'tertiary':                    highwayFactor = 1.1; break;
        case 'residential': case 'unclassified': highwayFactor = 1.0; break;
        case 'service':                     highwayFactor = 0.8; break;
        default:                            highwayFactor = 0.7; // footway, steps, path…
    }

    // --- 4. Bonus por sentido único ---
    // En una calle de sentido único todos los carriles fluyen en la misma dirección
    const onewayFactor = oneway === 'yes' ? 1.2 : 1.0;

    return Math.max(1, Math.round(lanes * surfaceFactor * highwayFactor * onewayFactor));
}
const totalScale = 10000;
const positionX = 1000;
const positionY = 1050;
let integerX: any = null;
let integerY: any = null;
// Reference dimensions are frozen to the original 1024×700 so that
// changing the canvas size (for scrolling) does not distort the city.
const REF_W = 1024;
const REF_H = 700;
const scaleX = (lon: number) => (lon + 180) * (REF_W / 360) * totalScale;
const scaleY = (lat: number) => (90 - lat) * (REF_H / 180) * totalScale;

function transFormPoint(firstCoord: number, secondCoord: number) {
    const coorsX = scaleX(firstCoord);
    const coorsY = scaleY(secondCoord);
    if (integerX == null && integerY == null) {
        integerX = Math.floor(coorsX);
        integerY = Math.floor(coorsY);
    }
    const x = coorsX - integerX + positionX;
    const y = coorsY - integerY + positionY;
    return {x , y};
}

export function drawGraph() {
    const canvas = getCanvas();
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('Failed to get 2D context');
    }
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 0.3;
    ctx.fillStyle = 'black';
    const graph: Record<string, Vertex> = {};
    json.features.forEach((feature: any) => {
        const cap        = highwayCapacity(feature.properties);
        const streetName = (feature.properties?.name as string | undefined) ?? '';
        const highway    = (feature.properties?.highway as string | undefined) ?? '';
        if (feature.geometry.type === 'LineString') {
            ctx.beginPath();
            feature.geometry.coordinates.forEach((line: number[], index: number) => {
                const [firstCoord, secondCoord] = line;
                const {x, y} = transFormPoint(firstCoord, secondCoord);
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    
                    ctx.lineTo(x, y);
                }
                drawCircle(x, y, 1);
                const vertex = getVertex(graph, x, y);
                if (index + 1 < feature.geometry.coordinates.length) {
                    const next = feature.geometry.coordinates[index + 1];
                    const [firstCoord, secondCoord] = next;
                    const {x: x2, y: y2} = transFormPoint(firstCoord, secondCoord);
                    const nextVertex = getVertex(graph, x2, y2);
                    vertex?.addNeighbor(nextVertex, calculateDistance({x, y}, {x: x2, y: y2}), cap, streetName, highway);
                }
                if (index > 0) {
                    const prev = feature.geometry.coordinates[index - 1];
                    const [firstCoord, secondCoord] = prev;
                    const {x: x2, y: y2} = transFormPoint(firstCoord, secondCoord);
                    const prevVertex = getVertex(graph, x2, y2);
                    vertex?.addNeighbor(prevVertex, calculateDistance({x, y}, {x: x2, y: y2}), cap, streetName, highway);
                }
            });
            ctx.stroke();
        }
    });
    return graph;
}
