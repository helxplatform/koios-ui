export const sendChatMessage = async (message: string, chatHistory: any[]) => {
    // @TODO find some way to make these configurable on run time
    // https://koios-llama.apps.renci.org/dug-qa/
    // https://koios-kg.apps.renci.org/kg-app/invoke
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