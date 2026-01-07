import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NativeAdProps {
  className?: string;
  testMode?: boolean;
}

export function NativeAd({ className, testMode = true }: NativeAdProps) {
  // In production, this would render an actual native ad unit
  // For now, we show a placeholder that matches the location card style
  
  if (testMode) {
    return (
      <div 
        className={cn(
          "flex flex-col bg-card rounded-xl border overflow-hidden",
          className
        )}
      >
        <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm font-medium">Sponsored</p>
          </div>
        </div>
        <div className="p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              Ad
            </Badge>
          </div>
          <div className="h-4 bg-muted rounded w-3/4 mb-1" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  // Production native ad implementation
  return (
    <div className={cn("native-ad-container", className)}>
      {/* Native ad code would go here */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
      />
    </div>
  );
}
