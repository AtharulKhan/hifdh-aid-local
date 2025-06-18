
import React from 'react';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  children: React.ReactNode;
  initialHeight?: string;
  title?: React.ReactNode;
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  children,
  initialHeight, // This prop is now unused but kept for compatibility
  title,
}) => {
  return (
    <div className="mb-1">
      {title && (
        <div className="px-4 py-0 flex justify-between items-center">
          <div className="text-lg font-semibold">{title}</div>
        </div>
      )}

      <div className={cn('overflow-visible')}>
        <div className={cn("px-4 py-1", title ? "" : "pt-3")}>{children}</div>
      </div>
    </div>
  );
};
