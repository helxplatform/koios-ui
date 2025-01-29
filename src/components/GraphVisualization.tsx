import { useGraphResize } from "../hooks/useGraphResize";
import { ForceGraph3D } from "react-force-graph";
import { FC, useEffect, useRef, useState } from 'react';

interface Props {
  kg: any;
  id: string;
}

export const GraphVisualization: FC<Props> = ({ kg, id }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    useEffect(() => {
        if (!containerRef.current) return;
        
        const updateSize = () => {
            if (!containerRef.current) return;
            const parent = containerRef.current.parentElement;
            if (!parent) return;
            
            setDimensions({
                width: parent.clientWidth - 32, // subtract padding
                height: parent.clientHeight - 32 // subtract padding
            });
        };

        const resizeObserver = new ResizeObserver(updateSize);
        const parent = containerRef.current.parentElement;
        if (parent) {
            resizeObserver.observe(parent);
            updateSize(); // Initial size
        }

        return () => resizeObserver.disconnect();
    }, []);    

    return (
        <div 
            ref={containerRef}
            className="h-full w-full border-2 border-gray-200 rounded-lg bg-white p-4"
        >
            {dimensions.width > 0 && dimensions.height > 0 && (
                <ForceGraph3D 
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={kg}
                    backgroundColor="#ffffff"
                    nodeRelSize={6}
                    linkWidth={2}
                    nodeLabel="name"
                    nodeAutoColorBy={d => d.node_color}
                />
            )}
        </div>
    );
};