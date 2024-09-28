import Vertex from "../Vertex";

export default class MinHeap {
    private monticulo: { vertex: Vertex; distance: number }[];

    constructor() {
        this.monticulo = [];
    }

    insertar(vertex: Vertex, distance: number) {
        this.monticulo.push({ vertex, distance });
        this.ajustarHaciaArriba(this.monticulo.length - 1);
    }

    extraerMinimo() {
        if (this.monticulo.length === 0) return null;
        const minimo = this.monticulo[0];
        const ultimo = this.monticulo.pop();

        if (this.monticulo.length > 0 && ultimo) {
            this.monticulo[0] = ultimo;
            this.ajustarHaciaAbajo(0);
        }

        return minimo;
    }

    isEmpty() {
        return this.monticulo.length === 0;
    }

    private ajustarHaciaArriba(indice: number) {
        let indiceActual = indice;
        let indicePadre = Math.floor((indiceActual - 1) / 2);

        while (indiceActual > 0 && this.monticulo[indiceActual].distance < this.monticulo[indicePadre].distance) {
            [this.monticulo[indiceActual], this.monticulo[indicePadre]] = [this.monticulo[indicePadre], this.monticulo[indiceActual]];
            indiceActual = indicePadre;
            indicePadre = Math.floor((indiceActual - 1) / 2);
        }
    }

    private ajustarHaciaAbajo(indice: number) {
        let indiceActual = indice;
        const longitud = this.monticulo.length;

        while (true) {
            const indiceHijoIzquierdo = 2 * indiceActual + 1;
            const indiceHijoDerecho = 2 * indiceActual + 2;
            let menor = indiceActual;

            if (indiceHijoIzquierdo < longitud && this.monticulo[indiceHijoIzquierdo].distance < this.monticulo[menor].distance) {
                menor = indiceHijoIzquierdo;
            }

            if (indiceHijoDerecho < longitud && this.monticulo[indiceHijoDerecho].distance < this.monticulo[menor].distance) {
                menor = indiceHijoDerecho;
            }

            if (menor === indiceActual) break;

            [this.monticulo[indiceActual], this.monticulo[menor]] = [this.monticulo[menor], this.monticulo[indiceActual]];
            indiceActual = menor;
        }
    }
}
