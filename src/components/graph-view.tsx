
"use client";

import * as React from 'react';
import * as d3 from 'd3-force';
import { useData } from '@/context/data-context';
import { GraphData, GraphNode, GraphEdge } from '@/lib/types';
import { Card } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

const NODE_RADIUS: { [key: string]: number } = {
  compania: 32,
  sistema: 28,
  ambiente: 24,
  servidor: 20,
  database: 16,
};

const NODE_COLORS: { [key: string]: string } = {
  compania: 'hsl(var(--destructive))',
  sistema: 'hsl(var(--primary))',
  ambiente: 'hsl(var(--accent))',
  servidor: 'hsl(var(--chart-2))',
  database: 'hsl(var(--chart-1))',
};

const getRelationName = (id: string, collection: {id: string, nombre: string}[]) => {
  return collection.find(item => item.id === id)?.nombre || 'N/A';
};


export default function GraphView() {
  const allData = useData();
  const { companias, sistemas, ambientes, servidores, databases: dbs } = allData;
  const [graphData, setGraphData] = React.useState<GraphData>({ nodes: [], edges: [] });
  const [simulatedNodes, setSimulatedNodes] = React.useState<GraphNode[]>([]);
  const [simulatedEdges, setSimulatedEdges] = React.useState<d3.SimulationLinkDatum<GraphNode>[]>([]);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIds = new Set<string>();

    // 1. Start with Companies
    companias.forEach(c => {
        nodes.push({ id: c.id!, label: c.nombre, type: 'compania', data: c });
        nodeIds.add(c.id!);
    });

    // 2. Link Databases to Companies and build up from there
    dbs.forEach(db => {
        if (nodeIds.has(db.companiaId)) {
            // Add DB node if it doesn't exist
            if (!nodeIds.has(db.id!)) {
                nodes.push({ id: db.id!, label: db.nombre_bd, type: 'database', data: db });
                nodeIds.add(db.id!);
            }

            // Add Server node if it doesn't exist
            const server = servidores.find(s => s.id === db.servidorId);
            if (server && !nodeIds.has(server.id!)) {
                nodes.push({ id: server.id!, label: server.nombre, type: 'servidor', data: server });
                nodeIds.add(server.id!);
                edges.push({ id: `e-${server.id}-${db.id}`, source: server.id!, target: db.id! });
            } else if (server) {
                // Ensure edge exists even if server node was already added
                 const edgeId = `e-${server.id}-${db.id}`;
                 if (!edges.some(e => e.id === edgeId)) {
                    edges.push({ id: edgeId, source: server.id!, target: db.id! });
                 }
            }
            
            // Add Ambiente node if it doesn't exist
            const ambiente = ambientes.find(a => a.id === server?.ambienteId);
            if (ambiente && !nodeIds.has(ambiente.id!)) {
                nodes.push({ id: ambiente.id!, label: ambiente.nombre, type: 'ambiente', data: ambiente });
                nodeIds.add(ambiente.id!);
                edges.push({ id: `e-${ambiente.id}-${server!.id}`, source: ambiente.id!, target: server!.id! });
            }

            // Add Sistema node if it doesn't exist
            const sistema = sistemas.find(s => s.id === ambiente?.sistemaId);
            if (sistema && !nodeIds.has(sistema.id!)) {
                 nodes.push({ id: sistema.id!, label: sistema.nombre, type: 'sistema', data: sistema });
                 nodeIds.add(sistema.id!);
                 edges.push({ id: `e-${sistema.id}-${ambiente!.id}`, source: sistema.id!, target: ambiente!.id! });
                 // Link Sistema to its Company
                 edges.push({ id: `e-${db.companiaId}-${sistema.id}`, source: db.companiaId, target: sistema.id! });
            }
        }
    });
    
    setGraphData({ nodes, edges });

  }, [companias, sistemas, ambientes, servidores, dbs]);


  React.useEffect(() => {
    if (!containerRef.current || graphData.nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const simulation = d3.forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(graphData.edges).id((d: any) => d.id).distance(100).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => NODE_RADIUS[d.type] + 20));

    simulation.on('tick', () => {
      setSimulatedNodes([...simulation.nodes() as GraphNode[]]);
      setSimulatedEdges([...simulation.force<d3.ForceLink<GraphNode, GraphEdge>>('link')!.links()]);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  const NodeDetails = ({ node }: { node: GraphNode }) => {
    let details: { [key: string]: any } = {};

    switch (node.type) {
        case 'compania':
             details = {
                'Sistemas': sistemas.filter(s => dbs.some(db => db.companiaId === node.id && servidores.find(srv => srv.id === db.servidorId)?.ambienteId && ambientes.find(a => a.id === servidores.find(srv => srv.id === db.servidorId)?.ambienteId)?.sistemaId === s.id)).length,
             };
            break;
        case 'sistema':
            details = {
                'Tipo': getRelationName(node.data.tipoSistemaId, allData.tiposSistema),
                'Criticidad': getRelationName(node.data.criticidadId, allData.criticidades),
                'Resp. Técnico': node.data.responsableTecnico
            };
            break;
        case 'ambiente':
            details = {
                'Sistema': getRelationName(node.data.sistemaId, allData.sistemas),
                'URL': node.data.urlAcceso || 'N/A'
            };
            break;
        case 'servidor':
             const ambiente = allData.ambientes.find(a => a.id === node.data.ambienteId);
             const sistema = allData.sistemas.find(s => s.id === ambiente?.sistemaId);
            details = {
                'IP': node.data.ip,
                'S.O.': getRelationName(node.data.sistemaOperativoId, allData.sistemasOperativos),
                'Ambiente': ambiente?.nombre,
                'Sistema': sistema?.nombre
            };
            break;
        case 'database':
            const servidor = allData.servidores.find(s => s.id === node.data.servidorId);
            details = {
                'Servidor': servidor?.nombre || 'N/A',
                'Motor': getRelationName(node.data.motorId, allData.motores),
                'Crítica': <Badge variant={node.data.critico ? 'destructive' : 'secondary'}>{node.data.critico ? 'Si' : 'No'}</Badge>
            };
            break;
    }


    return (
       <div className="grid gap-2">
            {Object.entries(details).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">{key}</span>
                <span className="col-span-2 text-sm text-muted-foreground break-all">{String(value)}</span>
                </div>
            ))}
        </div>
    )
  }


  if (graphData.nodes.length === 0) {
    return <Card className="w-full h-full flex items-center justify-center"><p>No hay datos para mostrar en el grafo.</p></Card>
  }
  
  return (
    <Card ref={containerRef} className="w-full h-full overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full" viewBox={`0 0 ${containerRef.current?.clientWidth || 1000} ${containerRef.current?.clientHeight || 800}`}>
        <defs>
            <marker id="arrow" viewBox="0 -5 10 10" refX={10} refY={0} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
                <path d="M0,-5L10,0L0,5" fill="#999"></path>
            </marker>
        </defs>

        <g className="links">
          {simulatedEdges.map(edge => {
            const sourceNode = edge.source as GraphNode;
            const targetNode = edge.target as GraphNode;
            if (!sourceNode.x || !targetNode.x) return null;

            // Calculate direction vector
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate edge endpoint, considering the radius of the target node
            const endX = targetNode.x - (dx / dist) * (NODE_RADIUS[targetNode.type] + 2);
            const endY = targetNode.y - (dy / dist) * (NODE_RADIUS[targetNode.type] + 2);

            return (
              <line
                key={(edge as GraphEdge).id}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={endX}
                y2={endY}
                stroke="hsl(var(--muted-foreground) / 0.5)"
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
                    <g transform={`translate(${node.x || 0}, ${node.y || 0})`} className="cursor-pointer group">
                        <circle
                            r={NODE_RADIUS[node.type]}
                            fill={NODE_COLORS[node.type]}
                            className="transition-all duration-300 group-hover:opacity-80"
                            stroke='hsl(var(--background))'
                            strokeWidth={2}
                        />
                        <text textAnchor="middle" dy=".3em" fill="white" fontSize="11px" className="font-sans select-none pointer-events-none">
                            {node.label}
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
                        <NodeDetails node={node} />
                    </div>
                </PopoverContent>
            </Popover>
          ))}
        </g>
      </svg>
    </Card>
  );
}
