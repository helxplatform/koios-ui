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
import { stringify } from 'node:querystring';


function App() {
  const { sessions, setSessions, handleNewSession, handleDelete, activeId, setActiveId} = useSessions();
  // const [activeId, setActiveId] = useState<string>();
  const [loading, setLoading] = useState(false); 


  const handleDownloadSession = () => {
    const activeSession = sessions.find(s => s.id === activeId);
    if (!activeSession) return;
    const sessionDate = activeSession.createdAt?.toISOString().split('T')[0];
    const data_to_download = activeSession.conversations.map(convo => ({
      user: convo.question,
      assistant: convo.response
    }));
    const dataStr = JSON.stringify(data_to_download, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${sessionDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  

  const handleNewMessage = async (message: string) => {
    setLoading(true);
    const newMessage: ConversationExt = {    
        id: 'error',    
        question: message,        
        createdAt: new Date(),
        updatedAt: new Date(),
        kg: null        
      };
    try {
      const curr = sessions.find(s => s.id === activeId);
      if (!curr) { setLoading(false);  return; }
      newMessage.id = curr.id + '-' + curr.conversations.length;
      
      const updated = {
        ...curr,
        conversations: [...curr.conversations, newMessage],
      };
      setSessions([...sessions.filter((s) => s.id !== activeId), updated]);

      const data = await sendChatMessage(message, curr.conversations.map(convo => [convo.question, convo.response]));
      const output = data.output.output;
      
      const knowledge_graph = data.output?.extra?.knowledge_graph;
      const processedKg = processKnowledgeGraph(knowledge_graph);

      newMessage.kg = processedKg;
      newMessage.response = output;
      setSessions([...sessions.filter((s) => s.id !== activeId), updated]);
      setLoading(false);      

    } catch (error) {
      console.error('Error:', error);
      newMessage.response = "An error occured!";
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
            <div className="flex gap-2 p-2">
              <NewSessionButton/>
              <button
                onClick={handleDownloadSession}
                disabled={!activeId}
                className="whitespace-no-wrap select-none items-center justify-center font-sans font-semibold disabled:cursor-not-allowed data-[variant=filled]:disabled:bg-gray-600 disabled:text-gray-400 flex w-full light:text-gray-100 border-primary text-base px-4 py-2 leading-[normal] m-0 relative mb-4 rounded-[10px] text-white bg-[#1a568c] hover:bg-[#41ABF5] transition-colors"
              >
                Export Chat
              </button>
            </div>
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
