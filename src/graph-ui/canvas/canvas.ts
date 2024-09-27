function getCanvas() {
    return document.getElementById('app') as HTMLCanvasElement;
}
export default getCanvas;

export function getCanvasForeground(){
    return document.getElementById('foreground') as HTMLCanvasElement;
}