
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
import { Button } from './ui/button';
import { Plus, Minus, LocateFixed } from 'lucide-react';


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

const calculateRadius = (label: string) => {
    const baseRadius = 20;
    const charWidth = 7; 
    const padding = 15;
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
  const zoomRef = React.useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);


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
    
    sistemas.forEach(s => {
        addNode({ id: s.id!, label: s.nombre, type: 'sistema', data: s });
        const systemAmbientes = ambientes.filter(a => a.sistemaId === s.id);
        const systemServidores = servidores.filter(srv => systemAmbientes.some(a => a.id === srv.ambienteId));
        const systemDBs = dbs.filter(db => systemServidores.some(srv => srv.id === db.servidorId));
        
        let companyIdForSystem: string | undefined;

        if (systemDBs.length > 0) {
            const dbWithCompany = systemDBs.find(db => db.companiaId);
            if (dbWithCompany) {
                companyIdForSystem = dbWithCompany.companiaId;
            }
        }
        
        if (!companyIdForSystem && companias.length > 0) {
            const anyDbWithCompany = dbs.find(db => db.companiaId);
            if(anyDbWithCompany && anyDbWithCompany.companiaId) {
                const server = servidores.find(s => s.id === anyDbWithCompany.servidorId);
                const ambiente = ambientes.find(a => a.id === server?.ambienteId);
                if (ambiente?.sistemaId === s.id) {
                    companyIdForSystem = anyDbWithCompany.companiaId;
                }
            } else {
                 if (companias.length > 0) {
                    // Fallback: Asignar al primero si no hay otra lógica
                    companyIdForSystem = companias[0].id;
                }
            }
        }

        if (companyIdForSystem) {
             addEdge(companyIdForSystem, s.id!);
        } else if(companias.length > 0) {
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


    const finalNodes = nodes.map(node => {
        const pos = nodePositionsRef.current.get(node.id);
        return {
            ...node,
            radius: calculateRadius(node.label),
            x: pos?.x,
            y: pos?.y
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
      .force('charge', d3.forceManyBody().strength(-2000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 40).strength(0.9));

    
    const drag = (simulation: d3.Simulation<GraphNode, undefined>) => {
        function dragstarted(event: d3.D3DragEvent<Element, GraphNode, any>, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            if (d && d.x && d.y) {
              d.fx = d.x;
              d.fy = d.y;
            }
        }
        
        function dragged(event: d3.D3DragEvent<Element, GraphNode, any>, d: GraphNode) {
            if (d) {
              d.fx = event.x;
              d.fy = event.y;
            }
        }
        
        function dragended(event: d3.D3DragEvent<Element, GraphNode, any>, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0);
            if(d && d.fx !== null && d.fy !== null) {
              nodePositionsRef.current.set(d.id, { x: d.fx, y: d.fy });
            }
        }
        
        return d3Drag.drag<SVGGElement, GraphNode>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    
    const svgElement = d3Selection.select(svgRef.current);
    const g = d3Selection.select(zoomGroupRef.current);

    const zoom = d3Zoom.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });
    
    zoomRef.current = zoom;
      
    svgElement.call(zoom as any).on("dblclick.zoom", null);
    
    const nodeSelection = g.selectAll<SVGGElement, GraphNode>('.node-group');
    nodeSelection.call(drag(simulation as any) as any);


    simulation.on('tick', () => {
      setSimulatedNodes([...simulation.nodes() as GraphNode[]]);
      setSimulatedEdges([...simulation.force<d3.ForceLink<GraphNode, GraphEdge>>('link')!.links()]);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svgElement = d3Selection.select(svgRef.current);
    svgElement.transition().duration(250).call(zoomRef.current.scaleBy, 1.2);
  };
  
  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svgElement = d3Selection.select(svgRef.current);
    svgElement.transition().duration(250).call(zoomRef.current.scaleBy, 0.8);
  };
  
  const handleResetZoom = () => {
    if (!containerRef.current || !svgRef.current || !zoomRef.current) return;
    const svgElement = d3Selection.select(svgRef.current);
    svgElement.transition().duration(500).call(zoomRef.current.transform, d3Zoom.zoomIdentity);
  };


  const NodeDetails = ({ node }: { node: GraphNode }) => {
    let details: { [key: string]: any } = {};

    switch (node.type) {
        case 'compania': {
             const linkedSystems = sistemas.filter(s => {
                const systemAmbientes = ambientes.filter(a => a.sistemaId === s.id);
                if (systemAmbientes.length === 0) {
                    return companias.length > 0 && companias[0].id === node.id;
                }
                const systemServidores = servidores.filter(srv => systemAmbientes.some(a => a.id === srv.ambienteId));
                const systemDBs = dbs.filter(db => systemServidores.some(srv => srv.id === db.servidorId));
                return systemDBs.some(db => db.companiaId === node.id);
            });
            details = { 'Sistemas': linkedSystems.length };
            break;
        }
        case 'sistema':
            const criticidad = allData.criticidades.find(c => c.id === node.data.criticidadId);
            details = {
                'Tipo': getRelationName(node.data.tipoSistemaId, allData.tiposSistema),
                'Criticidad': criticidad ? <Badge variant={criticidad.nombre === 'Alta' ? 'destructive' : 'secondary'}>{criticidad.nombre}</Badge> : 'N/A',
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
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button size="icon" onClick={handleZoomIn} aria-label="Acercar">
          <Plus />
        </Button>
        <Button size="icon" onClick={handleZoomOut} aria-label="Alejar">
          <Minus />
        </Button>
        <Button size="icon" onClick={handleResetZoom} aria-label="Centrar vista">
          <LocateFixed />
        </Button>
      </div>
    </Card>
  );
}
