import React from 'react';

type Settings = {
  vapiApiKey?: string;
  vapiAssistantId?: string;
};

const SettingsContext = React.createContext<{
  settings: Settings;
  updateSettings: (settings: Settings) => void;
}>({
  settings: {},
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<Settings>(() => {
    const storedSettings = localStorage.getItem('vapi-settings');
    return storedSettings ? JSON.parse(storedSettings) : {};
  });

  const updateSettings = (newSettings: Settings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('vapi-settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => React.useContext(SettingsContext);