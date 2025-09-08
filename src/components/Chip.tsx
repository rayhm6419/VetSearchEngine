import React from 'react';

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function Chip({ selected, onClick, children }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-full border px-3 py-1 text-sm cursor-pointer transition-colors duration-200
        ${selected 
          ? 'bg-black text-white border-black' 
          : 'hover:bg-gray-50'
        }
      `}
    >
      {children}
    </button>
  );
}
