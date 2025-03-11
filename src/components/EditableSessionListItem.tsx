import React, { FC, useState, useRef, useEffect, useContext } from 'react';
import { ChatContext, SessionListItem, SessionListItemProps } from 'reachat';
import { IconButton } from 'reablocks';

interface EditableSessionListItemProps extends Omit<SessionListItemProps, 'children' | 'deleteIcon' | 'chatIcon'> {
  /**
   * Optional callback when session title is updated
   */
  onUpdateTitle?: (sessionId: string, newTitle: string) => void;
  
  /**
   * The session object
   */
  session: any; // Using any instead of Session since we're not importing the type
}

export const EditableSessionListItem: FC<EditableSessionListItemProps> = ({
  session,
  limit = 100,
  onUpdateTitle
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { deleteSession, selectSession, activeSessionId } = useContext(ChatContext);

  // Initialize edit value when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditValue(session.title);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, session.title]);

  // Handle click based on whether this session is already active
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (session.id === activeSessionId) {
      // If already selected, enter edit mode
      setIsEditing(true);
    } else if (selectSession) {
      // If not selected, select this session
      selectSession(session.id);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== session.title && editValue.trim() !== '') {
      // Call the callback with the updated title
      if (onUpdateTitle) {
        onUpdateTitle(session.id, editValue);
      }
    }
    // No need to reset anything as we'll re-read from session.title next time
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // No need to reset title - just exit edit mode
      setIsEditing(false);
    }
  };

  return (
    <SessionListItem
      session={session}
      limit={limit}
    >
      <div className="flex flex-1 items-center justify-between">
        <IconButton
          size="small"
          variant="text"
          onClick={e => {
            e.stopPropagation();
            handleClick(e);
          }}
        >
          <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 3C4.55375 3 1.75 5.23753 1.75 7.98828C1.75 9.70653 2.83659 11.2762 4.62109 12.188C4.11184 13.0465 3.62587 13.7378 3.62012 13.7461C3.50687 13.9071 3.49862 14.1196 3.59912 14.2891C3.69012 14.4418 3.8543 14.5342 4.0293 14.5342C4.0483 14.5342 4.06743 14.533 4.08643 14.5308C4.15168 14.5233 5.66214 14.3364 7.50439 12.9604C7.67239 12.9712 7.8385 12.9766 8 12.9766C11.4462 12.9766 14.25 10.739 14.25 7.98828C14.25 5.23753 11.4462 3 8 3ZM8 4C10.8948 4 13.25 5.78903 13.25 7.98828C13.25 10.1875 10.8948 11.9766 8 11.9766C7.8055 11.9766 7.60225 11.968 7.396 11.9497C7.271 11.9382 7.1454 11.9752 7.0459 12.0527C6.3589 12.5855 5.72033 12.9308 5.20508 13.1528C5.38383 12.8648 5.57691 12.5418 5.76416 12.2061C5.83416 12.0813 5.84705 11.9324 5.7998 11.7974C5.75255 11.6624 5.64983 11.5542 5.51758 11.5C3.81033 10.7993 2.75 9.45328 2.75 7.98828C2.75 5.78903 5.10525 4 8 4ZM5.5 7.25C5.08575 7.25 4.75 7.58575 4.75 8C4.75 8.41425 5.08575 8.75 5.5 8.75C5.91425 8.75 6.25 8.41425 6.25 8C6.25 7.58575 5.91425 7.25 5.5 7.25ZM8 7.25C7.58575 7.25 7.25 7.58575 7.25 8C7.25 8.41425 7.58575 8.75 8 8.75C8.41425 8.75 8.75 8.41425 8.75 8C8.75 7.58575 8.41425 7.25 8 7.25ZM10.5 7.25C10.0857 7.25 9.75 7.58575 9.75 8C9.75 8.41425 10.0857 8.75 10.5 8.75C10.9143 8.75 11.25 8.41425 11.25 8C11.25 7.58575 10.9143 7.25 10.5 7.25Z"
              fill="currentColor" />
          </svg>
        </IconButton>

        <div 
          className="flex-1 min-w-0 cursor-pointer" 
          onClick={handleClick}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none dark:bg-gray-800"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate block">{session.title}</span>
          )}
        </div>
        <IconButton
          size="small"
          variant="text"
          onClick={e => {
            e.stopPropagation();
            if (deleteSession) {
              deleteSession(session.id);
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Delete">
              <path id="Vector"
                d="M5.97905 1.16666C5.90859 1.16576 5.83895 1.18189 5.77605 1.21368C5.71316 1.24547 5.65888 1.29199 5.61783 1.34926C5.57677 1.40654 5.55016 1.47288 5.54025 1.54265C5.53034 1.61242 5.53743 1.68355 5.56092 1.75H4.27007C3.7342 1.75 3.2324 2.01817 2.93535 2.46435L2.24492 3.5H2.18738C2.12941 3.49918 2.07185 3.50989 2.01805 3.5315C1.96425 3.55312 1.91529 3.58522 1.874 3.62593C1.83271 3.66663 1.79993 3.71514 1.77755 3.76863C1.75518 3.82211 1.74365 3.87952 1.74365 3.9375C1.74365 3.99548 1.75518 4.05288 1.77755 4.10636C1.79993 4.15985 1.83271 4.20836 1.874 4.24907C1.91529 4.28977 1.96425 4.32187 2.01805 4.34349C2.07185 4.3651 2.12941 4.37582 2.18738 4.375H2.41012C2.44765 4.38067 2.48576 4.38143 2.52348 4.37727L3.24468 11.1084C3.33169 11.9199 4.02367 12.5417 4.83973 12.5417H9.15947C9.97553 12.5417 10.6675 11.9199 10.7545 11.1084L11.4763 4.37727C11.5133 4.38124 11.5506 4.38047 11.5874 4.375H11.8124C11.8704 4.37582 11.9279 4.3651 11.9817 4.34349C12.0355 4.32187 12.0845 4.28977 12.1258 4.24907C12.1671 4.20836 12.1998 4.15985 12.2222 4.10636C12.2446 4.05288 12.2561 3.99548 12.2561 3.9375C12.2561 3.87952 12.2446 3.82211 12.2222 3.76863C12.1998 3.71514 12.1671 3.66663 12.1258 3.62593C12.0845 3.58522 12.0355 3.55312 11.9817 3.5315C11.9279 3.50989 11.8704 3.49918 11.8124 3.5H11.7548L11.0644 2.46435C10.7671 2.01841 10.2654 1.75 9.7297 1.75H8.43885C8.46234 1.68355 8.46943 1.61242 8.45952 1.54265C8.44961 1.47288 8.423 1.40654 8.38194 1.34926C8.34089 1.29199 8.2866 1.24547 8.22371 1.21368C8.16082 1.18189 8.09118 1.16576 8.02072 1.16666H5.97905ZM4.27007 2.625H9.7297C9.97394 2.625 10.2009 2.74639 10.3364 2.9497L10.7033 3.5H3.29651L3.66338 2.9497L3.66395 2.94913C3.79913 2.74608 4.02543 2.625 4.27007 2.625ZM3.40361 4.375H10.5962L9.88465 11.015C9.8445 11.3894 9.53575 11.6667 9.15947 11.6667H4.83973C4.46345 11.6667 4.15527 11.3894 4.11512 11.015L3.40361 4.375Z"
                fill="currentColor" />
            </g>
          </svg>
        </IconButton>
      </div>
    </SessionListItem>
  );
};