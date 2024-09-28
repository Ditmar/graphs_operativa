import Vertex from "../Vertex";

class MinHeap {
    private heap: { vertex: Vertex, distance: number }[] = [];

    insert(vertex: Vertex, distance: number): void {
        this.heap.push({ vertex, distance });
        this.bubbleUp();
    }

    extractMin(): { vertex: Vertex, distance: number } | null {
        if (this.isEmpty()) return null;

        const min = this.heap[0];
        const last = this.heap.pop();
        
        if (last && this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown();
        }

        return min;
    }

    private bubbleUp(): void {
        let index = this.heap.length - 1;

        while (index > 0) {
            const parentIndex = this.getParentIndex(index);
            if (this.heap[index].distance >= this.heap[parentIndex].distance) break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private bubbleDown(): void {
        let index = 0;

        while (true) {
            const leftChildIndex = this.getLeftChildIndex(index);
            const rightChildIndex = this.getRightChildIndex(index);
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

    private swap(index1: number, index2: number): void {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private getParentIndex(index: number): number {
        return Math.floor((index - 1) / 2);
    }

    private getLeftChildIndex(index: number): number {
        return 2 * index + 1;
    }

    private getRightChildIndex(index: number): number {
        return 2 * index + 2;
    }
}

export default MinHeap;
