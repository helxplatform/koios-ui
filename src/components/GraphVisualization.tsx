import { useGraphResize } from "../hooks/useGraphResize";
import { ForceGraph3D, ForceGraph2D } from "react-force-graph";
import { FC, useEffect, useRef, useState, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import { link } from "fs";
import LabelTypeTooltip from "./LabelTypeTooltip";

interface Props {
  kg: any;
  id: string;
}

interface NodeType {
  category: string;
  color: string;
  count?: number;
}

interface LinkType {
  predicate: string;
  color: string;
  count?: number;
}

export const GraphVisualization: FC<Props> = ({ kg, id }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
    const [linkTypes, setLinkTypes] = useState<LinkType[]>([]);
    const [selectedNodeTypes, setSelectedNodeTypes] = useState<Set<string>>(new Set());
    const [selectedLinkTypes, setSelectedLinkTypes] = useState<Set<string>>(new Set());
    const [is3D, setIs3D] = useState(true);

    // Extract available types when kg changes
    useEffect(() => {
        if (!kg) return;

        // NODES
        const nodeColors = [
            '#1a568c',
            '#19961e',
            '#03A9F4',
            '#FF9800',
            '#9C27B0',
            '#F44336' 
        ];

        const nodeCategories = new Map<string, string>();
        const nodeCategoryCounts = new Map<string, number>();
        
        let nodeColorIndex = 0;
        kg.nodes.forEach((node: any) => {
            const category = node.category;
            nodeCategoryCounts.set(category, (nodeCategoryCounts.get(category) || 0) + 1);
            
            if (!nodeCategories.has(category)) {
                const color = nodeColors[nodeColorIndex % nodeColors.length];
                nodeCategories.set(category, color);
                nodeColorIndex++;
            }
            
            node.color = nodeCategories.get(category);
        });

        const newNodeTypes = Array.from(nodeCategories.entries())
            .map(([category, color]) => ({ 
                category, 
                color, 
                count: nodeCategoryCounts.get(category) || 0
            } as NodeType));


        // LINKS
        const linkColors = [
            '#E91E63',
            '#9C27B0',
            '#FF9800',
            '#FFEB3B',
            '#8BC34A',
            '#00BCD4' 
        ];

        const linkPredicates = new Map<string, string>();
        const linkCategoryCounts = new Map<string, number>();

        let linkColorIndex = 0;
        kg.links.forEach((link: any) => {
            const predicate = link.predicate;
            linkCategoryCounts.set(predicate, (linkCategoryCounts.get(predicate) || 0) + 1);
        
            if (!linkPredicates.has(predicate)) {
                const color = linkColors[linkColorIndex % linkColors.length];
                linkPredicates.set(predicate, color);
                linkColorIndex++;
            }
            
            link.color = linkPredicates.get(predicate);
        });

        const newLinkTypes = Array.from(linkPredicates.entries())
            .map(([predicate, color]) => ({ 
                predicate, 
                color,
                count: linkCategoryCounts.get(predicate) || 0
            } as LinkType));
    
        setNodeTypes(newNodeTypes);
        setLinkTypes(newLinkTypes);
        setSelectedNodeTypes(new Set(nodeCategories.keys()));
        setSelectedLinkTypes(new Set(linkPredicates.keys()));
    }, [kg]);
  

    const filteredGraphData = useMemo(() => {
        if (!kg) return { nodes: [], links: [] };
      
        // 1. Filter nodes based on selected node types
        const visibleNodes = kg.nodes.filter((node: any) => 
          selectedNodeTypes.has(node.category)
        );
        const visibleNodeIds = new Set(
          visibleNodes.map((n: any) => String(n.id))
        );
      
        // 2. Filter links to include only:
        //    - Selected link types
        //    - Links where BOTH source and target are visible
        const filteredLinks = kg.links.filter((link: any) => 
          selectedLinkTypes.has(link.predicate) &&
          visibleNodeIds.has(String(link.source)) &&
          visibleNodeIds.has(String(link.target))
        );
      
        // 3. Map link source/target IDs to node objects
        const nodeMap = new Map(
          visibleNodes.map((node: any) => [String(node.id), node])
        );
      
        // 4. Replace link IDs with node objects and filter invalid links
        const processedLinks = filteredLinks
          .map((link: any) => ({
            ...link,
            source: nodeMap.get(String(link.source)),
            target: nodeMap.get(String(link.target)),
          }))
          .filter((link: any) => link.source && link.target);
      
        return { 
          nodes: visibleNodes, 
          links: processedLinks 
        };
      }, [kg, selectedNodeTypes, selectedLinkTypes]);


    // Resize handler (unchanged)
    // Resize handler
    useEffect(() => {
        if (!containerRef.current) return;
        
        const updateSize = () => {
            if (!containerRef.current) return;
            const parent = containerRef.current.parentElement;
            if (!parent) return;
            
            setDimensions({
                width: parent.clientWidth - 32,
                height: parent.clientHeight - 100
            });
        };

        const resizeObserver = new ResizeObserver(updateSize);
        const parent = containerRef.current.parentElement;
        if (parent) {
            resizeObserver.observe(parent);
            updateSize();
        }

        return () => resizeObserver.disconnect();
    }, []);
    

    const toggleNodeType = (type: string) => {
        const newSelected = new Set(selectedNodeTypes);
        newSelected.has(type) ? newSelected.delete(type) : newSelected.add(type);
        setSelectedNodeTypes(newSelected);
    };

    const toggleLinkType = (type: string) => {
        const newSelected = new Set(selectedLinkTypes);
        newSelected.has(type) ? newSelected.delete(type) : newSelected.add(type);
        setSelectedLinkTypes(newSelected);
    };

    const generateDescription = (description) => {
        return description ? (description.length > 300 ? description.toLowerCase().slice(0, 300) + '...' : description.toLowerCase()) : ''
    }

    // Define a React component for your node label
    const NodeLabel = ({ node }) => (
        <div>
        <strong>{node.name}</strong>
        <div>{generateDescription(node.description)}</div>
        </div>
    );
    
    // Convert the React component to an HTML string
    const nodeLabel = (d) => {
        return ReactDOMServer.renderToString(<NodeLabel node={d} />);
    };

    const LinkLabel = ({ link }) => (
        <div>
        <div><strong>{link.source.name}</strong></div>
        <div>{generateDescription(link.source.description)}</div>
        <br />
        <div><em><strong>is {link.predicate}</strong></em></div>
        <br />
        <strong>{link.target.name}</strong>
        <div>{generateDescription(link.target.description)}</div>
        </div>
    ) 

    const linkLabel = (d) => {
        return ReactDOMServer.renderToString(<LinkLabel link={d} />);
    }

    const getContrastColor = (backgroundColor) => {
        // Remove # if present
        const hex = backgroundColor.replace('#', '');
        
        // Convert hex to RGB
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        
        // Calculate relative luminance using the WCAG formula
        // L = 0.2126 * R + 0.7152 * G + 0.0722 * B
        const linearize = (v) => {
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        
        const luminance = 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
        
        // Determine text color based on luminance
        // Using 0.5 as a threshold (WCAG recommends 0.55 for better contrast)
        return luminance > 0.5 ? "black" : "white";
      };

    return (
        <div 
            ref={containerRef}
            className="h-full w-full border-2 border-gray-200 rounded-lg bg-white p-4 flex flex-col relative"
        >
            {/* Graph Visualization (unchanged) */}
             {/* Graph Visualization */}
             <div className="flex-1">
                {dimensions.width > 0 && dimensions.height > 0 && (
                    is3D ? (
                    <ForceGraph3D
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={filteredGraphData}
                        backgroundColor="#ffffff"
                        nodeRelSize={6}
                        linkWidth={2}
                        nodeLabel={nodeLabel}
                        linkLabel={linkLabel}
                    />
                    ) : (
                    <ForceGraph2D
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={filteredGraphData}
                        backgroundColor="#ffffff"
                        nodeRelSize={6}
                        linkWidth={2}
                        nodeLabel={nodeLabel}
                        linkLabel={linkLabel}
                    />
                    )
                )}
            </div>
            
             {/* Updated Filters Section */}
             <div className="flex flex-row gap-4 mb-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-600 flex">
                        Node Filters
                        <LabelTypeTooltip text="Filter nodes by category. Click on a node category to disable and enable. Each number associated with a category denotes the number of times it is seen in the graph" />
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {nodeTypes.map(type => (
                            <button 
                                key={type.category + id}
                                onClick={() => toggleNodeType(type.category)}
                                style={{ 
                                    backgroundColor: selectedNodeTypes.has(type.category) 
                                        ? type.color 
                                        : '#f3f4f6',
                                    color: getContrastColor(selectedNodeTypes.has(type.category) ? type.color : '#f3f4f6')
                                }}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedNodeTypes.has(type.category) 
                                        ? 'text-white' 
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {type.category} {type.count && `(${type.count})`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-600 flex">
                        Link Filters
                        <LabelTypeTooltip text="Filter links by predicate. Click on a link predicate to disable and enable. Each number associated with a predicate denotes the number of times it is seen in the graph" />
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {linkTypes.map(type => (
                            <button
                                key={type.predicate + id }
                                onClick={() => toggleLinkType(type.predicate)}
                                style={{ 
                                    backgroundColor: selectedLinkTypes.has(type.predicate) 
                                        ? type.color
                                        : '#f3f4f6',
                                    color: getContrastColor(selectedLinkTypes.has(type.predicate) ? type.color : '#f3f4f6')
                                }}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedLinkTypes.has(type.predicate) 
                                        ? 'text-white' 
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {type.predicate} {type.count && `(${type.count})`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            {/* 3D Toggle */}
            {/* 3D Toggle */}
            <div className="absolute right-4 top-4 z-10"> 
                <div className="flex gap-1 rounded-lg bg-white shadow-lg border border-gray-200 p-1">
                    <button
                    onClick={() => setIs3D(false)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        !is3D 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    >
                    2D
                    </button>
                    <button
                    onClick={() => setIs3D(true)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        is3D 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    >
                    3D
                    </button>
                </div>
            </div>
        
        </div>
    );
};