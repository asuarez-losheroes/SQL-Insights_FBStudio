
import { useEffect } from 'react';
import { useReactFlow, Node, Edge } from 'reactflow';
import dagre from '@dagrejs/dagre';

type DagreLayoutProps = {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
};

const DagreLayout = ({ nodes, edges, setNodes, setEdges }: DagreLayoutProps) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodes.length === 0) return;

    const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 });

    nodes.forEach((node) => g.setNode(node.id, { label: node.data.label, width: 150, height: 100 }));
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));

    dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
      const { x, y } = g.node(node.id);
      return { ...node, position: { x, y } };
    });

    setNodes(layoutedNodes);
    // The fitView call is debounced to ensure the layout has been applied
    const timer = setTimeout(() => {
      fitView({ duration: 800, padding: 0.1 });
    }, 100);

    return () => clearTimeout(timer);

  }, [nodes.length, edges.length, fitView, setNodes]);

  return null;
};

export default DagreLayout;
