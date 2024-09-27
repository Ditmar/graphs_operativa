import { drawGraph } from './graph-ui/index';
import { InitializeGraphUI, vertexLabelSelector } from './graph-ui/Elements/InitializeGraphUI';

let graph = drawGraph();
InitializeGraphUI(graph);
vertexLabelSelector(graph);
