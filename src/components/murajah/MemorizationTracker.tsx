
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface MemorizationEntry {
  id: string;
  juz: number;
  startPage: number;
  endPage: number;
  dateMemorized: string;
}

export const MemorizationTracker = () => {
  const [entries, setEntries] = useState<MemorizationEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    juz: 1,
    startPage: 1,
    endPage: 1,
    dateMemorized: new Date().toISOString().split('T')[0]
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('murajah-memorization-entries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('murajah-memorization-entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (newEntry.startPage > newEntry.endPage) {
      alert("Start page cannot be greater than end page");
      return;
    }

    const entry: MemorizationEntry = {
      id: Date.now().toString(),
      ...newEntry
    };

    setEntries([...entries, entry]);
    setNewEntry({
      juz: newEntry.juz + 1,
      startPage: newEntry.endPage + 1,
      endPage: newEntry.endPage + 1,
      dateMemorized: new Date().toISOString().split('T')[0]
    });
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const getTotalPages = () => {
    return entries.reduce((total, entry) => total + (entry.endPage - entry.startPage + 1), 0);
  };

  const getJuzProgress = () => {
    const juzData: Record<number, { pages: number; completed: boolean }> = {};
    
    entries.forEach(entry => {
      if (!juzData[entry.juz]) {
        juzData[entry.juz] = { pages: 0, completed: false };
      }
      juzData[entry.juz].pages += (entry.endPage - entry.startPage + 1);
      
      // Each Juz has approximately 20 pages
      if (juzData[entry.juz].pages >= 20) {
        juzData[entry.juz].completed = true;
      }
    });

    return juzData;
  };

  const juzProgress = getJuzProgress();
  const completedJuz = Object.values(juzProgress).filter(j => j.completed).length;

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">{getTotalPages()}</div>
            <div className="text-xs md:text-sm text-gray-600">Total Pages Memorized</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{completedJuz}</div>
            <div className="text-xs md:text-sm text-gray-600">Complete Juz</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="text-xl md:text-2xl font-bold text-purple-600">{entries.length}</div>
            <div className="text-xs md:text-sm text-gray-600">Memorization Sessions</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Entry */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            Add New Memorization Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div>
              <Label htmlFor="juz" className="text-sm">Juz Number</Label>
              <Input
                id="juz"
                type="number"
                min="1"
                max="30"
                value={newEntry.juz}
                onChange={(e) => setNewEntry({...newEntry, juz: parseInt(e.target.value) || 1})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="startPage" className="text-sm">Start Page</Label>
              <Input
                id="startPage"
                type="number"
                min="1"
                max="604"
                value={newEntry.startPage}
                onChange={(e) => setNewEntry({...newEntry, startPage: parseInt(e.target.value) || 1})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endPage" className="text-sm">End Page</Label>
              <Input
                id="endPage"
                type="number"
                min="1"
                max="604"
                value={newEntry.endPage}
                onChange={(e) => setNewEntry({...newEntry, endPage: parseInt(e.target.value) || 1})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateMemorized" className="text-sm">Date Memorized</Label>
              <Input
                id="dateMemorized"
                type="date"
                value={newEntry.dateMemorized}
                onChange={(e) => setNewEntry({...newEntry, dateMemorized: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
          <Button onClick={addEntry} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Memorization History</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {entries.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-gray-500">
              <div className="text-sm md:text-base">No memorization entries yet. Add your first entry above to get started!</div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-full inline-block align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs md:text-sm whitespace-nowrap">Juz</TableHead>
                      <TableHead className="text-xs md:text-sm whitespace-nowrap">Pages</TableHead>
                      <TableHead className="text-xs md:text-sm whitespace-nowrap">Count</TableHead>
                      <TableHead className="text-xs md:text-sm whitespace-nowrap">Date</TableHead>
                      <TableHead className="text-xs md:text-sm whitespace-nowrap">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">Juz {entry.juz}</Badge>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">{entry.startPage}-{entry.endPage}</TableCell>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">{entry.endPage - entry.startPage + 1} pages</TableCell>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">{new Date(entry.dateMemorized).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeEntry(entry.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
