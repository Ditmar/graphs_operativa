import json from './city.json';
import getCanvas from './canvas/canvas';
const totalScale = 5000;
const scaleX = (lon: number) => (lon + 180) * (getCanvas().width / 360) * totalScale;
const scaleY = (lat: number) => (90 - lat) * (getCanvas().height / 180) * totalScale;

export function drawGraph() {
    const canvas = getCanvas();
    let integerX: any = null;
    let integerY: any = null;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('Failed to get 2D context');
    }
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = 'black';
    json.features.forEach((feature: any) => {
        
        if (feature.geometry.type === 'LineString') {
            console.log(feature.properties);
            ctx.beginPath();
            feature.geometry.coordinates.forEach((line: number[], index: number) => {
                const [firstCoord, secondCoord] = line;
                const coorsX = scaleX(firstCoord);
                const coorsY = scaleY(secondCoord);
                if (integerX == null && integerY == null) {

                    integerX = Math.floor(coorsX);
                    integerY = Math.floor(coorsY);
                }
                const x = coorsX - integerX + 300;
                const y = coorsY - integerY + 350;
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {

                    ctx.lineTo(x, y);
                }

            });
            ctx.stroke(); 
        }
    });
}