
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Save } from "lucide-react";

export interface ReviewSettings {
  rmvPages: number; // Recently Memorized Pages (default 7)
  omvJuz: number; // Old Memorize Juz count (default 1)
  listeningJuz: number; // Listening cycle Juz count (default 2)
  readingJuz: number; // Reading cycle Juz count (default 1)
  currentJuz: number; // Current Juz being worked on
  startDate: string; // Start date for cycle calculations
}

export const ReviewSettings = () => {
  const [settings, setSettings] = useState<ReviewSettings>({
    rmvPages: 7,
    omvJuz: 1,
    listeningJuz: 2,
    readingJuz: 1,
    currentJuz: 1,
    startDate: new Date().toISOString().split('T')[0]
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('murajah-review-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('murajah-review-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const updateSetting = (key: keyof ReviewSettings, value: number | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Review Cycle Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Configure your smart review cycles. These settings determine how your daily review tasks are generated based on spaced repetition principles.
          </p>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Cycle Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Start Date Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700">Start Date</Badge>
              <Label className="text-base font-semibold">Cycle Start Date</Label>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date for Cycle Calculations</Label>
              <Input
                id="startDate"
                type="date"
                value={settings.startDate}
                onChange={(e) => updateSetting('startDate', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">All cycle rotations will be calculated from this date</p>
            </div>
          </div>

          {/* RMV Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">RMV</Badge>
              <Label className="text-base font-semibold">Recent Memorization Review</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rmvPages">Pages to Review (Last X pages memorized)</Label>
                <Input
                  id="rmvPages"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.rmvPages}
                  onChange={(e) => updateSetting('rmvPages', parseInt(e.target.value) || 7)}
                />
                <p className="text-sm text-gray-500 mt-1">Default: 7 pages</p>
              </div>
              <div>
                <Label htmlFor="currentJuz">Current Juz Being Worked On</Label>
                <Input
                  id="currentJuz"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.currentJuz}
                  onChange={(e) => updateSetting('currentJuz', parseInt(e.target.value) || 1)}
                />
                <p className="text-sm text-gray-500 mt-1">Used to calculate recent pages</p>
              </div>
            </div>
          </div>

          {/* OMV Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700">OMV</Badge>
              <Label className="text-base font-semibold">Old Memorization Review</Label>
            </div>
            <div>
              <Label htmlFor="omvJuz">Number of Juz to Review</Label>
              <Input
                id="omvJuz"
                type="number"
                min="1"
                max="5"
                value={settings.omvJuz}
                onChange={(e) => updateSetting('omvJuz', parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-gray-500 mt-1">How many old Juz to review in each cycle</p>
            </div>
          </div>

          {/* Listening Cycle Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">Listening</Badge>
              <Label className="text-base font-semibold">Listening Cycle</Label>
            </div>
            <div>
              <Label htmlFor="listeningJuz">Number of Juz for Listening</Label>
              <Input
                id="listeningJuz"
                type="number"
                min="1"
                max="10"
                value={settings.listeningJuz}
                onChange={(e) => updateSetting('listeningJuz', parseInt(e.target.value) || 2)}
              />
              <p className="text-sm text-gray-500 mt-1">Dedicated listening practice for Tajweed and pronunciation</p>
            </div>
          </div>

          {/* Reading Cycle Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700">Reading</Badge>
              <Label className="text-base font-semibold">Reading Cycle</Label>
            </div>
            <div>
              <Label htmlFor="readingJuz">Number of Juz for Reading</Label>
              <Input
                id="readingJuz"
                type="number"
                min="1"
                max="5"
                value={settings.readingJuz}
                onChange={(e) => updateSetting('readingJuz', parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-gray-500 mt-1">Reading from Mushaf to reinforce visual memory</p>
            </div>
          </div>

          <Button onClick={saveSettings} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Current Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Start Date:</strong> {new Date(settings.startDate).toLocaleDateString()}
            </div>
            <div>
              <strong>RMV:</strong> Last {settings.rmvPages} pages from Juz {settings.currentJuz}
            </div>
            <div>
              <strong>OMV:</strong> {settings.omvJuz} Juz rotation from older memorization
            </div>
            <div>
              <strong>Listening:</strong> {settings.listeningJuz} Juz for listening practice
            </div>
            <div>
              <strong>Reading:</strong> {settings.readingJuz} Juz for Mushaf reading
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
