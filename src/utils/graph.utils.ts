import { KnowledgeGraphData } from "../types/types";


export const processKnowledgeGraph = (kg: any): KnowledgeGraphData | null => {
    if (!kg) return null;
    
    return {
      links: kg.edges?.map((edge: any) => ({
        source: edge.subject,
        target: edge.object
      })) || [],
      nodes: kg.nodes?.map((node: any) => ({
        id: node.id,
        name: node.name
      })) || []
    };
  };