import React, { useState } from 'react';

interface LabelTypeTooltipProps {
  text: string;
}

const LabelTypeTooltip: React.FC<LabelTypeTooltipProps> = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-flex">
      <div 
        className="border rounded-full flex w-5 h-5 justify-center items-center ml-2 cursor-help text-gray-500 text-xs"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        ?
      </div>
      
      {showTooltip && (
        <div className="absolute z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 w-48 bottom-8 left-1/2 transform -translate-x-1/2">
          {text}
        </div>
      )}
    </div>
  );
};

export default LabelTypeTooltip;