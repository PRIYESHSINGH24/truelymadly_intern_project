export interface AgentStep {
  tool: 'github_tool' | 'weather_tool';
  action: string;
  params: Record<string, any>;
}

export interface PlannerOutput {
  steps: AgentStep[];
}

export interface ExecutionResult {
  step: AgentStep;
  status: 'success' | 'error';
  data?: any;
  error?: string;
  timestamp: string;
}

export interface LogEntry {
  id: string;
  agent: 'User' | 'Planner' | 'Executor' | 'Verifier' | 'System';
  message: string;
  type: 'info' | 'success' | 'error' | 'json';
  data?: any;
  timestamp: Date;
}

export interface AppConfig {
  geminiApiKey: string;
  openWeatherApiKey: string;
  githubToken?: string; // Optional
}

export enum AppStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  VERIFYING = 'VERIFYING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}