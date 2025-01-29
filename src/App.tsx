import { useState, useRef, useEffect } from 'react';
import './App.css';
// import Placeholder from 'react-bootstrap/Placeholder';

import { useSessions } from './hooks/useSessions';
import { useGraphResize } from './hooks/useGraphResize';
import { sendChatMessage } from './services/api.service';
import { processKnowledgeGraph } from './utils/graph.utils';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SessionMessageCustom } from './components/SessionMessage';
import { ConversationExt } from './types/types';

import {
  Chat,
  ChatInput,
  NewSessionButton,
  SessionGroups,
  SessionMessagePanel,
  SessionMessages,
  SessionMessagesHeader,
  SessionsList,
} from 'reachat';
import { chatTheme } from './theme';


function App() {
  const { sessions, setSessions, handleNewSession, handleDelete, activeId, setActiveId} = useSessions();
  // const [activeId, setActiveId] = useState<string>();
  const [loading, setLoading] = useState(false); 
  

  const handleNewMessage = async (message: string) => {
    setLoading(true);
    try {
      const curr = sessions.find(s => s.id === activeId);
      if (!curr) { setLoading(false);  return; }

      const data = await sendChatMessage(message, curr.conversations);
      const output = data.output.output;

      // In handleNewMessage
      const knowledge_graph = data.output?.extra?.knowledge_graph;
      const processedKg = processKnowledgeGraph(knowledge_graph);

      const newMessage: ConversationExt = {
        id: `${curr.id}-${curr.conversations.length}`,
        question: message,
        response: output,
        createdAt: new Date(),
        updatedAt: new Date(),
        kg: processedKg
      };

      const updated = {
        ...curr,
        conversations: [...curr.conversations, newMessage],
      };
      setSessions([...sessions.filter((s) => s.id !== activeId), updated]);

      console.log(sessions);
      
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };
 
  return (
    <div className="flex flex-col h-screen">
    <Header/>
    <div className="flex-1 p-2 main-container">
      <Chat
        sessions={sessions}
        activeSessionId={activeId}
        isLoading={loading}
        onNewSession={handleNewSession}
        onSelectSession={setActiveId}
        onDeleteSession={handleDelete}
        onSendMessage={handleNewMessage}
        theme={chatTheme}
      >
        <SessionsList>
          <NewSessionButton/>
          <SessionGroups />
        </SessionsList>
        <SessionMessagePanel>
          <SessionMessagesHeader />
          <SessionMessages newSessionContent={
            <div className="flex flex-col gap-2 items-center justify-center h-full">                
                <p className="text-gray-500 max-w-[400px] text-center">
                  Please create a session to begin chatting.
                </p>
              </div>
            }>
              {conversations => conversations.map((conversation) => (
                <SessionMessageCustom 
                  key={conversation.id} 
                  conversation={conversation as ConversationExt}
                />
              ))}
          </SessionMessages>
          <ChatInput />
        </SessionMessagePanel>        
      </Chat>      
    </div>
    <Footer />
   </div>

    

  );
}

export default App;
