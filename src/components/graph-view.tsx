"use client";

import * as React from 'react';
import * as d3 from 'd3-force';
import { useData } from '@/context/data-context';
import { GraphData, GraphNode, GraphEdge } from '@/lib/types';
import { Card } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const NODE_RADIUS: { [key: string]: number } = {
  sistema: 28,
  ambiente: 22,
  servidor: 18,
  database: 14,
};

const NODE_COLORS: { [key: string]: string } = {
  sistema: '#3F51B5', // Primary
  ambiente: '#FF9800', // Accent
  servidor: '#4CAF50', // Green
  database: '#2196F3', // Blue
};

export default function GraphView() {
  const { sistemas, ambientes, servidores, databases: dbs } = useData();
  const [graphData, setGraphData] = React.useState<GraphData>({ nodes: [], edges: [] });
  const [simulatedNodes, setSimulatedNodes] = React.useState<GraphNode[]>([]);
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    sistemas.forEach(s => {
      nodes.push({ id: s.id!, label: s.nombre, type: 'sistema', data: s });
    });

    ambientes.forEach(a => {
      nodes.push({ id: a.id!, label: a.nombre, type: 'ambiente', data: a });
      edges.push({ id: `e-${a.sistemaId}-${a.id}`, source: a.sistemaId, target: a.id! });
    });

    servidores.forEach(s => {
      nodes.push({ id: s.id!, label: s.nombre, type: 'servidor', data: s });
      edges.push({ id: `e-${s.ambienteId}-${s.id}`, source: s.ambienteId, target: s.id! });
    });

    dbs.forEach(db => {
      nodes.push({ id: db.id!, label: db.nombre_bd, type: 'database', data: db });
      edges.push({ id: `e-${db.servidorId}-${db.id}`, source: db.servidorId, target: db.id! });
    });

    setGraphData({ nodes, edges });

  }, [sistemas, ambientes, servidores, dbs]);


  React.useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const width = svgRef.current.parentElement!.clientWidth;
    const height = svgRef.current.parentElement!.clientHeight;

    const simulation = d3.forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(graphData.edges).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => NODE_RADIUS[d.type] + 10));

    simulation.on('tick', () => {
      setSimulatedNodes([...simulation.nodes() as GraphNode[]]);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData]);


  if (graphData.nodes.length === 0) {
    return <Card className="w-full h-full flex items-center justify-center"><p>No hay datos para mostrar en el grafo.</p></Card>
  }
  
  return (
    <Card className="w-full h-full overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full" viewBox={`0 0 ${svgRef.current?.parentElement?.clientWidth || 1000} ${svgRef.current?.parentElement?.clientHeight || 800}`}>
        <defs>
            <marker id="arrow" viewBox="0 -5 10 10" refX={20} refY={0} markerWidth={6} markerHeight={6} orient="auto">
                <path d="M0,-5L10,0L0,5" fill="#999"></path>
            </marker>
        </defs>

        <g className="links">
          {graphData.edges.map(edge => {
            const sourceNode = simulatedNodes.find(n => n.id === edge.source);
            const targetNode = simulatedNodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            return (
              <line
                key={edge.id}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="#999"
                strokeWidth="1.5"
                markerEnd="url(#arrow)"
              />
            );
          })}
        </g>
        <g className="nodes">
          {simulatedNodes.map(node => (
            <Popover key={node.id}>
                <PopoverTrigger asChild>
                    <g transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer group">
                        <circle
                            r={NODE_RADIUS[node.type]}
                            fill={NODE_COLORS[node.type]}
                            className="transition-all duration-300 group-hover:opacity-80"
                        />
                        <text textAnchor="middle" dy=".3em" fill="white" fontSize="10px" className="font-sans select-none pointer-events-none">
                            {node.label.length > 8 ? `${node.label.slice(0, 7)}...` : node.label}
                        </text>
                    </g>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">{node.label}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                                {node.type}
                            </p>
                        </div>
                        <div className="grid gap-2">
                           {Object.entries(node.data).map(([key, value]) => (
                             <div key={key} className="grid grid-cols-3 items-center gap-4">
                               <span className="text-sm font-medium">{key}</span>
                               <span className="col-span-2 text-sm text-muted-foreground break-all">{String(value)}</span>
                             </div>
                           ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
          ))}
        </g>
      </svg>
    </Card>
  );
}
