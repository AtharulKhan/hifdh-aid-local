

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  children: React.ReactNode;
  initialHeight?: string;
  title?: React.ReactNode;
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  children,
  initialHeight = '150px',
  title,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-1">
      {title && (
        <div className="px-4 py-0 flex justify-between items-center">
          <div className="text-lg font-semibold">{title}</div>
        </div>
      )}

      <div
        className={cn('relative overflow-hidden transition-all duration-500 ease-in-out')}
        style={{ maxHeight: isExpanded ? '10000px' : initialHeight }}
      >
        <div className={cn("px-4 py-1", title ? "" : "pt-3")}>{children}</div>
        {!isExpanded && (
          <div
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none"
          />
        )}
      </div>

      <div className="px-4 pb-4 pt-2 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Show More <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

