import Vertex from "../Vertex";

class MinHeap {
    private heap: { vertex: Vertex, distance: number }[] = [];

    insert(vertex: Vertex, distance: number) {
        this.heap.push({ vertex, distance });
        this.bubbleUp();
    }

    extractMin(): { vertex: Vertex, distance: number } | null {
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
            if (this.heap[index].distance >= this.heap[parentIndex].distance) break;
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

            if (leftChildIndex < this.heap.length && this.heap[leftChildIndex].distance < this.heap[smallest].distance) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].distance < this.heap[smallest].distance) {
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
