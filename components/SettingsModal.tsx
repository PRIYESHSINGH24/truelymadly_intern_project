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
      description: 'Required for AI-powered planning and verification'
    },
    {
      key: 'openWeatherApiKey',
      label: 'OpenWeather API Key',
      placeholder: 'Your OpenWeather key...',
      required: false,
      description: 'Optional - enables weather queries'
    },
    {
      key: 'githubToken',
      label: 'GitHub Token',
      placeholder: 'ghp_...',
      required: false,
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

      {/* Decorative gradients */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-orange-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Modal */}
      <div
        className="relative w-full max-w-md animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-[22px] opacity-40 blur-sm"></div>

        <div className="relative card-solid overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-zinc-800/50 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-transparent to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <p className="text-sm text-zinc-500">Configure your API keys</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {fields.map((field, index) => (
              <div key={field.key} className="space-y-3 animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <label className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
                  <div className={`w-2 h-2 rounded-full ${field.required ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-zinc-600'}`}></div>
                  {field.label}
                  {field.required && <span className="text-orange-500 text-xs font-medium px-2 py-0.5 bg-orange-500/10 rounded-full">Required</span>}
                </label>

                <div className="relative group">
                  <input
                    type="password"
                    value={(localConfig as any)[field.key] || ''}
                    onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.value })}
                    className="w-full input-field px-4 py-3.5 text-white placeholder-zinc-600 font-mono text-sm"
                    placeholder={field.placeholder}
                  />

                  {(localConfig as any)[field.key] && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-500 pl-1">{field.description}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-zinc-800/50 bg-black/30 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors font-medium rounded-xl hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(localConfig);
                onClose();
              }}
              className="btn-primary px-6 py-2.5 text-sm text-white font-semibold flex items-center gap-2"
            >
              <span>Save Changes</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
