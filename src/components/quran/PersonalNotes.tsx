
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, StickyNote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PersonalNotesProps {
  surahNumber: number;
  verseNumber?: number;
}

export const PersonalNotes: React.FC<PersonalNotesProps> = ({ 
  surahNumber, 
  verseNumber 
}) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Generate storage key based on surah and verse (if provided)
  const getStorageKey = () => {
    return verseNumber 
      ? `quran-notes-${surahNumber}-${verseNumber}`
      : `quran-notes-surah-${surahNumber}`;
  };

  // Load notes from localStorage on component mount or when surah/verse changes
  useEffect(() => {
    const storageKey = getStorageKey();
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes('');
    }
  }, [surahNumber, verseNumber]);

  // Save notes to localStorage
  const saveNotes = () => {
    setIsSaving(true);
    const storageKey = getStorageKey();
    
    try {
      if (notes.trim()) {
        localStorage.setItem(storageKey, notes);
        toast({
          title: "Notes saved",
          description: "Your personal notes have been saved locally.",
        });
      } else {
        localStorage.removeItem(storageKey);
        toast({
          title: "Notes cleared",
          description: "Empty notes have been removed.",
        });
      }
    } catch (error) {
      toast({
        title: "Error saving notes",
        description: "Unable to save notes to local storage.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save on blur
  const handleBlur = () => {
    if (notes !== (localStorage.getItem(getStorageKey()) || '')) {
      saveNotes();
    }
  };

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StickyNote className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-700">Personal Notes</h4>
          </div>
          <Badge variant="outline" className="border-blue-300 text-blue-600 text-xs">
            {verseNumber ? `Surah ${surahNumber}:${verseNumber}` : `Surah ${surahNumber}`}
          </Badge>
        </div>
        
        <Textarea
          placeholder="Add your personal reflections, insights, or notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleBlur}
          className="min-h-[120px] border-blue-200 focus:border-blue-400 bg-white"
        />
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-blue-500">
            Notes are saved automatically to your browser's local storage
          </p>
          <Button
            onClick={saveNotes}
            disabled={isSaving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
