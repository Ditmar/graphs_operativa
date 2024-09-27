import Vertex from './Vertex';

class Edge {
    label: string | null;
    source: Vertex | null;
    destination: Vertex | null;
    weight: number;
    highway: string | null;
    surface: string | null;
    oneway: string | null;

    constructor(label: string | null = '', source: Vertex | null = null) {
        this.label = label;
        this.source = source;
        this.destination = null;
        this.weight = Infinity;
        this.highway = null;
        this.surface = null;
        this.oneway = null;
    }
    setLabel(label: string) {
        this.label = label;
    }
    setSource(source: Vertex) {
        this.source = source;
    }
    setWeight(weight: number) {
        this.weight = weight;
    }
    setDestination(destination: Vertex) {
        this.destination = destination;
    }
    setHighway(highway: string){
        this.highway = highway;
    }
    setSurface(surface: string){
        this.surface = surface;
    }
    setOneway(oneway: string){
        this.oneway = oneway;
    }

    getDestination(){
        return this.destination;
    }

    getHighway(){
        return this.highway;
    }

    getSurface(){
        return this.surface;
    }

    getOneway(){
        return this.oneway;
    }
}
export default Edge;