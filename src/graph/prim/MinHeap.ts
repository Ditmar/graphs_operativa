import Edge from "../Edge";

class MinHeap {
    private heap: { edge: Edge, weight: number }[] = [];
    insert(edge: Edge, weight: number): void {
        this.heap.push({ edge, weight });
        this.bubbleUp();
    }

    extractMin(): { edge: Edge, weight: number } | null {
        if (this.isEmpty()) return null;
        const min = this.heap[0];
        const last = this.heap.pop();

        if (this.heap.length > 0 && last) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return min;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(): void {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].weight >= this.heap[parentIndex].weight) break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    private bubbleDown(): void {
        let index = 0;
        while (true) {
            let smallest = index;
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
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
    private swap(index1: number, index2: number): void {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }
}

export default MinHeap;
