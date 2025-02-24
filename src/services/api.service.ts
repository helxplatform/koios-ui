// api.service.ts 
export const sendChatMessage = async (
  message: string,
  chatHistory: string[],
  apiUrl: string = 'https://search-dev.biodatacatalyst.renci.org/agent/invoke'
) => {
  try {
    // Clean and filter chat history
    const cleanedHistory = chatHistory
      .filter(msg => msg && typeof msg === 'string')
      .map(msg => {
        let cleaned = msg.replace(/```[\s\S]*?```/g, '');
 
        cleaned = cleaned.replace(/<[^>]*>/g, '');
        cleaned = cleaned.replace(/\{[^}]*\}/g, '');
        cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
        cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');     // Italic
        cleaned = cleaned.replace(/\[(.*?)\]\((.*?)\)/g, '$1'); // Links
        cleaned = cleaned.trim().replace(/\s+/g, ' ');     
        return cleaned;
      })
      .filter(msg => msg.trim()); // Remove empty messages
    
    console.log('Sending chat history:', cleanedHistory);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          input: [{
            content: message,
            additional_kwargs: {},
            response_metadata: {},
            type: "human",
            name: "user",
            id: `msg_${Date.now()}`
          }],
          next: "",
          chat_history: cleanedHistory,
          extra: {}
        },
        config: {
          configurable: {
            checkpoint_id: "",
            checkpoint_ns: "",
            thread_id: `thread_${Date.now()}`
          }
        },
        kwargs: {}
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('API Error Response:', errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    let aiContent = '';
    if (data.input && Array.isArray(data.input)) {
      const aiMessage = data.input.find(msg => 
        (msg.type === 'ai' || (msg.type === 'human' && msg.name !== 'user')) && 
        msg.content && 
        typeof msg.content === 'string'
      );
      aiContent = aiMessage?.content || "No response received";
    } else {
      aiContent = "Unexpected response format";
    }
    
    return {
      output: {
        output: aiContent,
        extra: {
          knowledge_graph: data.extra?.knowledge_graph || null
        }
      }
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};