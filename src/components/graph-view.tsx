
"use client";

import * as React from 'react';
import { useData } from '@/context/data-context';
import { Card } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { getRectOfNodes, getTransformForBounds } from 'reactflow';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import DagreLayout from './DagreLayout';
import { GraphData, GraphNode as CustomGraphNode } from '@/lib/types';

const getRelationName = (id: string, collection: {id: string, nombre: string}[]) => {
  return collection.find(item => item.id === id)?.nombre || 'N/A';
};

const getNodeColor = (type: string) => {
  const NODE_COLORS: { [key: string]: string } = {
    compania: 'hsl(var(--destructive))',
    sistema: 'hsl(var(--primary))',
    ambiente: 'hsl(var(--accent))',
    servidor: 'hsl(var(--chart-2))',
    database: 'hsl(var(--chart-1))',
    default: 'hsl(var(--muted-foreground))',
  };
  return NODE_COLORS[type] || NODE_COLORS.default;
};

const CustomNode = ({ data }: { data: { label: string; type: string, details: any } }) => (
  <Popover>
    <PopoverTrigger asChild>
      <div
        style={{
          background: getNodeColor(data.type),
          color: 'white',
          padding: '10px 15px',
          borderRadius: '50%',
          minWidth: '60px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: '12px',
          cursor: 'pointer',
        }}
        className="react-flow__node-default"
      >
        {data.label}
      </div>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">{data.label}</h4>
          <p className="text-sm text-muted-foreground capitalize">{data.type}</p>
        </div>
        <div className="grid gap-2">
          {Object.entries(data.details).map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">{key}</span>
              <span className="col-span-2 text-sm text-muted-foreground break-all">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

const nodeTypes = {
  custom: CustomNode,
};

const GraphViewContent = () => {
  const allData = useData();
  const { companias, sistemas, ambientes, servidores, databases: dbs, criticidades, tiposSistema, sistemasOperativos, motores } = allData;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  React.useEffect(() => {
    const graphNodes: CustomGraphNode[] = [];
    const graphEdges: { id: string, source: string, target: string }[] = [];
    const nodeIds = new Set<string>();

    const addNode = (node: CustomGraphNode) => {
        if (!nodeIds.has(node.id)) {
            graphNodes.push(node);
            nodeIds.add(node.id);
        }
    };

    const addEdge = (sourceId: string, targetId: string) => {
        const edgeId = `e-${sourceId}-${targetId}`;
        if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
            if (!graphEdges.some(e => e.id === edgeId)) {
                graphEdges.push({ id: edgeId, source: sourceId, target: targetId });
            }
        }
    };

    companias.forEach(c => addNode({ id: c.id!, label: c.nombre, type: 'compania', data: c }));
    sistemas.forEach(s => {
        addNode({ id: s.id!, label: s.nombre, type: 'sistema', data: s });
        const companyId = dbs.find(db => servidores.find(srv => srv.id === db.servidorId && ambientes.find(a => a.id === srv.ambienteId)?.sistemaId === s.id))?.companiaId || (companias.length > 0 ? companias[0].id : undefined);
        if (companyId) {
            addEdge(companyId, s.id!);
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

    const getNodeDetails = (node: CustomGraphNode) => {
        let details: { [key: string]: any } = {};
        switch (node.type) {
             case 'sistema':
                const criticidad = criticidades.find(c => c.id === node.data.criticidadId);
                details = {
                    'Tipo': getRelationName(node.data.tipoSistemaId, tiposSistema),
                    'Criticidad': criticidad ? <Badge variant={criticidad.nombre === 'Alta' ? 'destructive' : 'secondary'}>{criticidad.nombre}</Badge> : 'N/A',
                };
                break;
             case 'servidor':
                details = {
                    'IP': node.data.ip,
                    'S.O.': getRelationName(node.data.sistemaOperativoId, sistemasOperativos),
                };
                break;
            case 'database':
                details = {
                    'Motor': getRelationName(node.data.motorId, motores),
                    'Crítica': <Badge variant={node.data.critico ? 'destructive' : 'secondary'}>{node.data.critico ? 'Si' : 'No'}</Badge>
                };
                break;
        }
        return details;
    }

    const reactFlowNodes: Node[] = graphNodes.map(node => ({
      id: node.id,
      type: 'custom',
      data: { label: node.label, type: node.type, details: getNodeDetails(node) },
      position: { x: 0, y: 0 }, // Position will be set by Dagre
    }));

    const reactFlowEdges: Edge[] = graphEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: '#999' },
      markerEnd: { type: 'arrowclosed' },
    }));

    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);

  }, [companias, sistemas, ambientes, servidores, dbs, criticidades, tiposSistema, sistemasOperativos, motores]);

  const downloadImage = () => {
    const imageWidth = 1200;
    const imageHeight = 900;
    
    const nodesBounds = getRectOfNodes(nodes);
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return;

    toPng(viewport as HTMLElement, {
      backgroundColor: '#ffffff',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', 'graph.png');
      a.setAttribute('href', dataUrl);
      a.click();
    });
  };

  if (nodes.length === 0) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <p>No hay datos para mostrar en el grafo.</p>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap nodeColor={(node: Node) => getNodeColor(node.data.type)} nodeStrokeWidth={3} zoomable pannable />
        <Background color="#ccc" variant="dots" gap={16} size={1} />
        <DagreLayout nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />
        <Button
          onClick={downloadImage}
          className="absolute bottom-4 right-20 z-10"
          variant="outline"
          size="icon"
          aria-label="Descargar PNG"
        >
          <Download className="h-4 w-4" />
        </Button>
      </ReactFlow>
    </Card>
  );
};

const GraphViewWrapper = () => (
  <ReactFlowProvider>
    <GraphViewContent />
  </ReactFlowProvider>
);

export default GraphViewWrapper;
