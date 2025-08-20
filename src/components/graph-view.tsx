
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
  compania: 40,
  sistema: 36,
  ambiente: 32,
  servidor: 28,
  database: 24,
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

    const addNode = (node: GraphNode) => {
        if (!nodeIds.has(node.id)) {
            nodes.push(node);
            nodeIds.add(node.id);
        }
    };

    const addEdge = (sourceId: string, targetId: string) => {
        const edgeId = `e-${sourceId}-${targetId}`;
        if (!edges.some(e => e.id === edgeId)) {
            edges.push({ id: edgeId, source: sourceId, target: targetId });
        }
    };
    
    // 1. Add all companies
    companias.forEach(c => {
        addNode({ id: c.id!, label: c.nombre, type: 'compania', data: c });
    });
    
    // 2. Add all systems and link to companies
    sistemas.forEach(s => {
        addNode({ id: s.id!, label: s.nombre, type: 'sistema', data: s });
        // Heuristic: link system to the first company that has a DB for this system
        const companiaId = dbs.find(db => {
            const server = servidores.find(srv => srv.id === db.servidorId);
            const ambiente = ambientes.find(a => a.id === server?.ambienteId);
            return ambiente?.sistemaId === s.id;
        })?.companiaId;

        if (companiaId) {
             addEdge(companiaId, s.id!);
        }
    });

    // 3. Add all ambientes and link to systems
    ambientes.forEach(a => {
        addNode({ id: a.id!, label: a.nombre, type: 'ambiente', data: a });
        addEdge(a.sistemaId, a.id!);
    });

    // 4. Add all servers and link to ambientes
    servidores.forEach(s => {
        addNode({ id: s.id!, label: s.nombre, type: 'servidor', data: s });
        addEdge(s.ambienteId, s.id!);
    });

    // 5. Add all databases and link to servers
    dbs.forEach(db => {
        addNode({ id: db.id!, label: db.nombre_bd, type: 'database', data: db });
        addEdge(db.servidorId, db.id!);
    });

    setGraphData({ nodes, edges });

  }, [companias, sistemas, ambientes, servidores, dbs]);


  React.useEffect(() => {
    if (!containerRef.current || graphData.nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const simulation = d3.forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(graphData.edges).id((d: any) => d.id).distance(120).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => NODE_RADIUS[d.type] + 25));

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
        case 'compania': {
            const companySistemas = sistemas.filter(s => {
                return dbs.some(db => {
                    if (db.companiaId !== node.id) return false;
                    const server = servidores.find(srv => srv.id === db.servidorId);
                    const ambiente = ambientes.find(a => a.id === server?.ambienteId);
                    return ambiente?.sistemaId === s.id;
                });
            });
             details = { 'Sistemas': companySistemas.length };
            break;
        }
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
        case 'servidor': {
             const ambiente = allData.ambientes.find(a => a.id === node.data.ambienteId);
             const sistema = allData.sistemas.find(s => s.id === ambiente?.sistemaId);
            details = {
                'IP': node.data.ip,
                'S.O.': getRelationName(node.data.sistemaOperativoId, allData.sistemasOperativos),
                'Ambiente': ambiente?.nombre,
                'Sistema': sistema?.nombre
            };
            break;
        }
        case 'database': {
            const servidor = allData.servidores.find(s => s.id === node.data.servidorId);
            details = {
                'Servidor': servidor?.nombre || 'N/A',
                'Motor': getRelationName(node.data.motorId, allData.motores),
                'Crítica': <Badge variant={node.data.critico ? 'destructive' : 'secondary'}>{node.data.critico ? 'Si' : 'No'}</Badge>
            };
            break;
        }
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
                        <text textAnchor="middle" dy=".3em" fill="white" fontSize="12px" className="font-sans select-none pointer-events-none">
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
