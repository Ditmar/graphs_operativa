import Vertex from '../graph/Vertex';

export const Labels = async (graph: Record<string, Vertex>)=>{
    const source = document.getElementById('source');
    const destination = document.getElementById('destination');

    const fragmentSource = document.createDocumentFragment();
    const fragmentDestination = document.createDocumentFragment();

    Object.values(graph).forEach(vertex => {
        let option = document.createElement('option');
        option.value = vertex.label;
        option.text = vertex.label;
        fragmentSource.appendChild(option.cloneNode(true));
        fragmentDestination.appendChild(option);
    });
    source?.appendChild(fragmentSource);
    destination?.appendChild(fragmentDestination);

}