
"use client";

import * as React from 'react';
import * as d3 from 'd3-force';
import { useData } from '@/context/data-context';
import { GraphData, GraphNode, GraphEdge } from '@/lib/types';
import { Card } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import * as d3Selection from 'd3-selection';
import * as d3Zoom from 'd3-zoom';
import * as d3Drag from 'd3-drag';


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

// Function to calculate radius based on text length
const calculateRadius = (label: string) => {
    const baseRadius = 15;
    const charWidth = 7.5; 
    const padding = 20;
    const calculatedWidth = label.length * charWidth;
    return Math.max(baseRadius, calculatedWidth / 2 + padding);
};


export default function GraphView() {
  const allData = useData();
  const { companias, sistemas, ambientes, servidores, databases: dbs } = allData;
  const [graphData, setGraphData] = React.useState<GraphData>({ nodes: [], edges: [] });
  const [simulatedNodes, setSimulatedNodes] = React.useState<GraphNode[]>([]);
  const [simulatedEdges, setSimulatedEdges] = React.useState<d3.SimulationLinkDatum<GraphNode>[]>([]);
  
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const zoomGroupRef = React.useRef<SVGGElement>(null);
  const nodePositionsRef = React.useRef<Map<string, {x: number, y: number}>>(new Map());


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
        if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
            if (!edges.some(e => e.id === edgeId)) {
                edges.push({ id: edgeId, source: sourceId, target: targetId });
            }
        }
    };
    
    companias.forEach(c => addNode({ id: c.id!, label: c.nombre, type: 'compania', data: c }));
    
    // Create a map of systems to companies based on DBs
    const systemToCompanyMap = new Map<string, string>();
    dbs.forEach(db => {
        const server = servidores.find(srv => srv.id === db.servidorId);
        if (!server) return;
        const ambiente = ambientes.find(a => a.id === server.ambienteId);
        if (!ambiente) return;
        if (ambiente.sistemaId && db.companiaId) {
            systemToCompanyMap.set(ambiente.sistemaId, db.companiaId);
        }
    });

    sistemas.forEach(s => {
      addNode({ id: s.id!, label: s.nombre, type: 'sistema', data: s });
      const companyId = systemToCompanyMap.get(s.id!);
      if (companyId) {
           addEdge(companyId, s.id!);
      } else if (companias.length > 0) {
           // Fallback: connect to the first company if no specific link is found
           addEdge(companias[0].id!, s.id!)
      }
    });

    ambientes.forEach(a => {
        addNode({ id: a.id!, label: a.nombre, type: 'ambiente', data: a });
        if(a.sistemaId) addEdge(a.sistemaId, a.id!);
    });

    servidores.forEach(s => {
        addNode({ id: s.id!, label: s.nombre, type: 'servidor', data: s });
        if(s.ambienteId) addEdge(s.ambienteId, s.id!);
    });

    dbs.forEach(db => {
        addNode({ id: db.id!, label: db.nombre_bd, type: 'database', data: db });
        if(db.servidorId) addEdge(db.servidorId, db.id!);
    });


    // Dynamically calculate radius for each node
    const finalNodes = nodes.map(node => {
        const pos = nodePositionsRef.current.get(node.id);
        return {
            ...node,
            radius: calculateRadius(node.label),
            x: pos?.x,
            y: pos?.y,
            fx: pos?.x,
            fy: pos?.y,
        }
    });


    setGraphData({ nodes: finalNodes, edges });

  }, [companias, sistemas, ambientes, servidores, dbs]);


  React.useEffect(() => {
    if (!containerRef.current || !svgRef.current || graphData.nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const simulation = d3.forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(graphData.edges).id((d: any) => d.id).distance(150).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-1500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 30).strength(0.8));

    
    const drag = (simulation: d3.Simulation<GraphNode, undefined>) => {
        function dragstarted(event: d3.D3DragEvent<Element, GraphNode, any>, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event: d3.D3DragEvent<Element, GraphNode, any>, d: GraphNode) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event: d3.D3DragEvent<Element, GraphNode, any>, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0);
            nodePositionsRef.current.set(d.id, { x: d.fx!, y: d.fy! });
        }
        
        return d3Drag.drag<SVGGElement, GraphNode>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    
    const svgElement = d3Selection.select(svgRef.current);
    const g = d3Selection.select(zoomGroupRef.current);

    // Setup zoom
    const zoom = d3Zoom.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });
      
    svgElement.call(zoom as any).on("dblclick.zoom", null);

    // Apply drag to node groups after they are rendered
    setTimeout(() => {
        const nodeSelection = g.selectAll<SVGGElement, GraphNode>('.node-group');
        nodeSelection.call(drag(simulation as any));
    }, 0);


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
                // Find which company this system belongs to
                const server = servidores.find(srv => {
                    const ambiente = ambientes.find(a => a.sistemaId === s.id);
                    return srv.ambienteId === ambiente?.id;
                });
                const db = dbs.find(d => d.servidorId === server?.id);
                return db?.companiaId === node.id;
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
                <span className="col-span-2 text-sm text-muted-foreground break-all">{value}</span>
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
        <g ref={zoomGroupRef}>
            <g className="links">
            {simulatedEdges.map(edge => {
                const sourceNode = edge.source as GraphNode;
                const targetNode = edge.target as GraphNode;
                if (!sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) return null;

                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                const targetRadius = (targetNode as any).radius || 20;
                const endX = targetNode.x - (dx / dist) * (targetRadius + 5);
                const endY = targetNode.y - (dy / dist) * (targetRadius + 5);

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
                        <g transform={`translate(${node.x || 0}, ${node.y || 0})`} className="cursor-pointer group node-group">
                            <circle
                                r={(node as any).radius}
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
        </g>
      </svg>
    </Card>
  );
}

