

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

  return { sessions, setSessions, handleNewSession, handleDelete , activeId , setActiveId};
};