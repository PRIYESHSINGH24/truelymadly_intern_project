import React, { useState, useCallback, useEffect } from 'react';
import { AppConfig, AppStatus, LogEntry } from './types';
import { runPlanner, runExecutor, runVerifier } from './services/agents';
import SettingsModal from './components/SettingsModal';
import TerminalOutput from './components/TerminalOutput';
import ReactMarkdown from 'react-markdown';

const DEFAULT_CONFIG: AppConfig = {
  geminiApiKey: '',
  openWeatherApiKey: '',
  githubToken: ''
};

function App() {
  const [task, setTask] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('ai_ops_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [finalResult, setFinalResult] = useState<string | null>(null);

  // Show settings modal on first load if no API key is configured
  useEffect(() => {
    if (!config.geminiApiKey) {
      setShowSettings(true);
    }
  }, []);

  const addLog = useCallback((agent: LogEntry['agent'], message: string, type: LogEntry['type'] = 'info', data?: any) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      agent,
      message,
      type,
      data,
      timestamp: new Date()
    }]);
  }, []);

  const handleConfigSave = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('ai_ops_config', JSON.stringify(newConfig));
    addLog('System', 'Configuration updated.', 'success');
  };

  const runAgents = async () => {
    if (!task.trim()) return;
    if (!config.geminiApiKey) {
      setShowSettings(true);
      addLog('System', 'Gemini API Key is required to start.', 'error');
      return;
    }

    setFinalResult(null);
    setLogs([]); // Clear previous logs
    setStatus(AppStatus.PLANNING);
    
    addLog('User', `New Task: "${task}"`, 'info');

    try {
      // 1. Planner
      addLog('Planner', 'Analyzing task and generating plan...', 'info');
      const plan = await runPlanner(task, config);
      
      if (!plan.steps || plan.steps.length === 0) {
        throw new Error("Planner could not generate any valid steps for this task.");
      }

      addLog('Planner', `Plan generated with ${plan.steps.length} step(s).`, 'success', plan);
      
      // 2. Executor
      setStatus(AppStatus.EXECUTING);
      addLog('Executor', 'Starting execution of planned steps...', 'info');
      
      const executionResults = await runExecutor(plan, config, (res) => {
        if (res.status === 'success') {
          addLog('Executor', `Executed ${res.step.tool}.${res.step.action}`, 'success', res.data);
        } else {
          addLog('Executor', `Failed ${res.step.tool}.${res.step.action}`, 'error', res.error);
        }
      });

      // 3. Verifier
      setStatus(AppStatus.VERIFYING);
      addLog('Verifier', 'Reviewing execution results...', 'info');
      const finalResponse = await runVerifier(task, executionResults, config);
      
      setFinalResult(finalResponse);
      addLog('Verifier', 'Verification complete. Final response generated.', 'success');
      setStatus(AppStatus.COMPLETED);

    } catch (error: any) {
      console.error(error);
      addLog('System', `Process failed: ${error.message}`, 'error');
      setStatus(AppStatus.ERROR);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case AppStatus.IDLE: return 'bg-gray-700';
      case AppStatus.PLANNING: return 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]';
      case AppStatus.EXECUTING: return 'bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]';
      case AppStatus.VERIFYING: return 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]';
      case AppStatus.COMPLETED: return 'bg-emerald-500';
      case AppStatus.ERROR: return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    }
  };

  return (
    <div className="min-h-screen text-gray-200 p-4 md:p-8 flex flex-col items-center selection:bg-indigo-500/30">
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        config={config} 
        onSave={handleConfigSave} 
      />

      <div className="w-full max-w-5xl space-y-8">
        {/* Header & Status */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                AI Ops Assistant
              </span>
            </h1>
            <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
               <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
               Multi-Agent Orchestrator
               <span className="text-gray-600">|</span>
               <span className="font-mono text-xs opacity-70">Planner • Executor • Verifier</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
             {/* Status Pill */}
            <div className={`px-4 py-2 rounded-full border border-gray-800 bg-[#0c0c0c]/80 backdrop-blur flex items-center gap-3 transition-all ${status !== AppStatus.IDLE ? 'border-gray-700 shadow-lg' : ''}`}>
               <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${getStatusColor()}`}></div>
               <span className="text-xs font-bold tracking-wider text-gray-300 uppercase">{status}</span>
            </div>

            <button 
                onClick={() => setShowSettings(true)}
                className="p-2.5 bg-[#0c0c0c]/80 hover:bg-gray-800/80 border border-gray-800 rounded-full text-gray-400 hover:text-white transition-all hover:scale-105 active:scale-95 group relative"
                aria-label="Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {!config.geminiApiKey && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-6">
            
            {/* Input Area - Command Palette Style */}
            <div className="relative group z-10">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 ${status !== AppStatus.IDLE ? 'opacity-0' : ''}`}></div>
                <div className="relative flex items-center bg-[#0e1014] rounded-xl border border-gray-800 shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                    <div className="pl-4 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        className="w-full bg-transparent border-none p-5 text-lg text-white placeholder-gray-500 focus:outline-none font-medium"
                        placeholder="Describe your task naturally..."
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && status !== AppStatus.PLANNING && status !== AppStatus.EXECUTING && status !== AppStatus.VERIFYING && runAgents()}
                        disabled={status !== AppStatus.IDLE && status !== AppStatus.ERROR && status !== AppStatus.COMPLETED}
                    />
                    <div className="pr-2">
                         <button 
                            onClick={runAgents}
                            disabled={status !== AppStatus.IDLE && status !== AppStatus.ERROR && status !== AppStatus.COMPLETED}
                            className="bg-gray-800 hover:bg-white hover:text-black text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                        >
                            <span>RUN</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Terminal View */}
            <TerminalOutput logs={logs} />
            
            {/* Final Result Card - Glassmorphism */}
            {finalResult && (
            <div className="relative animate-slideUp">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-[#0c0c0c]/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4 flex items-center gap-2">
                    <span className="text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </span>
                    Mission Accomplished
                    </h2>
                    
                    <div className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 font-light leading-relaxed">
                        <ReactMarkdown 
                            components={{
                                code({node, inline, className, children, ...props}: any) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline ? (
                                    <div className="bg-black/50 rounded-lg p-4 border border-gray-800 my-4 shadow-inner">
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </div>
                                    ) : (
                                    <code className="bg-gray-800 text-blue-200 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700" {...props}>
                                        {children}
                                    </code>
                                    )
                                }
                            }}
                        >
                            {finalResult}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
            )}
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500 pt-10 border-t border-gray-800/50 mt-12">
           <div className="space-y-3">
             <strong className="text-gray-300 font-medium tracking-wide text-xs uppercase block mb-2">System Architecture</strong>
             <ul className="space-y-2">
               <li className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                   <span className="text-gray-400">Planner:</span> 
                   <span className="text-gray-300 font-mono text-xs bg-gray-800/50 px-2 py-0.5 rounded">Gemini 3 Flash</span>
               </li>
               <li className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                   <span className="text-gray-400">Executor:</span> 
                   <span className="text-gray-300 font-mono text-xs bg-gray-800/50 px-2 py-0.5 rounded">Tools (GitHub/Weather)</span>
               </li>
               <li className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                   <span className="text-gray-400">Verifier:</span> 
                   <span className="text-gray-300 font-mono text-xs bg-gray-800/50 px-2 py-0.5 rounded">Gemini 3 Flash</span>
               </li>
             </ul>
           </div>
           <div className="space-y-3">
             <strong className="text-gray-300 font-medium tracking-wide text-xs uppercase block mb-2">Operational Status</strong>
             <div className="flex gap-4">
                 <div className="bg-[#0c0c0c] border border-gray-800 rounded-lg p-3 flex-1">
                    <div className="text-xs text-gray-500 mb-1">GitHub API</div>
                    <div className="text-green-400 font-mono text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        Active
                    </div>
                 </div>
                 <div className="bg-[#0c0c0c] border border-gray-800 rounded-lg p-3 flex-1">
                    <div className="text-xs text-gray-500 mb-1">Weather API</div>
                    <div className="text-green-400 font-mono text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        Active
                    </div>
                 </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default App;