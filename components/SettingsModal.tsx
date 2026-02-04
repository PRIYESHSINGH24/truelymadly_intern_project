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

  const fields = [
    {
      key: 'geminiApiKey',
      label: 'Gemini API Key',
      placeholder: 'AIza...',
      required: true,
      color: 'cyan',
      icon: '🤖',
      description: 'Required for AI-powered planning and verification'
    },
    {
      key: 'openWeatherApiKey',
      label: 'OpenWeather API Key',
      placeholder: 'Your OpenWeather key...',
      required: false,
      color: 'amber',
      icon: '🌤️',
      description: 'Optional - enables weather queries'
    },
    {
      key: 'githubToken',
      label: 'GitHub Token',
      placeholder: 'ghp_...',
      required: false,
      color: 'purple',
      icon: '🐙',
      description: 'Optional - enables GitHub repository search'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Modal */}
      <div
        className="relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-50 blur-sm animate-pulse"></div>

        <div className="relative glass-strong rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/5 p-6">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Configuration</h2>
                  <p className="text-sm text-gray-400">Set up your API credentials</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all hover:rotate-90 duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {fields.map((field, index) => (
              <div
                key={field.key}
                className="group animate-slideUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{field.icon}</span>
                  <label className={`text-xs font-bold uppercase tracking-wider text-${field.color}-400`}>
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={(localConfig as any)[field.key] || ''}
                    onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.value })}
                    className={`w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-${field.color}-500/50 focus:ring-2 focus:ring-${field.color}-500/20 transition-all font-mono text-sm group-hover:border-white/20`}
                    placeholder={field.placeholder}
                  />

                  {/* Status indicator */}
                  {(localConfig as any)[field.key] && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className={`w-2 h-2 rounded-full bg-${field.color}-400 inline-block`}></span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-gray-600 mt-1.5 ml-1">{field.description}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-black/20">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[11px] text-gray-600">
                <span className="text-red-400">*</span> Required field
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors font-medium rounded-lg hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onSave(localConfig);
                    onClose();
                  }}
                  className="btn-cyber px-6 py-2.5 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Save Configuration</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
