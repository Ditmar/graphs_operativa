import json from './city.json';
import getCanvas from './canvas/canvas';
import Vertex from '../graph/Vertex';
import { calculateDistance, drawCircle, getVertex } from './utils';
const totalScale = 4000;
const positionX = 500;
const positionY = 450;
let integerX: any = null;
let integerY: any = null;

// Escalado de coordenadas para ajustarse al canvas
const scaleX = (lon: number) => (lon + 180) * (getCanvas().width / 360) * totalScale;
const scaleY = (lat: number) => (90 - lat) * (getCanvas().height / 180) * totalScale;

function transFormPoint(firstCoord: number, secondCoord: number) {
    const coorsX = scaleX(firstCoord);
    const coorsY = scaleY(secondCoord);
    if (integerX == null && integerY == null) {
        integerX = Math.floor(coorsX);
        integerY = Math.floor(coorsY);
    }
    const x = coorsX - integerX + positionX;
    const y = coorsY - integerY + positionY;
    return { x, y };
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
        if (feature.geometry.type === 'LineString') {
            ctx.beginPath();
            feature.geometry.coordinates.forEach((line: number[], index: number) => {
                const [firstCoord, secondCoord] = line;
                const { x, y } = transFormPoint(firstCoord, secondCoord);
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                drawCircle(x, y, 0.6);
                const vertex = getVertex(graph, x, y);

                // Añadir conexiones entre los nodos
                if (index + 1 < feature.geometry.coordinates.length) {
                    const next = feature.geometry.coordinates[index + 1];
                    const { x: x2, y: y2 } = transFormPoint(next[0], next[1]);
                    const nextVertex = getVertex(graph, x2, y2);
                    vertex?.addNeighbor(nextVertex, calculateDistance({ x, y }, { x: x2, y: y2 }));
                }
                if (index > 0) {
                    const prev = feature.geometry.coordinates[index - 1];
                    const { x: x2, y: y2 } = transFormPoint(prev[0], prev[1]);
                    const prevVertex = getVertex(graph, x2, y2);
                    vertex?.addNeighbor(prevVertex, calculateDistance({ x, y }, { x: x2, y: y2 }));
                }
            });
            ctx.stroke();
        }
    });
    return graph;
}
