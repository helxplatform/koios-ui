import { KnowledgeGraphData } from "../types/types";


/**
 * Generates a consistent random color based on a string input.
 * Uses a simple hashing function to ensure the same string always produces the same color.
 * @param str - Input string to generate color from
 * @param saturation - Color saturation (0-1), defaults to 0.7
 * @param lightness - Color lightness (0-1), defaults to 0.5
 * @returns HSL color string
 */
function stringToColor(str: string, saturation: number = 0.4, lightness: number = 0.8): string {
    // Generate a hash from the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert hash to hue (0-360)
    const hue = hash % 360;

    // Return HSL color string
    return `hsl(${hue}, ${Math.floor(saturation * 100)}%, ${Math.floor(lightness * 100)}%)`;
}






export const processKnowledgeGraph = (kg: any): KnowledgeGraphData | null => {
    if (!kg) return null;
    
    const finalkg =  {
      links: kg.edges?.map((edge: any) => ({
        source: edge.subject,
        target: edge.object,
        predicate: edge.predicate
      })) || [],
      nodes: kg.nodes?.map((node: any) => ({
        id: node.id,
        name: node.name,
        description: node.description,
        category: node.category?.length ? node.category[0] : "biolink:NamedThing",
        node_color: stringToColor(node.category?.length ? node.category[0] : "biolink:NamedThing")
      })) || []
    };
    return finalkg 
  };