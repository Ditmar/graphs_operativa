import Vertex from './Vertex';

class Edge {
    label: string | null;
    source: Vertex | null;
    destination: Vertex | null;
    weight: Number;
    /** Capacity used by Ford-Fulkerson (based on road type from OSM highway tag) */
    lanes: number = 1;
    /** Street name from OSM 'name' property */
    streetName: string = '';
    constructor(label: string | null = '', source: Vertex | null = null) {
        this.label = label;
        this.source = source;
        this.destination = null;
        this.weight = Infinity;
    }
    setLabel(label: string) {
        this.label = label;
    }
    setSource(source: Vertex) {
        this.source = source;
    }
    setWeight(weight: Number) {
        this.weight = weight;
    }
    setDestination(destination: Vertex) {
        this.destination = destination;
    }
    setLanes(lanes: number) {
        this.lanes = lanes;
    }
    setStreetName(name: string) {
        this.streetName = name;
    }
}
export default Edge;