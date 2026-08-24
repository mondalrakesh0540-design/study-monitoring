// src/hooks/useVisibilityMonitor.js
// Custom React hook to monitor browser tab and window visibility changes during a study session.

import { useEffect, useRef } from 'react';

export function useVisibilityMonitor({ isMonitoring, onTabChange, onTabReturn }) {
  const isTabHiddenRef = useRef(false);

  useEffect(() => {
    if (!isMonitoring) {
      isTabHiddenRef.current = false;
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!isTabHiddenRef.current) {
          isTabHiddenRef.current = true;
          if (onTabChange) onTabChange();
        }
      } else {
        if (isTabHiddenRef.current) {
          isTabHiddenRef.current = false;
          if (onTabReturn) onTabReturn();
        }
      }
    };

    const handleBlur = () => {
      if (!isTabHiddenRef.current && isMonitoring) {
        isTabHiddenRef.current = true;
        if (onTabChange) onTabChange();
      }
    };

    const handleFocus = () => {
      if (isTabHiddenRef.current && isMonitoring) {
        isTabHiddenRef.current = false;
        if (onTabReturn) onTabReturn();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isMonitoring, onTabChange, onTabReturn]);
}
