import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalOutputProps {
  logs: LogEntry[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'User': return 'text-purple-400 font-bold';
      case 'Planner': return 'text-blue-400 font-bold';
      case 'Executor': return 'text-yellow-400 font-bold';
      case 'Verifier': return 'text-emerald-400 font-bold';
      case 'System': return 'text-gray-500 font-bold';
      default: return 'text-white';
    }
  };

  const getLogTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'info': return '•';
        case 'json': return '{ }';
    }
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800/60 bg-[#0c0c0c] backdrop-blur-sm ring-1 ring-white/5">
      {/* Terminal Header */}
      <div className="bg-gray-900/80 border-b border-gray-800/50 p-3 flex items-center justify-between backdrop-blur-md">
         <div className="flex space-x-2">
           <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors shadow-sm"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors shadow-sm"></div>
           <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors shadow-sm"></div>
         </div>
         <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest opacity-60">execution_log.sh</div>
         <div className="w-10"></div> {/* Spacer for optical centering */}
      </div>

      {/* Terminal Content */}
      <div className="p-5 font-mono text-[13px] leading-relaxed h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-3 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Ready to process command...</p>
          </div>
        )}
        
        {logs.map((log) => (
          <div key={log.id} className="mb-3 animate-slideUp group">
            <div className="flex items-start">
                <span className="text-gray-700 mr-3 text-[10px] pt-1 select-none font-medium">
                    {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                
                <div className="flex-1">
                    <div className="flex items-baseline">
                        <span className={`tracking-wide text-xs mr-3 ${getAgentColor(log.agent)}`}>
                            {log.agent}
                        </span>
                        <span className={`flex-1 ${log.type === 'error' ? 'text-red-400/90' : log.type === 'success' ? 'text-emerald-300/90' : 'text-gray-300/90'}`}>
                           {log.message}
                        </span>
                    </div>

                    {log.data && (
                        <div className="mt-2 ml-1 relative group-hover:block">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-800 rounded-full"></div>
                            <div className="pl-3 py-2 bg-gray-900/40 rounded-r-md border-l-2 border-transparent hover:border-gray-700 transition-colors overflow-x-auto">
                                <pre className="text-[11px] text-gray-400 font-medium">
                                    {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalOutput;