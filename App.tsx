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
    addLog('System', 'Configuration saved.', 'success');
  };

  const runAgents = async () => {
    if (!task.trim()) return;
    if (!config.geminiApiKey) {
      setShowSettings(true);
      addLog('System', 'API key required.', 'error');
      return;
    }

    setFinalResult(null);
    setLogs([]);
    setStatus(AppStatus.PLANNING);
    addLog('User', `Task: "${task}"`, 'info');

    try {
      addLog('Planner', 'Analyzing task...', 'info');
      const plan = await runPlanner(task, config);

      if (!plan.steps || plan.steps.length === 0) {
        throw new Error("No valid steps for this task.");
      }

      addLog('Planner', `Generated ${plan.steps.length} step(s).`, 'success', plan);
      setStatus(AppStatus.EXECUTING);
      addLog('Executor', 'Running steps...', 'info');

      const executionResults = await runExecutor(plan, config, (res) => {
        if (res.status === 'success') {
          addLog('Executor', `Completed: ${res.step.tool}.${res.step.action}`, 'success', res.data);
        } else {
          addLog('Executor', `Failed: ${res.step.tool}.${res.step.action}`, 'error', res.error);
        }
      });

      setStatus(AppStatus.VERIFYING);
      addLog('Verifier', 'Synthesizing results...', 'info');
      const finalResponse = await runVerifier(task, executionResults, config);

      setFinalResult(finalResponse);
      addLog('Verifier', 'Complete.', 'success');
      setStatus(AppStatus.COMPLETED);

    } catch (error: any) {
      console.error(error);
      addLog('System', `Error: ${error.message}`, 'error');
      setStatus(AppStatus.ERROR);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case AppStatus.IDLE:
        return { color: 'bg-zinc-600', text: 'Ready' };
      case AppStatus.PLANNING:
        return { color: 'bg-orange-500', text: 'Planning' };
      case AppStatus.EXECUTING:
        return { color: 'bg-amber-500', text: 'Executing' };
      case AppStatus.VERIFYING:
        return { color: 'bg-blue-500', text: 'Verifying' };
      case AppStatus.COMPLETED:
        return { color: 'bg-emerald-500', text: 'Done' };
      case AppStatus.ERROR:
        return { color: 'bg-red-500', text: 'Error' };
    }
  };

  const statusInfo = getStatusInfo();
  const isProcessing = status === AppStatus.PLANNING || status === AppStatus.EXECUTING || status === AppStatus.VERIFYING;

  return (
    <div className="min-h-screen p-6 md:p-12">
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onSave={handleConfigSave}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text tracking-tight">
                AI Ops Assistant
              </h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                Multi-agent task orchestrator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status */}
            <div className="card-solid px-5 py-2.5 flex items-center gap-3">
              <div className={`status-dot ${statusInfo.color} ${isProcessing ? 'active' : ''}`} style={{ color: isProcessing ? '#f97316' : undefined }}></div>
              <span className="text-sm text-zinc-300 font-medium">{statusInfo.text}</span>
            </div>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="card-solid p-3 text-zinc-400 hover:text-orange-400 transition-all hover:shadow-lg hover:shadow-orange-500/10 relative group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!config.geminiApiKey && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        {/* Input */}
        <div className="card-solid p-2 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="pl-4 text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="flex-1 bg-transparent px-2 py-3.5 text-white placeholder-zinc-500 text-base focus:outline-none"
              placeholder="What do you want to do?"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isProcessing && runAgents()}
              disabled={isProcessing}
            />
            <button
              onClick={runAgents}
              disabled={isProcessing}
              className="btn-primary px-7 py-3.5 text-white flex items-center gap-2 font-semibold"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Running</span>
                </>
              ) : (
                <>
                  <span>Run Task</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Agent Pipeline */}
        <div className="flex items-center justify-center gap-4 animate-slideUp">
          {[
            { name: 'Planner', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', active: status === AppStatus.PLANNING, color: 'orange' },
            { name: 'Executor', icon: 'M13 10V3L4 14h7v7l9-11h-7z', active: status === AppStatus.EXECUTING, color: 'amber' },
            { name: 'Verifier', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', active: status === AppStatus.VERIFYING, color: 'blue' },
          ].map((agent, index) => (
            <React.Fragment key={agent.name}>
              {index > 0 && (
                <div className="w-8 h-px bg-gradient-to-r from-zinc-700 to-zinc-800"></div>
              )}
              <div
                className={`agent-pill flex items-center gap-3 ${
                  agent.active
                    ? `bg-${agent.color}-500/20 text-${agent.color}-400 border-${agent.color}-500/40 active`
                    : 'bg-zinc-800/50 text-zinc-500'
                }`}
              >
                {agent.active && (
                  <span className={`w-2 h-2 bg-${agent.color}-500 rounded-full animate-pulse`}></span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={agent.icon} />
                </svg>
                <span className="font-medium">{agent.name}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Terminal */}
        <div className="animate-slideUp">
          <TerminalOutput logs={logs} />
        </div>

        {/* Result */}
        {finalResult && (
          <div className="result-card card-solid overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-zinc-800/50 flex items-center gap-4 bg-gradient-to-r from-emerald-500/10 to-transparent">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-white text-lg">Task Complete</span>
                <p className="text-sm text-zinc-500">AI generated response</p>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}: any) {
                      return !inline ? (
                        <pre className="bg-black/50 rounded-xl p-5 border border-zinc-800/50 overflow-x-auto">
                          <code className={`${className} text-orange-300 font-mono text-sm`} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-md text-sm font-mono" {...props}>
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

        {/* Footer */}
        <footer className="pt-10 border-t border-zinc-800/30 animate-slideUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
                <span>Powered by Gemini</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <span>GitHub + Weather APIs</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-600 font-mono px-3 py-1 bg-zinc-800/50 rounded-full">v1.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
