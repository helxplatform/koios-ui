import { KnowledgeGraphData } from "../types/types";


/**
 * Generates a consistent random color based on a string input.
 * Uses a simple hashing function to ensure the same string always produces the same color.
 * @param str - Input string to generate color from
 * @param saturation - Color saturation (0-1), defaults to 0.7
 * @param lightness - Color lightness (0-1), defaults to 0.5
 * @returns HSL color string
 */
function stringToColor(str: string): { rgb: string, hex: string } {
    // Generate a hash from the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Convert hash to hue (0-360)
    const hue = hash % 360;

    // Convert hash to RGB values
    const r = Math.floor((Math.sin(hash) * 0.5 + 0.5) * 255);
    const g = Math.floor((Math.cos(hash) * 0.5 + 0.5) * 255);
    const b = Math.floor((Math.tan(hash) * 0.5 + 0.5) * 255);

    // Convert RGB to hex
    const hex = `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;

    // Return both RGB and Hex values
    return {
        rgb: `rgb(${r}, ${g}, ${b})`,        
        hex: "#1a568c",
    };
}



export const processKnowledgeGraph = (kg: any): KnowledgeGraphData | null => {
    if (!kg) return null;
    
    const finalkg =  {
      links: kg.edges?.map((edge: any) => ({
        source: edge.subject,
        target: edge.object,
        predicate: edge.predicate,
        edge_color: stringToColor(edge.predicate)
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