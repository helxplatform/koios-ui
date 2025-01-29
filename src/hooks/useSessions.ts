

import { Session_ext } from '../types/types';
import { useState } from 'react';

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session_ext[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [count, setCount] = useState(1);

  const handleNewSession = () => {
    const newId = count.toString();
    setSessions(prev => [...prev, {
      id: newId,
      title: `Session #${newId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      conversations: []
    }]);
    setActiveId(newId);
    setCount(c => c + 1);
    
    return newId;
  };

  const handleDelete = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (sessions.length > 0) {
        setActiveId(sessions[0].id)
    }
    
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

  return { sessions, setSessions, handleNewSession, handleDelete , activeId , setActiveId , handleDownloadSession };
};