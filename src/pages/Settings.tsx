import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    name: "John Doe",
    email: "john@example.com",
    openRouterKey: "",
    notifications: true,
    darkMode: false,
    dataCollection: true
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully."
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={settings.name}
                onChange={(e) => setSettings({...settings, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
              <Input 
                id="openrouter-key" 
                type="password"
                value={settings.openRouterKey}
                onChange={(e) => setSettings({...settings, openRouterKey: e.target.value})}
                placeholder="Enter your OpenRouter API key"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Push Notifications</Label>
              <Switch 
                id="notifications" 
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch 
                id="dark-mode" 
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="data-collection">Anonymous Data Collection</Label>
              <Switch 
                id="data-collection" 
                checked={settings.dataCollection}
                onCheckedChange={(checked) => setSettings({...settings, dataCollection: checked})}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 animate-glow">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;