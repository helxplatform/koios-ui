import { useState, useRef, useEffect } from 'react';
import './App.css';
// import Placeholder from 'react-bootstrap/Placeholder';
import {
  Chat,
  ChatInput,
  Conversation,
  NewSessionButton,
  Session,
  SessionGroups,
  SessionMessagePanel,
  SessionMessages,
  SessionMessage,
  SessionMessagesHeader,
  SessionsList,
  MessageSources,
  MessageQuestion,
  MessageResponse,
  MessageActions,
} from 'reachat';
import { chatTheme } from './theme';
import { ForceGraph2D, ForceGraph3D } from 'react-force-graph';
import banner  from './banner.png';


interface ConversationExt extends Conversation {
  kg: any;
}
interface Session_ext extends Session {
  conversations: ConversationExt[];
}


function App() {

  const [activeId, setActiveId] = useState<string>();
  const [sessions, setSessions] = useState<Session_ext[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(sessions.length + 1);
  const [graphDimensions, setGraphDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const containerId = entry.target.getAttribute('data-container-id');
        if (containerId) {
          const newWidth = entry.contentRect.width;
          const newHeight = entry.contentRect.height;
          setGraphDimensions(prev => ({
            ...prev,
            [containerId]: { width: newWidth, height: newHeight }
          }));
        }
      });
    });
    resizeObserverRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
      resizeObserverRef.current = null;
    };
  }, []);

  const registerGraphContainer = (containerId: string, element: HTMLDivElement | null) => {
    if (element && resizeObserverRef.current) {
      resizeObserverRef.current.observe(element);
    }
  };
  

  const handleNewSession = () => {
    const newId = count.toLocaleString();
    setSessions([
      ...sessions,
      {
        id: newId,
        title: `Session #${newId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversations: []
      }
    ]);
    setActiveId(newId);
    setCount(count + 1);
  };

  const handleDelete = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions([...updated]);
  };

  
  const handleNewMessage = async (message: string) => {
    setLoading(true);
    const curr = sessions.find((s) => s.id === activeId);
    try {
      const chat_history = curr?.conversations.map(item => [item.question, item.response]);

      const response = await fetch('https://koios-kg.apps.renci.org/kg-app/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "input": {
            "input": message,            
            "chat_history": chat_history,
          },          
          "config": {},
          "kwargs": {}
        })
      });    
    
      


      const data = await response.json();
      const output = data.output.output;
      const knowledge_graph = data.output?.extra?.knowledge_graph;
      

      if (curr) {
        let new_kg = {};
        if (knowledge_graph) {
        const edges = knowledge_graph?.edges ?  knowledge_graph.edges.map(edge => ({"source": edge.subject , "target": edge.object})) : [];        
        const nodes = knowledge_graph?.nodes ? knowledge_graph.nodes.map(node => ({id: node.id, name: node.name})) : [];
        new_kg = {
          "links": edges,
          "nodes": nodes
        }
        }
        
        const newMessage: ConversationExt = {
          id: `${curr.id}-${curr.conversations.length}`,
          question: message,
          response: output,
          createdAt: new Date(),
          updatedAt: new Date(),
          kg: new_kg          
        };
        
        const updated = {
          ...curr,
          conversations: [...curr.conversations, newMessage],
        };
        setSessions([...sessions.filter((s) => s.id !== activeId), updated]);
      }
      
    } catch (error) {
          console.error('Error:', error);
    }
    
    setLoading(false);
  };  
 
  return (
    <div className="flex flex-col h-screen">
    <header className="bg-gray-50 border-b border-gray-200 py-4 px-4 shadow-sm">
        <div className="container mx-auto flex items-center gap-4">
          {/* Add your image here - update src to match your image path */}
          <img 
            src={banner}  // Replace with your image path
            alt="App Logo"
            className="h-25 w-100 rounded-lg"
          />
        </div>
      </header>


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
                </p>
              </div>
            }>
            {conversations => conversations.map((conversation, index) => {
              const ckg = conversation as ConversationExt;
              return (
                  <SessionMessage key={conversation.id} conversation={conversation} isLast={index === conversations.length - 1} >
                    <MessageQuestion
                      question={conversation.question}
                      files={conversation.files}
                    />
                  <div className="flex flex-row gap-4"> 
                    <div className="flex-1 space-y-4 overflow-hidden">
                        <div className="break-words overflow-wrap-anywhere">
                          <MessageResponse response={conversation.response || "No answer can be found"} />
                        </div>
                        <MessageSources sources={conversation.sources || []} />
                    </div>                    
                   { ckg.kg && (<div ref={(el) => registerGraphContainer(conversation.id + "force-graph", el)}
                      data-container-id={conversation.id + "force-graph"}
                      className="flex-1 min-w-[300px] h-[300px] border-2 border-gray-200 rounded-lg bg-white p-4">
                        <ForceGraph3D 
                          key={conversation.id + "force-graph"}
                          width={graphDimensions[conversation.id + "force-graph"]?.width || 0}
                          height={graphDimensions[conversation.id + "force-graph"]?.height || 0}
                          graphData={ckg.kg}
                          backgroundColor="#FFF"
                          nodeLabel="name"
                          nodeColor={() => '#1f77b4'}
                          linkColor={() => '#999'}
                        />
                    </div>)}
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full my-4" />
                  <MessageActions
                    question={conversation.question}
                    response={conversation.response}
                  />                               
                  </SessionMessage>
              )
            }
          )}
          </SessionMessages>
          <ChatInput />
        </SessionMessagePanel>        
      </Chat>      
    </div>
    <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4 text-sm">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="contact-us text-gray-700">
            <p className="leading-relaxed">
              For questions or feedback, please visit{" "}
              <a 
                href="http://link-to-google-form" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                [link to google form]
              </a>
              . For more information about the BioData Catalyst, please visit{" "}
              <a 
                href="https://biodatacatalyst.nhlbi.nih.gov/" 
                className="text-blue-600 hover:text-blue-800 underline break-words"
              >
                https://biodatacatalyst.nhlbi.nih.gov/
              </a>
              .
            </p>
          </div>          
          <div className="disclaimer-container">
            <p className="font-medium text-gray-800 mb-2">Disclaimer:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li className="leading-relaxed">
                The chatbot logs will be de-identified and preserved by the BioData Catalyst Study Chatbot Team for
                quality assurance purposes, though not shared with the public.
              </li>
              <li className="leading-relaxed">
                The chatbot is designed to answer queries about study abstracts and find studies that might be relevant
                to the user. Any queries outside of that core scope might result in inaccurate, erroneous, or fabricated
                responses due to design principles of the underlying LLM. Please exercise caution when executing such
                queries.
              </li>
              <li className="leading-relaxed">
                The chatbot does not have full implementation of content moderation guardrails, and therefore
                conversations outside of the abovementioned scope may result in uncouth or inappropriate responses.
              </li>
            </ul>
          </div>
        </div>
    </footer>
   </div>

    

  );
}

export default App;
