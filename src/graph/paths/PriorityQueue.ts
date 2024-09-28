// src/graph/paths/PriorityQueue.ts

interface PriorityQueueElement<T> {
    element: T;
    priority: number;
}

class PriorityQueue<T> {
    private heap: PriorityQueueElement<T>[] = [];

    // Agregar un elemento a la cola con prioridad
    enqueue(element: T, priority: number) {
        const queueElement: PriorityQueueElement<T> = { element, priority };
        this.heap.push(queueElement);
        this.bubbleUp(this.heap.length - 1);
    }

    // Remover el elemento con la prioridad más baja (mínima)
    dequeue(): PriorityQueueElement<T> | null {
        if (this.isEmpty()) return null;
        const min = this.heap[0];
        const end = this.heap.pop();

        if (this.heap.length > 0 && end) {
            this.heap[0] = end;
            this.bubbleDown(0);
        }

        return min;
    }

    // Verificar si la cola está vacía
    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    // Elevar un elemento hacia arriba en el heap para mantener el orden
    private bubbleUp(index: number) {
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];

            if (element.priority >= parent.priority) break;

            this.heap[parentIndex] = element;
            this.heap[index] = parent;
            index = parentIndex;
        }
    }

    // Hacer que un elemento "caiga" hacia abajo en el heap para mantener el orden
    private bubbleDown(index: number) {
        const length = this.heap.length;
        const element = this.heap[index];

        while (true) {
            let leftChildIdx = 2 * index + 1;
            let rightChildIdx = 2 * index + 2;
            let swap: number | null = null;

            if (leftChildIdx < length) {
                if (this.heap[leftChildIdx].priority < element.priority) {
                    swap = leftChildIdx;
                }
            }

            if (rightChildIdx < length) {
                if (
                    (swap === null && this.heap[rightChildIdx].priority < element.priority) ||
                    (swap !== null && this.heap[rightChildIdx].priority < this.heap[leftChildIdx].priority)
                ) {
                    swap = rightChildIdx;
                }
            }

            if (swap === null) break;

            this.heap[index] = this.heap[swap];
            this.heap[swap] = element;
            index = swap;
        }
    }
}

export default PriorityQueue;
