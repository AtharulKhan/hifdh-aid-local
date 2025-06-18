
import React, { useState, useEffect } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface WeakSpotFlagProps {
  surahNumber: number;
  ayahNumber: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WeakSpotFlag: React.FC<WeakSpotFlagProps> = ({
  surahNumber,
  ayahNumber,
  size = 'md',
  className
}) => {
  const { user } = useAuth();
  const [isFlagged, setIsFlagged] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Check if this verse is already flagged
  useEffect(() => {
    const checkIfFlagged = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('weak_spots')
          .select('id')
          .eq('user_id', user.id)
          .eq('surah_number', surahNumber)
          .eq('ayah_number', ayahNumber)
          .eq('status', 'weak')
          .maybeSingle();

        if (error) {
          console.error('Error checking weak spot status:', error);
        } else {
          setIsFlagged(!!data);
        }
      } catch (e) {
        console.error('Exception checking weak spot status:', e);
      }
    };

    checkIfFlagged();
  }, [user, surahNumber, ayahNumber]);

  const toggleFlag = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isFlagged) {
        // Remove from weak spots
        const { error } = await supabase
          .from('weak_spots')
          .delete()
          .match({
            user_id: user.id,
            surah_number: surahNumber,
            ayah_number: ayahNumber
          });

        if (error) {
          console.error('Error removing weak spot:', error);
        } else {
          setIsFlagged(false);
        }
      } else {
        // Add to weak spots
        const { error } = await supabase
          .from('weak_spots')
          .insert({
            user_id: user.id,
            surah_number: surahNumber,
            ayah_number: ayahNumber,
            status: 'weak'
          });

        if (error) {
          console.error('Error adding weak spot:', error);
        } else {
          setIsFlagged(true);
        }
      }
    } catch (e) {
      console.error('Exception toggling weak spot:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizes = {
    sm: 'icon',
    md: 'icon',
    lg: 'icon'
  } as const;

  return (
    <Button
      variant="ghost"
      size={buttonSizes[size]}
      onClick={toggleFlag}
      disabled={loading}
      className={cn(
        "hover:bg-red-50 transition-colors",
        className
      )}
      title={isFlagged ? "Remove from weak spots" : "Add to weak spots"}
    >
      <Flag 
        className={cn(
          sizeClasses[size],
          isFlagged 
            ? "fill-red-500 text-red-500" 
            : "text-gray-400 hover:text-red-400"
        )} 
      />
    </Button>
  );
};
