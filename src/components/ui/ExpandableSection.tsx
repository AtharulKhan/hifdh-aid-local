import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming this path
import { cn } from '@/lib/utils'; // Assuming this path

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
    <div className="border rounded-lg p-1 mb-1"> {/* Main wrapper, can be unstyled or styled as needed */}
      {title && (
        <div className="px-4 py-0 flex justify-between items-center"> {/* Title container */}
          <div className="text-lg font-semibold">{title}</div>
        </div>
      )}

      <div
        className={cn('relative overflow-hidden transition-all duration-500 ease-in-out')}
        style={{ maxHeight: isExpanded ? '10000px' : initialHeight }} // Use a large maxHeight for expanded
      >
        <div className={cn("px-4 py-1", title ? "" : "pt-3")}>{children}</div> {/* Content with padding */}
        {!isExpanded && (
          <div
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none"
            // Assuming 'from-background' will use the current theme's background.
            // If cards have specific backgrounds, this might need adjustment or be applied on the parent.
          />
        )}
      </div>

      <div className="px-4 pb-1 pt-0 flex justify-center"> {/* Toggle button container */}
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
