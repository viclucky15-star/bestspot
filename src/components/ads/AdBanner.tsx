import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  testMode?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBanner({ slot, format = 'auto', className, testMode = true }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adBlocked, setAdBlocked] = useState(false);

  useEffect(() => {
    // Check if ad script loaded (ad blocker detection)
    const checkAdBlocker = () => {
      if (typeof window.adsbygoogle === 'undefined') {
        setAdBlocked(true);
        return true;
      }
      return false;
    };

    if (!testMode && !checkAdBlocker()) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [testMode]);

  // Test mode - show placeholder
  if (testMode) {
    return (
      <div 
        className={cn(
          "bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm",
          format === 'rectangle' && "h-[250px]",
          format === 'horizontal' && "h-[90px]",
          format === 'vertical' && "h-[600px] w-[160px]",
          format === 'auto' && "h-[100px]",
          className
        )}
      >
        <div className="text-center p-4">
          <p className="font-medium">Ad Space</p>
          <p className="text-xs opacity-70">{format} • {slot}</p>
        </div>
      </div>
    );
  }

  if (adBlocked) {
    return null; // Don't show anything if ads are blocked
  }

  return (
    <div ref={adRef} className={cn("overflow-hidden", className)}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
