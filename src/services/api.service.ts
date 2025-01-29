export const sendChatMessage = async (message: string, chatHistory: any[]) => {
    const response = await fetch('https://koios-kg.apps.renci.org/kg-app/invoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: {
          input: message,            
          chat_history: chatHistory,
        },          
        config: {},
        kwargs: {}
      })
    });
    return response.json();
  };