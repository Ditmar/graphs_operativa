import json from './city.json';
import getCanvas from './canvas/canvas';
import Vertex from '../graph/Vertex';
import { calculateDistance, drawCircle, getVertex } from './utils';

/** Capacidad de tráfico por tipo de calle (OSM highway tag → carriles equivalentes) */
function highwayCapacity(highway: string | undefined): number {
    switch (highway) {
        case 'trunk':          return 4;
        case 'trunk_link':     return 2;
        case 'primary':        return 3;
        case 'primary_link':   return 2;
        case 'tertiary':       return 2;
        case 'residential':    return 1;
        case 'unclassified':   return 1;
        case 'service':        return 1;
        default:               return 1; // footway, steps, path, etc.
    }
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
        const cap        = highwayCapacity(feature.properties?.highway);
        const streetName = (feature.properties?.name as string | undefined) ?? '';
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
                    vertex?.addNeighbor(nextVertex, calculateDistance({x, y}, {x: x2, y: y2}), cap, streetName);
                }
                if (index > 0) {
                    const prev = feature.geometry.coordinates[index - 1];
                    const [firstCoord, secondCoord] = prev;
                    const {x: x2, y: y2} = transFormPoint(firstCoord, secondCoord);
                    const prevVertex = getVertex(graph, x2, y2);
                    vertex?.addNeighbor(prevVertex, calculateDistance({x, y}, {x: x2, y: y2}), cap, streetName);
                }
            });
            ctx.stroke();
        }
    });
    return graph;
}
