import { Session_ext } from '../types/types';
import { useState, useEffect } from 'react';

// Keys used for storing data in localStorage
const STORAGE_KEY = 'chatbot_sessions';
const ACTIVE_ID_KEY = 'chatbot_active_session';

export const useSessions = () => {

  const loadInitialSessions = () => {
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions).map(session => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt)
        }));
        return parsedSessions;
      }
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
    }
    
    return [{
      id: '1',
      title: 'Chat 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      conversations: [],
    }];
  };

  const initialSessions = loadInitialSessions();
  const [sessions, setSessions] = useState<Session_ext[]>(initialSessions);
  
  const loadInitialActiveId = () => {
    try {
      const storedActiveId = localStorage.getItem(ACTIVE_ID_KEY);
      if (storedActiveId && initialSessions.some(session => session.id === storedActiveId)) {
        return storedActiveId;
      }
    } catch (error) {
      console.error('Error loading active session ID from localStorage:', error);
    }

    // Default to the first session if available, otherwise '1'
    return initialSessions[0]?.id || '1';
  };
  
  const [activeId, setActiveId] = useState<string>(loadInitialActiveId());
  const [count, setCount] = useState(() => {
    const maxId = Math.max(...initialSessions.map(s => parseInt(s.id)), 0);
    return maxId + 1;
  });

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions to localStorage:', error);
    }
  }, [sessions]);

  // Save activeId to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_ID_KEY, activeId);
    } catch (error) {
      console.error('Error saving active session ID to localStorage:', error);
    }
  }, [activeId]);

  const handleNewSession = () => {
    const newId = count.toString();
    setSessions(prev => [...prev, {
      id: newId,
      title: `Chat ${newId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      conversations: []
    }]);
    setActiveId(newId);
    setCount(c => c + 1);
    
    return newId;
  };

  const handleDelete = (id: string) => {
    setSessions(prev => {
      const updatedSessions = prev.filter(s => s.id !== id);
      if (id === activeId && updatedSessions.length > 0) {
        setActiveId(updatedSessions[0].id);
      }

      return updatedSessions;
    });
  };

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

  const clearAllSessions = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ID_KEY);
    
    setSessions([{
      id: '1',
      title: 'Chat 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      conversations: [],
    }]);
    setActiveId('1');
    setCount(2);
  };

  return { 
    sessions, 
    setSessions, 
    handleNewSession, 
    handleDelete, 
    activeId, 
    setActiveId, 
    handleDownloadSession,
    clearAllSessions 
  };
};