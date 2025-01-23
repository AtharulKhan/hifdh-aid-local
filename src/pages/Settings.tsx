import React from "react";
import { Card } from "@/components/ui/card";
import { ConfigurationSettings } from "@/components/settings/ConfigurationSettings";

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Settings
      </h1>
      
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <ConfigurationSettings />
        </Card>
      </div>
    </div>
  );
};

export default Settings;