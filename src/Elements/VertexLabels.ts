import Vertex from '../graph/Vertex';

export const Labels = async (graph: Record<string, Vertex>) => {
    const source = document.getElementById('source') as HTMLSelectElement;
    const destination = document.getElementById('destination') as HTMLSelectElement;

    const createOptionsFragment = (vertices: Vertex[]): DocumentFragment => {
        const fragment = document.createDocumentFragment();
        vertices.forEach(vertex => {
            const option = document.createElement('option');
            option.value = vertex.label;
            option.text = vertex.label;
            fragment.appendChild(option);
        });
        return fragment;
    };

    if (source && destination) {
        const optionsFragment = createOptionsFragment(Object.values(graph));
        source.appendChild(optionsFragment.cloneNode(true));
        destination.appendChild(optionsFragment);
    }
};
