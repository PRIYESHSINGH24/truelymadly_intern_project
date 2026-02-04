import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#0f1115] border border-gray-800 p-8 rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center">
                <span className="bg-blue-500/10 text-blue-400 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                </span>
                Configuration
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        <div className="space-y-5">
          <div className="group">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Gemini API Key <span className="text-red-400">*</span></label>
            <input
              type="password"
              value={localConfig.geminiApiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, geminiApiKey: e.target.value })}
              className="w-full bg-[#050608] border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm shadow-inner"
              placeholder="AIza..."
            />
          </div>
          <div className="group">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider group-focus-within:text-yellow-400 transition-colors">OpenWeather API Key <span className="text-red-400">*</span></label>
            <input
              type="password"
              value={localConfig.openWeatherApiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, openWeatherApiKey: e.target.value })}
              className="w-full bg-[#050608] border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all font-mono text-sm shadow-inner"
              placeholder="OpenWeather API Key"
            />
          </div>
          <div className="group">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider group-focus-within:text-purple-400 transition-colors">GitHub Token</label>
            <input
              type="password"
              value={localConfig.githubToken || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, githubToken: e.target.value })}
              className="w-full bg-[#050608] border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm shadow-inner"
              placeholder="ghp_..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-800/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(localConfig);
              onClose();
            }}
            className="px-6 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;