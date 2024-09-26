import Edge from "../Edge"; // Importamos Edge en lugar de Vertex

class MinHeap {
    private heap: { edge: Edge, weight: number }[] = []; // Ahora se trabaja con aristas

    // Insertamos una arista con su peso
    insert(edge: Edge, weight: number) {
        this.heap.push({ edge, weight });
        this.bubbleUp();
    }

    // Extraemos la arista con el menor peso
    extractMin(): { edge: Edge, weight: number } | null {
        if (this.heap.length === 0) return null;

        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0 && last !== undefined) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return min;
    }

    private bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].weight >= this.heap[parentIndex].weight) break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private bubbleDown() {
        let index = 0;
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex < this.heap.length && this.heap[leftChildIndex].weight < this.heap[smallest].weight) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].weight < this.heap[smallest].weight) {
                smallest = rightChildIndex;
            }
            if (smallest === index) break;
            this.swap(index, smallest);
            index = smallest;
        }
    }

    private swap(index1: number, index2: number) {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

export default MinHeap;
