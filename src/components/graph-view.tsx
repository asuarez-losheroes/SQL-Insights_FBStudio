
"use client";

import * as React from 'react';
import { useData } from '@/context/data-context';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Download, Focus, Minus, Plus } from 'lucide-react';
import * as d3Selection from 'd3-selection';
import * as d3Zoom from 'd3-zoom';
import * as d3Drag from 'd3-drag';
import * as d3Force from 'd3-force';
import { toPng } from 'html-to-image';
import { GraphNode as CustomGraphNode } from '@/lib/types';
import ReactDOMServer from 'react-dom/server';


// --- Helper Functions and Constants defined outside the component ---

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

// --- Main Component ---

const GraphView = () => {
    const allData = useData();
    const { companias, sistemas, ambientes, servidores, databases: dbs, criticidades, tiposSistema, sistemasOperativos, motores } = allData;
    const svgRef = React.useRef<SVGSVGElement>(null);
    const zoomRef = React.useRef<d3Zoom.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    const getNodeDetails = React.useCallback((node: CustomGraphNode) => {
        let details: { [key: string]: any } = {};
         switch (node.type) {
            case 'compania':
                const companySystems = sistemas.filter(s => {
                    const systemAmbientes = ambientes.filter(a => a.sistemaId === s.id);
                    // Handle systems with no ambientes directly linked to company
                    const crmSystem = sistemas.find(s => s.nombre === "CRM Interno");
                    const cajaCompany = companias.find(c => c.nombre === "Caja Los Héroes");

                    if(s.id === crmSystem?.id && node.id === cajaCompany?.id) return true;

                    const systemAmbienteIds = systemAmbientes.map(a => a.id);
                    if (systemAmbienteIds.length === 0) return false;

                    const systemServidores = servidores.filter(srv => systemAmbienteIds.includes(srv.ambienteId));
                    const systemServerIds = systemServidores.map(srv => srv.id);
                    const systemDBs = dbs.filter(db => systemServerIds.includes(db.servidorId));
                    return systemDBs.some(db => db.companiaId === node.id);
                });
                details = { 'Sistemas': companySystems.length };
                break;
             case 'sistema':
                const criticidad = criticidades.find(c => c.id === node.data.criticidadId);
                details = { 'Tipo': getRelationName(node.data.tipoSistemaId, tiposSistema), 'Criticidad': <Badge variant={criticidad?.nombre === 'Alta' ? 'destructive' : 'secondary'}>{criticidad?.nombre || 'N/A'}</Badge> };
                break;
             case 'servidor':
                details = { 'IP': node.data.ip, 'S.O.': getRelationName(node.data.sistemaOperativoId, sistemasOperativos) };
                break;
            case 'database':
                details = { 'Motor': getRelationName(node.data.motorId, motores), 'Crítica': <Badge variant={node.data.critico ? 'destructive' : 'secondary'}>{node.data.critico ? 'Si' : 'No'}</Badge> };
                break;
        }
        return details;
    }, [sistemas, dbs, servidores, ambientes, criticidades, tiposSistema, sistemasOperativos, motores, companias]);


    React.useEffect(() => {
        if (!svgRef.current) return;

        const width = svgRef.current.parentElement?.clientWidth || 800;
        const height = svgRef.current.parentElement?.clientHeight || 600;

        const allNodes: CustomGraphNode[] = [];
        const nodeMap = new Map<string, CustomGraphNode>();

        const addNode = (node: CustomGraphNode) => {
            if (!nodeMap.has(node.id)) {
                nodeMap.set(node.id, node);
                allNodes.push(node);
            }
        };

        companias.forEach(c => c.id && addNode({ id: c.id, label: c.nombre, type: 'compania', data: c }));
        sistemas.forEach(s => s.id && addNode({ id: s.id, label: s.nombre, type: 'sistema', data: s }));
        ambientes.forEach(a => a.id && addNode({ id: a.id, label: a.nombre, type: 'ambiente', data: a }));
        servidores.forEach(s => s.id && addNode({ id: s.id, label: s.nombre, type: 'servidor', data: s }));
        dbs.forEach(db => db.id && addNode({ id: db.id, label: db.nombre_bd, type: 'database', data: db }));

        const allEdges: {source: string, target: string}[] = [];
        const addedEdges = new Set<string>();

        const addEdge = (source: string, target: string) => {
            const key = `${source}-${target}`;
            if (source && target && !addedEdges.has(key)) {
                allEdges.push({ source, target });
                addedEdges.add(key);
            }
        };

        // Connect DBs to their company's system
        dbs.forEach(db => {
            const server = servidores.find(s => s.id === db.servidorId);
            const ambiente = ambientes.find(a => a.id === server?.ambienteId);
            if (ambiente?.sistemaId && db.companiaId) {
                // This creates a link between company and system through the DB
                addEdge(db.companiaId, ambiente.sistemaId);
            }
        });
        
        // Explicitly connect "CRM Interno" to "Caja Los Héroes"
        const crmSystem = sistemas.find(s => s.nombre === "CRM Interno");
        const cajaCompany = companias.find(c => c.nombre === "Caja Los Héroes");
        if (crmSystem?.id && cajaCompany?.id) {
            addEdge(cajaCompany.id, crmSystem.id);
        }

        dbs.forEach(db => {
            if(db.servidorId) addEdge(db.servidorId, db.id!);
        });
        servidores.forEach(s => {
            if(s.ambienteId) addEdge(s.ambienteId, s.id!);
        });
        ambientes.forEach(a => {
            if(a.sistemaId) addEdge(a.sistemaId, a.id!);
        });

        const svg = d3Selection.select(svgRef.current);
        svg.selectAll("*").remove();

        const container = svg.append("g");

        const zoom = d3Zoom.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
            container.attr("transform", event.transform);
        });
        zoomRef.current = zoom;
        svg.call(zoom as any);
        
        const tooltip = d3Selection.select(svg.node()?.parentNode as Element).append("div")
            .attr("class", "graph-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("pointer-events", "none")
            .style("color", "black")
            .style("z-index", "100");


        const simulation = d3Force.forceSimulation(allNodes as d3.SimulationNodeDatum[])
            .force("link", d3Force.forceLink(allEdges).id((d: any) => d.id).distance(120))
            .force("charge", d3Force.forceManyBody().strength(-800))
            .force("center", d3Force.forceCenter(width / 2, height / 2))
            .force("collision", d3Force.forceCollide().radius((d: any) => (d.label.length * 4) + 40));


        const link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(allEdges)
            .enter().append("line")
            .attr("stroke-width", 1.5)
            .attr("stroke", "#999");

        const node = container.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(allNodes)
            .enter().append("g")
            .call(drag(simulation) as any)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                const details = getNodeDetails(d);
                const detailsHtml = Object.entries(details).map(([key, value]) => {
                    // Check if value is a react element
                    if (React.isValidElement(value)) {
                       return `<div><strong>${key}:</strong> ${ReactDOMServer.renderToStaticMarkup(value)}</div>`;
                    }
                    return `<div><strong>${key}:</strong> ${value}</div>`;
                }).join('');

                tooltip.html(`
                    <h4>${d.label}</h4>
                    <p>Tipo: ${d.type}</p>
                    ${detailsHtml}
                `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });
        
        const calculateRadius = (d: CustomGraphNode) => Math.max(40, d.label.length * 4.5);

        node.append("circle")
            .attr("r", calculateRadius)
            .attr("fill", d => getNodeColor(d.type));
            
        node.append("text")
            .text(d => d.label)
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .attr("fill", "white")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .each(function(d) {
                const text = d3Selection.select(this);
                const radius = calculateRadius(d) * 0.9;
                const words = d.label.split(/\\s+/).reverse();
                let word;
                let line: string[] = [];
                let lineNumber = 0;
                const lineHeight = 1.1; 
                const y = text.attr("y") || 0;
                const dy = parseFloat(text.attr("dy") || "0");
                let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if ((tspan.node()?.getComputedTextLength() ?? 0) > radius * 2) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);
            node
                .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        function drag(simulation: d3Force.Simulation<d3.SimulationNodeDatum, undefined>) {
            function dragstarted(event: d3.D3DragEvent<Element, CustomGraphNode, any>, d: CustomGraphNode) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                 if (d && d.x && d.y) {
                    d.fx = d.x;
                    d.fy = d.y;
                }
            }
            function dragged(event: d3.D3DragEvent<Element, CustomGraphNode, any>, d: CustomGraphNode) {
                 if (d) {
                    d.fx = event.x;
                    d.fy = event.y;
                }
            }
            function dragended(event: d3.D3DragEvent<Element, CustomGraphNode, any>, d: CustomGraphNode) {
                if (!event.active) simulation.alphaTarget(0);
                 if (d) {
                    d.fx = null;
                    d.fy = null;
                }
            }
            return d3Drag.drag<Element, CustomGraphNode>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

    }, [allData, getNodeDetails]);

    const downloadImage = React.useCallback(async () => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const { width, height } = svgElement.getBoundingClientRect();
        const transform = d3Zoom.zoomTransform(svgElement as any);

        const clonedSvgElement = svgElement.cloneNode(true) as SVGSVGElement;
        
        const originalNodes = d3Selection.select(svgElement).selectAll('.nodes g');
        d3Selection.select(clonedSvgElement).selectAll('.nodes g').each(function(d, i) {
            const originalNode = originalNodes.nodes()[i] as SVGGElement;
            const circle = d3Selection.select(this).select('circle');
            if (circle.node()) {
                const originalCircle = d3Selection.select(originalNode).select('circle');
                const fillColor = window.getComputedStyle(originalCircle.node()!).getPropertyValue('fill');
                circle.style('fill', fillColor);
            }
        });


        toPng(clonedSvgElement, {
            backgroundColor: '#ffffff',
            width: width,
            height: height,
            style: {
                transform: `matrix(${transform.k}, 0, 0, ${transform.k}, ${transform.x}, ${transform.y})`,
                transformOrigin: 'top left',
            },
            skipFonts: true,
        }).then((dataUrl) => {
            const a = document.createElement('a');
            a.setAttribute('download', 'graph.png');
            a.setAttribute('href', dataUrl);
            a.click();
        }).catch((error) => {
            console.error('oops, something went wrong!', error);
        });
    }, []);
    
    const handleZoom = (scale: number) => {
        if (svgRef.current && zoomRef.current) {
            d3Selection.select(svgRef.current).transition().duration(750).call(zoomRef.current.scaleBy, scale);
        }
    };

    const handleResetZoom = () => {
        if (svgRef.current && zoomRef.current) {
            d3Selection.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, d3Zoom.zoomIdentity);
        }
    }


  if (sistemas.length === 0) {
    return <Card className="w-full h-full flex items-center justify-center"><p>No hay datos para mostrar en el grafo.</p></Card>;
  }

  return (
    <Card className="w-full h-full relative overflow-hidden">
       <svg ref={svgRef} className="w-full h-full"></svg>
       <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <Button onClick={() => handleZoom(1.2)} variant="outline" size="icon" aria-label="Acercar">
                <Plus className="h-4 w-4" />
            </Button>
            <Button onClick={() => handleZoom(0.8)} variant="outline" size="icon" aria-label="Alejar">
                <Minus className="h-4 w-4" />
            </Button>
            <Button onClick={handleResetZoom} variant="outline" size="icon" aria-label="Restablecer vista">
                <Focus className="h-4 w-4" />
            </Button>
             <Button onClick={downloadImage} variant="outline" size="icon" aria-label="Descargar PNG">
                <Download className="h-4 w-4" />
            </Button>
       </div>
    </Card>
  );
};


const GraphViewWrapper = () => (
    <GraphView />
);

export default GraphViewWrapper;

    
    