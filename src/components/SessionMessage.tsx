import { 
    MessageQuestion,
    MessageSources,
    MessageResponse,
    MessageActions,
    SessionMessage,
    Conversation

 } from 'reachat';
import { GraphVisualization } from './GraphVisualization';
import { ConversationExt } from '../types/types';
// components/SessionMessage.tsx
import { FC } from 'react';

interface Props {
  conversation: ConversationExt;
  isLast?: boolean; // Add any other props you need
}

export const SessionMessageCustom: FC<Props> = ({ conversation, isLast }) => {
    return (
    <SessionMessage key={conversation.id} conversation={conversation as Conversation} isLast={isLast}>      
      <MessageQuestion
                      question={conversation.question}
                      files={conversation.files}
        />
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 w-full">
        <div className='flex-1'>
            {conversation.response === undefined ? (
            <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            ) : (
            <>
                <div className="break-words overflow-wrap-anywhere">
                <MessageResponse response={conversation.response || "No answer can be found"} />
                </div>
                <MessageSources sources={conversation.sources || []} />
            </>
            )}
        </div>
    
        {conversation.kg && 
            <div className="flex-1 min-w-[300px] h-[450px]">
            <GraphVisualization kg={conversation.kg} id={conversation.id}  
            />
            </div>}
    </div>
        
        <MessageActions
            question={conversation.question}
            response={conversation.response}
        />                               
      </div>
    
    </SessionMessage>);
}
