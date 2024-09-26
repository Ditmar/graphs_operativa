import { drawGraph } from './graph-ui/index';
import { Run } from './Elements/Run';
import { Labels } from './Elements/VertexLabels';

let graph = drawGraph();
Run(graph);
Labels(graph);
