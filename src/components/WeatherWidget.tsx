import { useWeather } from '@/hooks/useWeather';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Cloud, Sun, CloudRain, CloudLightning, CloudSun, Wind, Droplets, Thermometer } from 'lucide-react';
import { WeatherCondition } from '@/types';

const getWeatherGradient = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'sunny':
      return 'from-amber-400/20 via-orange-300/10 to-yellow-200/20';
    case 'partly_cloudy':
      return 'from-blue-300/20 via-sky-200/10 to-amber-200/20';
    case 'cloudy':
      return 'from-slate-400/20 via-gray-300/10 to-slate-200/20';
    case 'rainy':
      return 'from-blue-500/20 via-indigo-400/10 to-slate-300/20';
    case 'stormy':
      return 'from-purple-600/20 via-indigo-500/10 to-slate-400/20';
    default:
      return 'from-sky-300/20 via-blue-200/10 to-cyan-200/20';
  }
};

const WeatherIcon = ({ condition, className }: { condition: WeatherCondition; className?: string }) => {
  const iconProps = { className: cn("transition-all", className) };
  
  switch (condition) {
    case 'sunny':
      return <Sun {...iconProps} className={cn(iconProps.className, "text-amber-500 animate-pulse-slow")} />;
    case 'partly_cloudy':
      return <CloudSun {...iconProps} className={cn(iconProps.className, "text-sky-500")} />;
    case 'cloudy':
      return <Cloud {...iconProps} className={cn(iconProps.className, "text-slate-500")} />;
    case 'rainy':
      return <CloudRain {...iconProps} className={cn(iconProps.className, "text-blue-500")} />;
    case 'stormy':
      return <CloudLightning {...iconProps} className={cn(iconProps.className, "text-purple-500")} />;
    default:
      return <CloudSun {...iconProps} className={cn(iconProps.className, "text-sky-500")} />;
  }
};

const SmallWeatherIcon = ({ condition }: { condition: WeatherCondition }) => {
  const size = "w-6 h-6";
  switch (condition) {
    case 'sunny':
      return <Sun className={cn(size, "text-amber-500")} />;
    case 'partly_cloudy':
      return <CloudSun className={cn(size, "text-sky-500")} />;
    case 'cloudy':
      return <Cloud className={cn(size, "text-slate-500")} />;
    case 'rainy':
      return <CloudRain className={cn(size, "text-blue-500")} />;
    case 'stormy':
      return <CloudLightning className={cn(size, "text-purple-500")} />;
    default:
      return <CloudSun className={cn(size, "text-sky-500")} />;
  }
};

export function WeatherWidget() {
  const { weather, loading, getWeatherSuggestion, today } = useWeather();

  if (loading) {
    return (
      <Card className="p-4 overflow-hidden">
        <Skeleton className="h-32 w-full rounded-lg" />
      </Card>
    );
  }

  if (!today) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const todayDate = new Date();
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === todayDate.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tom';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-0 shadow-lg",
      `bg-gradient-to-br ${getWeatherGradient(today.condition)}`
    )}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <WeatherIcon condition={today.condition} className="w-full h-full" />
      </div>
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Live Weather
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Enugu</h3>
          </div>
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-background/50 backdrop-blur-sm shadow-inner">
            <WeatherIcon condition={today.condition} className="w-10 h-10" />
          </div>
        </div>

        {/* Temperature & Details */}
        <div className="flex items-end gap-6 mb-4">
          <div className="flex items-start">
            <span className="font-display text-5xl font-bold text-foreground">{today.temperature}</span>
            <span className="text-2xl font-light text-muted-foreground mt-1">°C</span>
          </div>
          <div className="flex-1 pb-2">
            <p className="text-sm font-medium text-foreground mb-1">{today.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                {today.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-slate-400" />
                {today.windSpeed} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Weather Suggestion */}
        <div className="bg-background/60 backdrop-blur-sm rounded-xl p-3 mb-4 border border-border/50">
          <div className="flex items-start gap-2">
            <Thermometer className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              {getWeatherSuggestion(today.condition)}
            </p>
          </div>
        </div>

        {/* 5-day forecast */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {weather.map((day, index) => (
            <div 
              key={day.date}
              className={cn(
                "flex-1 min-w-[56px] flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                index === 0 
                  ? "bg-primary/15 border border-primary/20" 
                  : "bg-background/40 hover:bg-background/60"
              )}
            >
              <span className={cn(
                "text-xs font-medium",
                index === 0 ? "text-primary" : "text-muted-foreground"
              )}>
                {formatDate(day.date)}
              </span>
              <SmallWeatherIcon condition={day.condition} />
              <span className={cn(
                "text-sm font-bold",
                index === 0 ? "text-foreground" : "text-foreground/80"
              )}>
                {day.temperature}°
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
