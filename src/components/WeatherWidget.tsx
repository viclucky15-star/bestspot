import { useWeather } from '@/hooks/useWeather';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function WeatherWidget() {
  const { weather, loading, getWeatherSuggestion, today } = useWeather();

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!today) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-accent/30">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Weather in Enugu</h3>
          <p className="text-sm text-muted-foreground">{getWeatherSuggestion(today.condition)}</p>
        </div>
        <div className="text-4xl">{today.icon}</div>
      </div>

      {/* Today's details */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b">
        <div className="text-3xl font-bold">{today.temperature}°C</div>
        <div className="text-sm text-muted-foreground">
          <p>{today.description}</p>
          <p>💧 {today.humidity}% humidity</p>
          <p>💨 {today.windSpeed} km/h wind</p>
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weather.map((day, index) => (
          <div 
            key={day.date}
            className={cn(
              "flex-1 min-w-[60px] text-center p-2 rounded-lg",
              index === 0 && "bg-primary/10"
            )}
          >
            <p className="text-xs font-medium mb-1">{formatDate(day.date)}</p>
            <p className="text-xl mb-1">{day.icon}</p>
            <p className="text-sm font-semibold">{day.temperature}°</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
