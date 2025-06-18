
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Type declaration for gtag
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

export const usePageTracking = () => {
  const location = useLocation();
  
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search
      });
    }
  }, [location]);
};
