import { useGraphResize } from "../hooks/useGraphResize";
import { ForceGraph3D } from "react-force-graph";
import { FC, useEffect, useRef, useState, useMemo } from 'react';

interface Props {
  kg: any;
  id: string;
}

interface NodeType {
  category: string;
  color: string;
}

interface LinkType {
  predicate: string;
  color: string;
}

export const GraphVisualization: FC<Props> = ({ kg, id }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
    const [linkTypes, setLinkTypes] = useState<LinkType[]>([]);
    const [selectedNodeTypes, setSelectedNodeTypes] = useState<Set<string>>(new Set());
    const [selectedLinkTypes, setSelectedLinkTypes] = useState<Set<string>>(new Set());

    // Extract available types when kg changes
    useEffect(() => {
        if (!kg) return;
    
        // Calculate dominant colors for node categories
        const nodeColorCounts = kg.nodes.reduce((acc: Map<string, Map<string, number>>, node: any) => {
            const category = node.category;
            const color = node.node_color.hex;
            if (!acc.has(category)) {
                acc.set(category, new Map());
            }
            const colorMap = acc.get(category)!;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
            return acc;
        }, new Map<string, Map<string, number>>());
    
        const nodeCategories = new Map<string, string>();
        nodeColorCounts.forEach((colorMap, category) => {
            let maxCount = -1;
            let dominantColor = '';
            colorMap.forEach((count, color) => {
                if (count > maxCount) {
                    maxCount = count;
                    dominantColor = color;
                }
            });
            nodeCategories.set(category, dominantColor);
        });
    
        const newNodeTypes = Array.from(nodeCategories.entries())
            .map(([category, color]) => ({ category, color } as NodeType));
    
        // Calculate dominant colors for link predicates
        const linkColorCounts = kg.links.reduce((acc: Map<string, Map<string, number>>, link: any) => {
            const predicate = link.predicate;
            const color = link.edge_color.hex;
            if (!acc.has(predicate)) {
                acc.set(predicate, new Map());
            }
            const colorMap = acc.get(predicate)!;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
            return acc;
        }, new Map<string, Map<string, number>>());
    
        const linkPredicates = new Map<string, string>();
        linkColorCounts.forEach((colorMap, predicate) => {
            let maxCount = -1;
            let dominantColor = '';
            colorMap.forEach((count, color) => {
                if (count > maxCount) {
                    maxCount = count;
                    dominantColor = color;
                }
            });
            linkPredicates.set(predicate, dominantColor);
        });
    
        const newLinkTypes = Array.from(linkPredicates.entries())
            .map(([predicate, color]) => ({ predicate, color } as LinkType));
    
        setNodeTypes(newNodeTypes);
        setLinkTypes(newLinkTypes);
        setSelectedNodeTypes(new Set(nodeCategories.keys()));
        setSelectedLinkTypes(new Set(linkPredicates.keys()));
    }, [kg]);

    // useEffect(() => {
    //     if (!kg) return;

    //     // Extract unique node categories with their colors
    //     const nodeCategories = kg.nodes.reduce((acc: Map<string, string>, node: any) => {
    //         if (!acc.has(node.category)) {
    //             acc.set(node.category, node.node_color);
    //         }
    //         return acc;
    //     }, new Map<string, string>());

    //     const newNodeTypes = Array.from(nodeCategories.entries() as IterableIterator<[string, string]>)
    //         .map(([category, color]) => ({ category, color } as NodeType));

    //     // Extract unique link predicates with their colors
    //     const linkPredicates = kg.links.reduce((acc: Map<string, string>, link: any) => {
    //         if (!acc.has(link.predicate)) {
    //             acc.set(link.predicate, link.edge_color);
    //         }
    //         return acc;
    //     }, new Map<string, string>());

    //     const newLinkTypes = Array.from(linkPredicates.entries() as IterableIterator<[string, string]>)
    //         .map(([predicate, color]) => ({ predicate, color } as LinkType));

    //     setNodeTypes(newNodeTypes);
    //     setLinkTypes(newLinkTypes);
    //     setSelectedNodeTypes(new Set(nodeCategories.keys()));
    //     setSelectedLinkTypes(new Set(linkPredicates.keys()));
    // }, [kg]);

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

    return (
        <div 
            ref={containerRef}
            className="h-full w-full border-2 border-gray-200 rounded-lg bg-white p-4 flex flex-col"
        >
            {/* Graph Visualization (unchanged) */}
             {/* Graph Visualization */}
             <div className="flex-1">
                {dimensions.width > 0 && dimensions.height > 0 && (
                    <ForceGraph3D 
                        
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={filteredGraphData}
                        backgroundColor="#ffffff"
                        nodeRelSize={6}
                        linkWidth={2}
                        nodeLabel="name"
                        nodeAutoColorBy={d => d.node_color.rgb}
                        linkAutoColorBy={d => d.edge_color.rgb}
                    />
                )}
            </div>

            {/* Updated Filters Section */}
             {/* Updated Filters Section */}
             <div className="flex flex-row gap-4 mb-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-600">Node Filters</h3>
                    <div className="flex flex-wrap gap-2">
                        {nodeTypes.map(type => (
                            <button 

                                key={type.category + id}
                                onClick={() => toggleNodeType(type.category)}
                                style={{ 
                                    backgroundColor: selectedNodeTypes.has(type.category) 
                                        ? type.color 
                                        : '#f3f4f6' 
                                }}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedNodeTypes.has(type.category) 
                                        ? 'text-white' 
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {type.category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-600">Link Filters</h3>
                    <div className="flex flex-wrap gap-2">
                        {linkTypes.map(type => (
                            <button
                                key={type.predicate + id }
                                onClick={() => toggleLinkType(type.predicate)}
                                style={{ 
                                    backgroundColor: selectedLinkTypes.has(type.predicate) 
                                        ? type.color 
                                        : '#f3f4f6' 
                                }}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedLinkTypes.has(type.predicate) 
                                        ? 'text-white' 
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {type.predicate}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};