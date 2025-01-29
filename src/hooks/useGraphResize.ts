// hooks/useGraphResize.ts
import { useState, useEffect, useCallback } from 'react';

export const useGraphResize = () => {
    const [graphDimensions, setGraphDimensions] = useState<Record<string, { width: number; height: number }>>({});

    const registerGraphContainer = useCallback((id: string, el: HTMLElement | null) => {
        if (!el) return;

        const updateDimensions = () => {
            const rect = el.getBoundingClientRect();
            const newWidth = rect.width;
            const newHeight = rect.height;
            
            setGraphDimensions(prev => {
                if (prev[id]?.width === newWidth && prev[id]?.height === newHeight) {
                    return prev;
                }
                return {
                    ...prev,
                    [id]: { width: newWidth, height: newHeight }
                };
            });
        };

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(updateDimensions);
        });

        resizeObserver.observe(el);
        updateDimensions();

        return () => {
            resizeObserver.disconnect();
            setGraphDimensions(prev => {
                const newDims = { ...prev };
                delete newDims[id];
                return newDims;
            });
        };
    }, []);

    return { graphDimensions, registerGraphContainer };
};