
import React from 'react';
import { WeakSpotFlag } from './WeakSpotFlag';
import { cn } from '@/lib/utils';

interface VerseWithFlagProps {
  surahNumber: number;
  ayahNumber: number;
  verseText: string;
  verseKey?: string;
  className?: string;
  showFlag?: boolean;
  flagSize?: 'sm' | 'md' | 'lg';
  dir?: 'ltr' | 'rtl';
}

export const VerseWithFlag: React.FC<VerseWithFlagProps> = ({
  surahNumber,
  ayahNumber,
  verseText,
  verseKey,
  className,
  showFlag = true,
  flagSize = 'sm',
  dir = 'rtl'
}) => {
  return (
    <div className={cn("relative group", className)}>
      <div className={cn("flex items-start gap-2", dir === 'rtl' ? 'flex-row-reverse' : 'flex-row')}>
        {showFlag && (
          <div className="flex-shrink-0 mt-1">
            <WeakSpotFlag 
              surahNumber={surahNumber}
              ayahNumber={ayahNumber}
              size={flagSize}
              className="opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}
        
        <div className="flex-1">
          {verseKey && (
            <p className={cn(
              "text-sm text-gray-500 mb-1",
              dir === 'rtl' ? 'text-right' : 'text-left'
            )}>
              {verseKey}
            </p>
          )}
          <p 
            dir={dir}
            className={cn(
              "leading-relaxed",
              dir === 'rtl' ? 'text-right font-arabic' : 'text-left'
            )}
          >
            {verseText}
          </p>
        </div>
      </div>
    </div>
  );
};
