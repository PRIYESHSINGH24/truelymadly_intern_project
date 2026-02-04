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

  const getAgentStyle = (agent: string) => {
    switch (agent) {
      case 'User':
        return 'text-zinc-300 bg-zinc-700/50 border-zinc-600/50';
      case 'Planner':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'Executor':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'Verifier':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'System':
        return 'text-zinc-400 bg-zinc-700/30 border-zinc-600/30';
      default:
        return 'text-zinc-400 bg-zinc-700/30 border-zinc-600/30';
    }
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'User':
        return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
      case 'Planner':
        return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
      case 'Executor':
        return 'M13 10V3L4 14h7v7l9-11h-7z';
      case 'Verifier':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'System':
        return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  const getMessageStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-zinc-300';
    }
  };

  return (
    <div className="terminal">
      <div className="terminal-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
        </div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-zinc-500 font-mono font-medium">Activity Log</span>
        </div>
        <span className="text-xs text-zinc-600 font-mono px-2 py-1 bg-zinc-800/50 rounded-md">{logs.length} entries</span>
      </div>

      <div className="p-5 h-80 overflow-y-auto font-mono text-sm">
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center text-zinc-600">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-zinc-500">No activity yet</p>
                <p className="text-xs text-zinc-600 mt-1">Run a task to see logs here</p>
              </div>
            </div>
          </div>
        )}

        {logs.map((log, index) => (
          <div key={log.id} className="mb-4 animate-slideUp" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="flex items-start gap-3">
              <span className="text-xs text-zinc-600 pt-1 tabular-nums shrink-0 font-medium">
                {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>

              <span className={`tag border ${getAgentStyle(log.agent)} flex items-center gap-1.5`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={getAgentIcon(log.agent)} />
                </svg>
                {log.agent}
              </span>

              <span className={`flex-1 pt-0.5 ${getMessageStyle(log.type)}`}>
                {log.type === 'success' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1.5 -mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {log.type === 'error' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1.5 -mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {log.message}
              </span>
            </div>

            {log.data && (
              <div className="mt-2 ml-20 pl-4 border-l-2 border-zinc-800 bg-black/20 rounded-r-lg py-2 pr-3">
                <pre className="text-xs text-zinc-500 whitespace-pre-wrap">
                  {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalOutput;
