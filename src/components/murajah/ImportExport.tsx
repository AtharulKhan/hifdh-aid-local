
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface LocalStorageItem {
  key: string;
  value: string;
  selected: boolean;
}

export const ImportExport = () => {
  const [localStorageItems, setLocalStorageItems] = useState<LocalStorageItem[]>([]);
  const [importData, setImportData] = useState('');
  const [selectAll, setSelectAll] = useState(true);
  const { toast } = useToast();

  // Load all localStorage items on component mount
  useEffect(() => {
    const items: LocalStorageItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          items.push({
            key,
            value,
            selected: true
          });
        }
      }
    }
    setLocalStorageItems(items.sort((a, b) => a.key.localeCompare(b.key)));
  }, []);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setLocalStorageItems(items => 
      items.map(item => ({ ...item, selected: checked }))
    );
  };

  const handleItemToggle = (key: string, checked: boolean) => {
    setLocalStorageItems(items => 
      items.map(item => 
        item.key === key ? { ...item, selected: checked } : item
      )
    );
    
    // Update select all state
    const updatedItems = localStorageItems.map(item => 
      item.key === key ? { ...item, selected: checked } : item
    );
    setSelectAll(updatedItems.every(item => item.selected));
  };

  const exportData = () => {
    const selectedItems = localStorageItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to export.",
        variant: "destructive"
      });
      return;
    }

    const exportObject: Record<string, any> = {};
    selectedItems.forEach(item => {
      try {
        // Try to parse as JSON, if it fails, store as string
        exportObject[item.key] = JSON.parse(item.value);
      } catch {
        exportObject[item.key] = item.value;
      }
    });

    const dataStr = JSON.stringify(exportObject, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `quran-hifz-aid-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${selectedItems.length} items to JSON file.`
    });
  };

  const importDataFromJson = () => {
    if (!importData.trim()) {
      toast({
        title: "No data to import",
        description: "Please paste JSON data in the textarea.",
        variant: "destructive"
      });
      return;
    }

    try {
      const parsedData = JSON.parse(importData);
      let importedCount = 0;

      Object.entries(parsedData).forEach(([key, value]) => {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        importedCount++;
      });

      // Refresh the localStorage items display
      const items: LocalStorageItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            items.push({
              key,
              value,
              selected: true
            });
          }
        }
      }
      setLocalStorageItems(items.sort((a, b) => a.key.localeCompare(b.key)));
      setImportData('');

      toast({
        title: "Import successful",
        description: `Imported ${importedCount} items from JSON data.`
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid JSON format. Please check your data.",
        variant: "destructive"
      });
    }
  };

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const formatValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Import/Export Data</h2>
        <p className="text-gray-600">
          Backup and restore your Quran Hifz Aid data
        </p>
      </div>

      {/* Export Section */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Download className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-700">Export Data</h3>
        </div>

        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="font-medium text-green-700">
              Select All ({localStorageItems.length} items)
            </Label>
          </div>

          {/* Items List */}
          <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
            {localStorageItems.map((item) => (
              <div key={item.key} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                <Checkbox
                  id={item.key}
                  checked={item.selected}
                  onCheckedChange={(checked) => handleItemToggle(item.key, !!checked)}
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor={item.key} className="font-medium text-sm text-gray-700 cursor-pointer">
                    {item.key}
                  </Label>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {item.value.length > 100 ? `${item.value.substring(0, 100)}...` : item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={exportData} className="w-full bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export Selected Data
          </Button>
        </div>
      </Card>

      {/* Import Section */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-700">Import Data</h3>
        </div>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Importing data will overwrite existing entries with the same keys. Make sure to export your current data first as a backup.
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Import from JSON file
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={importFromFile}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          {/* Manual JSON Input */}
          <div>
            <Label htmlFor="json-data" className="block text-sm font-medium text-gray-700 mb-2">
              Or paste JSON data manually
            </Label>
            <Textarea
              id="json-data"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your JSON data here..."
              className="min-h-32 font-mono text-sm border-blue-200 focus:border-blue-400"
            />
          </div>

          <Button 
            onClick={importDataFromJson} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!importData.trim()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </div>
      </Card>

      {/* Current Data Preview */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700">Current Data Preview</h3>
        </div>
        
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
            {JSON.stringify(
              Object.fromEntries(
                localStorageItems
                  .filter(item => item.selected)
                  .map(item => [
                    item.key, 
                    (() => {
                      try {
                        return JSON.parse(item.value);
                      } catch {
                        return item.value;
                      }
                    })()
                  ])
              ), 
              null, 
              2
            )}
          </pre>
        </div>
      </Card>
    </div>
  );
};
