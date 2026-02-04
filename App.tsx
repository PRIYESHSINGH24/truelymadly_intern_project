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
    setLogs([]);
    setStatus(AppStatus.PLANNING);

    addLog('User', `New Task: "${task}"`, 'info');

    try {
      addLog('Planner', 'Analyzing task and generating plan...', 'info');
      const plan = await runPlanner(task, config);

      if (!plan.steps || plan.steps.length === 0) {
        throw new Error("Planner could not generate any valid steps for this task.");
      }

      addLog('Planner', `Plan generated with ${plan.steps.length} step(s).`, 'success', plan);

      setStatus(AppStatus.EXECUTING);
      addLog('Executor', 'Starting execution of planned steps...', 'info');

      const executionResults = await runExecutor(plan, config, (res) => {
        if (res.status === 'success') {
          addLog('Executor', `Executed ${res.step.tool}.${res.step.action}`, 'success', res.data);
        } else {
          addLog('Executor', `Failed ${res.step.tool}.${res.step.action}`, 'error', res.error);
        }
      });

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

  const getStatusConfig = () => {
    switch (status) {
      case AppStatus.IDLE:
        return { color: 'bg-gray-600', glow: '', text: 'STANDBY', icon: '○' };
      case AppStatus.PLANNING:
        return { color: 'bg-cyan-400', glow: 'shadow-[0_0_20px_rgba(0,212,255,0.6)]', text: 'PLANNING', icon: '◐' };
      case AppStatus.EXECUTING:
        return { color: 'bg-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]', text: 'EXECUTING', icon: '◑' };
      case AppStatus.VERIFYING:
        return { color: 'bg-violet-400', glow: 'shadow-[0_0_20px_rgba(167,139,250,0.6)]', text: 'VERIFYING', icon: '◒' };
      case AppStatus.COMPLETED:
        return { color: 'bg-emerald-400', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.6)]', text: 'COMPLETE', icon: '●' };
      case AppStatus.ERROR:
        return { color: 'bg-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]', text: 'ERROR', icon: '✕' };
    }
  };

  const statusConfig = getStatusConfig();
  const isProcessing = status === AppStatus.PLANNING || status === AppStatus.EXECUTING || status === AppStatus.VERIFYING;

  return (
    <div className="min-h-screen text-gray-200 p-4 md:p-8 flex flex-col items-center relative z-10">
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onSave={handleConfigSave}
      />

      {/* Floating orbs background decoration */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-5xl space-y-8 relative">

        {/* Hero Header */}
        <header className="text-center py-8 animate-slideDown">
          {/* Logo/Brand */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center ${isProcessing ? 'animate-pulse' : ''} shadow-lg shadow-blue-500/25`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {isProcessing && (
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50 animate-ping"></div>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 animate-gradient bg-[length:200%_auto]">
              AI OPS
            </span>
            <span className="text-white ml-3">ASSISTANT</span>
          </h1>

          {/* Subtitle with typing effect */}
          <p className="text-gray-400 text-lg font-light tracking-wide">
            <span className="text-cyan-400 font-mono">{'>'}</span> Multi-Agent AI Orchestrator
            <span className="mx-3 text-gray-600">|</span>
            <span className="font-mono text-sm text-gray-500">Planner • Executor • Verifier</span>
          </p>

          {/* Settings & Status Row */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Status Indicator */}
            <div className={`glass px-6 py-3 rounded-full flex items-center gap-3 transition-all duration-500 ${statusConfig.glow}`}>
              <div className={`w-3 h-3 rounded-full ${statusConfig.color} ${isProcessing ? 'animate-pulse' : ''}`}></div>
              <span className="font-mono text-sm font-bold tracking-widest text-gray-300">{statusConfig.text}</span>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="glass hover-glow p-3 rounded-full text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:scale-110 active:scale-95 group relative"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!config.geminiApiKey && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[8px] font-bold">!</span>
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8">

          {/* Command Input - Cyber Style */}
          <div className="relative group animate-slideUp" style={{animationDelay: '0.1s'}}>
            {/* Animated gradient border */}
            <div className={`absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm ${isProcessing ? 'animate-pulse opacity-50' : ''}`}></div>

            <div className="relative glass-strong rounded-2xl overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">command_input</span>
                <div className="w-12"></div>
              </div>

              {/* Input area */}
              <div className="flex items-center p-2">
                <div className="pl-4 pr-2 text-cyan-500 font-mono font-bold text-lg animate-pulse">{'>'}</div>
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none p-4 text-lg text-white placeholder-gray-600 focus:outline-none font-medium tracking-wide"
                  placeholder="Describe your mission..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isProcessing && runAgents()}
                  disabled={isProcessing}
                />
                <button
                  onClick={runAgents}
                  disabled={isProcessing}
                  className="btn-cyber mr-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:shadow-none hover:scale-105 active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>PROCESSING</span>
                    </>
                  ) : (
                    <>
                      <span>EXECUTE</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Agent Status Cards */}
          <div className="grid grid-cols-3 gap-4 animate-slideUp" style={{animationDelay: '0.2s'}}>
            {[
              { name: 'PLANNER', status: status === AppStatus.PLANNING, color: 'cyan', desc: 'AI Analysis', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )},
              { name: 'EXECUTOR', status: status === AppStatus.EXECUTING, color: 'amber', desc: 'Tool Runner', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )},
              { name: 'VERIFIER', status: status === AppStatus.VERIFYING, color: 'violet', desc: 'Result Synthesis', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
            ].map((agent, i) => (
              <div
                key={agent.name}
                className={`glass rounded-xl p-4 text-center transition-all duration-500 card-lift ${agent.status ? `ring-2 ring-${agent.color}-400/50 shadow-lg shadow-${agent.color}-500/20` : ''}`}
              >
                <div className={`flex justify-center mb-2 ${agent.status ? `text-${agent.color}-400 animate-pulse` : 'text-gray-500'}`}>{agent.icon}</div>
                <div className={`font-mono text-xs font-bold tracking-widest ${agent.status ? `text-${agent.color}-400` : 'text-gray-500'}`}>
                  {agent.name}
                </div>
                <div className="text-[10px] text-gray-600 mt-1">{agent.desc}</div>
                {agent.status && (
                  <div className={`mt-2 h-1 rounded-full bg-gradient-to-r from-${agent.color}-500 to-${agent.color}-300 animate-pulse`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Terminal View */}
          <div className="animate-slideUp" style={{animationDelay: '0.3s'}}>
            <TerminalOutput logs={logs} />
          </div>

          {/* Final Result Card */}
          {finalResult && (
            <div className="relative animate-slideUp">
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl"></div>

              <div className="relative glass-strong rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-white/5 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Mission Complete</h2>
                      <p className="text-sm text-gray-400">Verified and synthesized by AI</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 leading-relaxed">
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          return !inline ? (
                            <div className="bg-black/40 rounded-xl p-4 border border-white/5 my-4 overflow-x-auto">
                              <code className={`${className} text-cyan-300 font-mono text-sm`} {...props}>
                                {children}
                              </code>
                            </div>
                          ) : (
                            <code className="bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-md text-sm font-mono border border-cyan-500/20" {...props}>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="glass rounded-2xl p-6 mt-12 animate-slideUp" style={{animationDelay: '0.4s'}}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Architecture */}
            <div>
              <h3 className="font-mono text-xs font-bold text-cyan-400 tracking-widest mb-4">SYSTEM ARCHITECTURE</h3>
              <div className="space-y-2">
                {[
                  { label: 'Planner', value: 'Gemini 2.0 Flash', color: 'blue' },
                  { label: 'Executor', value: 'Tool Chain', color: 'yellow' },
                  { label: 'Verifier', value: 'Gemini 2.0 Flash', color: 'emerald' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full bg-${item.color}-500`}></span>
                    <span className="text-gray-500">{item.label}:</span>
                    <span className="font-mono text-xs text-gray-400">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Tools */}
            <div>
              <h3 className="font-mono text-xs font-bold text-purple-400 tracking-widest mb-4">AVAILABLE TOOLS</h3>
              <div className="flex flex-wrap gap-2">
                {['GitHub Search', 'Weather API'].map(tool => (
                  <span key={tool} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="font-mono text-xs font-bold text-emerald-400 tracking-widest mb-4">OPERATIONAL STATUS</h3>
              <div className="flex gap-3">
                {[
                  { name: 'GitHub', active: true },
                  { name: 'Weather', active: true },
                ].map(api => (
                  <div key={api.name} className="glass rounded-lg px-4 py-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${api.active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`}></span>
                    <span className="text-xs font-mono text-gray-400">{api.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-gray-600">
            <span className="font-mono">v1.0.0</span>
            <span>•</span>
            <span>Powered by Google Gemini</span>
            <span>•</span>
            <span className="text-cyan-500/50">Built with React + TypeScript</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
