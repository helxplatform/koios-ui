import { FC, useRef, useEffect } from 'react';
import { NewSessionButton } from 'reachat';

interface InterceptedNewSessionButtonProps {
  newSessionText?: string;
  confirmationMessage?: string;
}

export const InterceptedNewSessionButton: FC<InterceptedNewSessionButtonProps> = ({
  newSessionText = 'New Chat',
  confirmationMessage = 'Are you sure you want to start a new chat? All current messages will be cleared.'
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const buttonElement = buttonRef.current;
    
    if (!buttonElement) return;
    
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Show confirmation dialog
      if (window.confirm(confirmationMessage)) {
        const newClickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        buttonElement.removeEventListener('click', handleClick, true);
        
        e.target?.dispatchEvent(newClickEvent);
        
        setTimeout(() => {
          buttonElement.addEventListener('click', handleClick, true);
        }, 100);
      }
    };
    
    buttonElement.addEventListener('click', handleClick, true);
    
    // Cleanup
    return () => {
      buttonElement.removeEventListener('click', handleClick, true);
    };
  }, [confirmationMessage]);
  
  return (
    <div ref={buttonRef}>
      <NewSessionButton newSessionText={newSessionText} />
    </div>
  );
};