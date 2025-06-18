import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, BookOpen, Volume2, VolumeX, Settings, HelpCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAudio } from "@/contexts/AudioContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTafsir } from "@/lib/tafsir";
import { useSettings } from "@/contexts/SettingsContext";

interface QuranPageViewerDesktopProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  onNavigate?: (surah: number, ayah: number) => void;
}

export const QuranPageViewerDesktop = ({ currentPage, onPageChange, onNavigate }: QuranPageViewerDesktopProps) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    isPlaying,
    currentVerse,
    isAudioAvailable,
    togglePlay,
    stop,
    setAudioSource,
    setIsAudioAvailable,
  } = useAudio();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirText, setTafsirText] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { fontSize, setFontSize } = useSettings();

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  const toggleTafsir = useCallback(async () => {
    setShowTafsir((prevShowTafsir) => !prevShowTafsir);
  }, []);

  const fetchTafsir = useCallback(
    async (surah: number, ayah: number) => {
      try {
        const tafsir = await getTafsir(surah, ayah);
        setTafsirText(tafsir);
      } catch (error) {
        console.error("Failed to fetch tafsir:", error);
        setTafsirText("Failed to load Tafsir.");
      }
    },
    []
  );

  useEffect(() => {
    const surah = searchParams.get("surah");
    const ayah = searchParams.get("ayah");

    if (surah && ayah) {
      fetchTafsir(parseInt(surah), parseInt(ayah));
    }
  }, [searchParams, fetchTafsir]);

  const handleVerseClick = useCallback(
    async (surah: number, ayah: number) => {
      setSearchParams({ surah: surah.toString(), ayah: ayah.toString() });

      if (showTafsir) {
        await fetchTafsir(surah, ayah);
      }

      if (onNavigate) {
        onNavigate(surah, ayah);
      }
    },
    [setSearchParams, showTafsir, fetchTafsir, onNavigate]
  );

  const toggleAudio = () => {
    if (!isAudioAvailable) {
      toast({
        title: "Audio not available",
        description: "Audio is still loading. Please wait.",
      });
      return;
    }

    if (isPlaying) {
      stop();
    } else {
      const surah = searchParams.get("surah");
      const ayah = searchParams.get("ayah");

      if (surah && ayah) {
        togglePlay(parseInt(surah), parseInt(ayah));
      } else {
        togglePlay(1, 1);
      }
    }
  };

  const renderPageContent = (pageNumber: number) => {
    const lines = Array.from({ length: 15 }, (_, i) => i + 1);

    return (
      <div className="flex flex-col">
        {lines.map((lineNumber) => {
          const lineNumberKey = `page-${pageNumber}-line-${lineNumber}`;
          const words = Array.from({ length: 10 }, (_, i) => i + 1);

          return (
            <div key={lineNumberKey} className="flex justify-center items-center">
              {words.map((wordNumber) => {
                const wordNumberKey = `page-${pageNumber}-line-${lineNumber}-word-${wordNumber}`;
                const surah = parseInt(searchParams.get("surah") || "0");
                const ayah = parseInt(searchParams.get("ayah") || "0");
                const isHighlighted = surah > 0 && ayah > 0;

                return (
                  <span
                    key={wordNumberKey}
                    className={`text-gray-900 mx-1 ${isHighlighted ? "bg-yellow-200" : ""
                      }`}
                    style={{ fontSize: `${fontSize}px`, lineHeight: "2.0" }}
                    onClick={() => handleVerseClick(1, 1)}
                  >
                    بِسْمِ ٱللّٰهِ ٱلرَّحْمٰنِ ٱلرَّحِيمِ
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4 relative">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-semibold text-gray-800">
              Qur'an Page View
            </h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Page {currentPage}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= 604}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleAudio}>
              {isPlaying ? (
                <Volume2 className="h-4 w-4 text-green-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-600" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4 text-gray-600" />
            </Button>
            
            {/* Help Button */}
            <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                >
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl h-[80vh] p-0 gap-0">
                <DialogHeader className="p-4 sm:p-6 pb-2 border-b">
                  <DialogTitle className="text-lg sm:text-xl font-semibold text-green-700">
                    Page View Help & Guide
                  </DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="flex-1 p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6 pr-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                        📖 Purpose of Page View
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        The Page View provides a traditional Qur'an reading experience with authentic Uthmani script layout. It displays the Qur'an exactly as it appears in the Mushaf, maintaining the original page structure and verse arrangements.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                        🎯 What You'll Find Here
                      </h3>
                      <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                        <li><strong>Authentic Layout:</strong> View the Qur'an in its traditional Mushaf format</li>
                        <li><strong>Page Navigation:</strong> Easily navigate between all 604 pages of the Qur'an</li>
                        <li><strong>Audio Playback:</strong> Listen to recitations synchronized with the text</li>
                        <li><strong>Tafsir Access:</strong> Read detailed explanations and interpretations</li>
                        <li><strong>Personal Notes:</strong> Add and manage your own study notes</li>
                        <li><strong>Verse Selection:</strong> Click on verses for detailed interactions</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                        🚀 How to Use Page View
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm sm:text-base font-medium text-gray-700">1. Navigation</h4>
                          <p className="text-sm text-gray-600">Use the arrow buttons or keyboard shortcuts (← →) to move between pages. You can also use the navigation modal to jump to specific surahs or verses.</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm sm:text-base font-medium text-gray-700">2. Audio Controls</h4>
                          <p className="text-sm text-gray-600">Click the audio button to play/pause recitation. The audio will automatically follow the text and highlight the current verse being recited.</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm sm:text-base font-medium text-gray-700">3. Verse Interaction</h4>
                          <p className="text-sm text-gray-600">Click on any verse to access tafsir, add personal notes, or perform other verse-specific actions.</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm sm:text-base font-medium text-gray-700">4. Settings</h4>
                          <p className="text-sm text-gray-600">Use the settings button to customize your reading experience, including font size, audio preferences, and display options.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                        ⌨️ Keyboard Shortcuts
                      </h3>
                      <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                        <li><strong>← / →:</strong> Navigate to previous/next page</li>
                        <li><strong>Space:</strong> Play/pause audio recitation</li>
                        <li><strong>Ctrl/Cmd + F:</strong> Open navigation modal</li>
                        <li><strong>Escape:</strong> Close any open dialogs</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                        💡 Pro Tips
                      </h3>
                      <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                        <li>Use the page view for focused reading and memorization practice</li>
                        <li>Follow along with audio to improve your recitation and pronunciation</li>
                        <li>Take notes while reading to capture insights and reflections</li>
                        <li>Use the authentic layout to familiarize yourself with the traditional Mushaf</li>
                        <li>Navigate quickly using the search and jump features</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                        🔍 Features Overview
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-blue-800">Reading</h5>
                          <p className="text-xs text-blue-600">Traditional Mushaf layout</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h5 className="font-medium text-purple-800">Audio</h5>
                          <p className="text-xs text-purple-600">Synchronized recitation</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <h5 className="font-medium text-orange-800">Notes</h5>
                          <p className="text-xs text-orange-600">Personal annotations</p>
                        </div>
                        <div className="bg-teal-50 p-3 rounded-lg">
                          <h5 className="font-medium text-teal-800">Tafsir</h5>
                          <p className="text-xs text-teal-600">Detailed explanations</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                        🤲 Reflection
                      </h3>
                      <p className="text-sm sm:text-base text-green-700 leading-relaxed">
                        "This is the Book about which there is no doubt, a guidance for those conscious of Allah." (2:2)
                        <br /><br />
                        Use this page view to connect deeply with the Qur'an's text, reflect on its meanings, and enhance your relationship with Allah's words. May your reading be a source of guidance and blessing.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto p-4 max-w-7xl mx-auto">
        {renderPageContent(currentPage)}
      </div>
    </div>
  );
};
