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

  const getAgentConfig = (agent: string) => {
    switch (agent) {
      case 'User':
        return { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'USR' };
      case 'Planner':
        return { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'PLN' };
      case 'Executor':
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'EXE' };
      case 'Verifier':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'VER' };
      case 'System':
        return { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/30', label: 'SYS' };
      default:
        return { color: 'text-white', bg: 'bg-white/10', border: 'border-white/30', label: '---' };
    }
  };

  const getLogTypeStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-300';
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-gray-300';
      case 'json':
        return 'text-blue-300';
    }
  };

  return (
    <div className="relative group">
      {/* Outer glow on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative glass-strong rounded-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer"></div>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">execution_log.sh</span>
          </div>

          <div className="text-[10px] font-mono text-gray-600">
            {logs.length > 0 ? `${logs.length} events` : 'waiting...'}
          </div>
        </div>

        {/* Terminal Content */}
        <div className="relative p-4 font-mono text-[13px] leading-relaxed h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {/* Scanlines overlay */}
          <div className="scanlines absolute inset-0 pointer-events-none opacity-30"></div>

          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-2xl border border-dashed border-gray-700 animate-pulse"></div>
              </div>
              <div className="text-center">
                <p className="text-gray-500 font-medium">Awaiting Command</p>
                <p className="text-gray-700 text-xs mt-1">Enter a task to begin execution</p>
              </div>
              <div className="flex items-center gap-1 text-gray-700 text-xs">
                <span className="animate-pulse">▊</span>
              </div>
            </div>
          )}

          {logs.map((log, index) => {
            const agentConfig = getAgentConfig(log.agent);

            return (
              <div
                key={log.id}
                className="mb-4 animate-slideUp group/log"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  {/* Timestamp */}
                  <div className="flex-shrink-0 pt-1">
                    <span className="text-[10px] text-gray-700 font-medium tabular-nums">
                      {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Agent badge */}
                  <div className="flex-shrink-0">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${agentConfig.bg} border ${agentConfig.border} transition-all group-hover/log:scale-105`}>
                      <span className={`text-[10px] font-bold tracking-wider uppercase ${agentConfig.color}`}>
                        [{agentConfig.label}]
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <div className={`${getLogTypeStyle(log.type)} leading-relaxed`}>
                      {log.type === 'success' && <span className="text-emerald-500 mr-2">✓</span>}
                      {log.type === 'error' && <span className="text-red-500 mr-2">✕</span>}
                      {log.message}
                    </div>

                    {/* Data expansion */}
                    {log.data && (
                      <div className="mt-2 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 to-purple-500/50 rounded-full"></div>
                        <div className="ml-3 p-3 rounded-lg bg-black/30 border border-white/5 overflow-x-auto group-hover/log:border-white/10 transition-colors">
                          <pre className="text-[11px] text-gray-500 whitespace-pre-wrap">
                            {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Blinking cursor at end */}
          {logs.length > 0 && (
            <div className="flex items-center gap-2 text-cyan-500 mt-2">
              <span className="text-gray-600">{'>'}</span>
              <span className="animate-pulse">▊</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-black/20 text-[10px] font-mono text-gray-600">
          <div className="flex items-center gap-4">
            <span>UTF-8</span>
            <span>•</span>
            <span>LF</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalOutput;
