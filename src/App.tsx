import { useState, useEffect } from 'react';
import './App.css';
// import Placeholder from 'react-bootstrap/Placeholder';

import { useSessions } from './hooks/useSessions';
import { sendChatMessage } from './services/api.service';
import { processKnowledgeGraph } from './utils/graph.utils';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SessionMessageCustom } from './components/SessionMessage';
import { ConversationExt } from './types/types';
import { findDbGaPIds } from './utils/formatting.util';

import {
  Chat,
  ChatInput,
  NewSessionButton,
  SessionGroups,
  SessionMessagePanel,
  SessionMessages,
  SessionMessagesHeader,
  SessionsList,
  ConversationSource
} from 'reachat';
import { chatTheme } from './theme';
import { LoadingScreen, ErrorScreen } from './components/Screen';


function App() {
  const { sessions, setSessions, handleNewSession, handleDelete, activeId, setActiveId, handleDownloadSession} = useSessions();
  // const [activeId, setActiveId] = useState<string>();
  const [loading, setLoading] = useState(false);     

  const [config, setConfig] = useState<{ apiUrl: string } | null>(null);

  // Load app config .... 
  const [configLoading, setConfigLoading] = useState(true);


  useEffect(() => {
    // Dynamically resolve config.json path based on deployment location
    const basePath = window.location.origin + window.location.pathname;
    const configUrl = new URL('config.json', basePath).href;
    fetch(configUrl)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load config');
        return response.json();
      })
      .then(data => {
        // Validate configuration structure
        if (!data.apiUrl) {
          throw new Error('Invalid config: Missing apiUrl');
        }
        setConfig(data);
        setConfigLoading(false);
      })
      .catch(error => {
        console.error('Error loading config:', error);
        setConfigLoading(false);
      });
  }, []);

  if (configLoading) {
    return (<LoadingScreen/>);
  }

  if (!config) {
    return (<ErrorScreen/>)
  }



  const handleNewMessage = async (message: string) => {    
    setLoading(true);

    const newMessage: ConversationExt = {    
        id: 'error',    
        question: message,        
        createdAt: new Date(),
        updatedAt: new Date(),
        kg: null , 
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

      const data = await sendChatMessage(message, curr.conversations.map(convo => [convo.question, convo.response]), config.apiUrl);
      const output = data.output.output;

      const accession_ids = findDbGaPIds(output);
      
      const sources:ConversationSource[] = accession_ids.phs?.map(study_id => ({
        id: study_id,
        url: "https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=" + study_id,
        title: study_id
      }))
      
      const knowledge_graph = data.output?.extra?.knowledge_graph;
      const processedKg = processKnowledgeGraph(knowledge_graph);

      newMessage.kg = processedKg;
      newMessage.response = output;
      newMessage.sources = sources;
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
      <div className="flex flex-col gap-2 p-2">  {/* Changed to column layout */}
            <NewSessionButton
              newSessionText="New Chat"
             />
            {activeId &&
              <button
                onClick={handleDownloadSession}                
                className="whitespace-no-wrap select-none items-center justify-center font-sans font-semibold disabled:cursor-not-allowed data-[variant=filled]:disabled:bg-gray-600 disabled:text-gray-400 flex w-full light:text-gray-100 border-primary text-base px-4 py-2 leading-[normal] m-0 relative mb-4 rounded-[10px] text-white bg-[#1a568c] hover:bg-[#41ABF5] transition-colors"
              >
               Export Chat
          </button>}
          </div>
        <SessionGroups />
      </SessionsList> 
        <SessionMessagePanel>
          <SessionMessagesHeader />
          <SessionMessages newSessionContent={
            <div className="flex flex-col gap-2 items-center justify-center h-full">                
                <p className="text-gray-500 max-w-[400px] text-center">
                  Please use "+ New Chat" button to start a new Chat.
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
          {activeId && <ChatInput            
          placeholder='"What studies are available on asthma and COPD?" '/>}
        </SessionMessagePanel>        
      </Chat>      
    </div>
    <Footer />
   </div>

    

  );
}

export default App;
