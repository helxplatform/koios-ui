export const sendChatMessage = async (message: string, chatHistory: any[], apiUrl: string) => {
    // @TODO find some way to make these configurable on run time
    // https://koios-llama.apps.renci.org/dug-qa/
    // https://koios-kg.apps.renci.org/kg-app/invoke

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          input: message,            
          next: "start",
          chat_history: chatHistory,
          extra: {}
        },
        config: {
          configurable: {
            checkpoint_id: "",
            checkpoint_ns: "",
            // @TODO check if this could tied with the session (?)
            thread_id: `thread_${Date.now()}`
          }
        },
        kwargs: {}
      })
    });
    return response.json();
  };