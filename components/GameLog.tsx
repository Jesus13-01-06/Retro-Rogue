import React from 'react';

export const GameLog: React.FC<{ logs: string[] }> = ({ logs }) => {
  return (
    <div className="mt-4 w-full h-32 md:h-40 bg-gray-950 border-2 border-gray-800 p-2 overflow-y-auto font-mono text-lg rounded shadow-inner">
      {logs.map((log, idx) => (
        <div key={idx} className={`mb-1 ${idx === 0 ? 'text-white font-bold' : 'text-gray-500'}`}>
          {idx === 0 ? '> ' : ''}{log}
        </div>
      ))}
    </div>
  );
};
