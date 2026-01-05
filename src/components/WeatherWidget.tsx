import { useWeather } from '@/hooks/useWeather';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Wind, Droplets, Thermometer } from 'lucide-react';
import { WeatherCondition } from '@/types';

// Realistic weather icon components with animations
const SunIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={cn("drop-shadow-lg", className)}>
    {/* Sun rays */}
    <g className="animate-[spin_20s_linear_infinite] origin-center">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="15"
          x2="50"
          y2="5"
          stroke="#FCD34D"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
    </g>
    {/* Sun body */}
    <circle cx="50" cy="50" r="22" fill="url(#sunGradient)" />
    <defs>
      <radialGradient id="sunGradient" cx="40%" cy="40%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </radialGradient>
    </defs>
  </svg>
);

const CloudIcon = ({ className, dark = false }: { className?: string; dark?: boolean }) => (
  <svg viewBox="0 0 100 70" className={cn("drop-shadow-md", className)}>
    <ellipse cx="35" cy="45" rx="25" ry="20" fill={dark ? "#94A3B8" : "#E2E8F0"} />
    <ellipse cx="55" cy="35" rx="30" ry="25" fill={dark ? "#CBD5E1" : "#F1F5F9"} />
    <ellipse cx="75" cy="45" rx="20" ry="18" fill={dark ? "#94A3B8" : "#E2E8F0"} />
    <ellipse cx="55" cy="50" rx="35" ry="15" fill={dark ? "#CBD5E1" : "#F1F5F9"} />
  </svg>
);

const PartlyCloudyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 80" className={cn("drop-shadow-lg", className)}>
    {/* Sun behind */}
    <g className="animate-pulse-slow">
      <circle cx="30" cy="25" r="18" fill="url(#partlySunGradient)" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1="30"
          y1="5"
          x2="30"
          y2="0"
          stroke="#FCD34D"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle} 30 25)`}
        />
      ))}
    </g>
    {/* Cloud in front */}
    <ellipse cx="50" cy="55" rx="22" ry="16" fill="#E2E8F0" />
    <ellipse cx="68" cy="48" rx="26" ry="20" fill="#F1F5F9" />
    <ellipse cx="85" cy="55" rx="18" ry="14" fill="#E2E8F0" />
    <ellipse cx="68" cy="58" rx="30" ry="12" fill="#F1F5F9" />
    <defs>
      <radialGradient id="partlySunGradient" cx="40%" cy="40%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </radialGradient>
    </defs>
  </svg>
);

const RainIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 90" className={cn("drop-shadow-md", className)}>
    {/* Dark cloud */}
    <ellipse cx="35" cy="35" rx="22" ry="18" fill="#64748B" />
    <ellipse cx="55" cy="28" rx="26" ry="22" fill="#94A3B8" />
    <ellipse cx="75" cy="35" rx="18" ry="16" fill="#64748B" />
    <ellipse cx="55" cy="40" rx="32" ry="12" fill="#94A3B8" />
    {/* Rain drops */}
    {[25, 45, 65, 35, 55, 75].map((x, i) => (
      <line
        key={i}
        x1={x}
        y1={55 + (i % 2) * 8}
        x2={x - 3}
        y2={70 + (i % 2) * 8}
        stroke="#60A5FA"
        strokeWidth="3"
        strokeLinecap="round"
        className="animate-[rainDrop_1s_ease-in-out_infinite]"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
    <style>{`
      @keyframes rainDrop {
        0%, 100% { opacity: 0; transform: translateY(-5px); }
        50% { opacity: 1; transform: translateY(5px); }
      }
    `}</style>
  </svg>
);

const StormIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 95" className={cn("drop-shadow-lg", className)}>
    {/* Dark storm cloud */}
    <ellipse cx="35" cy="30" rx="22" ry="18" fill="#475569" />
    <ellipse cx="55" cy="23" rx="26" ry="22" fill="#64748B" />
    <ellipse cx="75" cy="30" rx="18" ry="16" fill="#475569" />
    <ellipse cx="55" cy="35" rx="32" ry="12" fill="#64748B" />
    {/* Lightning bolt */}
    <polygon
      points="55,45 45,60 52,60 42,80 60,55 52,55 58,45"
      fill="#FBBF24"
      className="animate-[lightning_2s_ease-in-out_infinite]"
    />
    {/* Rain drops */}
    {[28, 72].map((x, i) => (
      <line
        key={i}
        x1={x}
        y1={55}
        x2={x - 3}
        y2={70}
        stroke="#60A5FA"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="animate-[rainDrop_0.8s_ease-in-out_infinite]"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
    <style>{`
      @keyframes lightning {
        0%, 90%, 100% { opacity: 1; }
        92%, 94%, 96% { opacity: 0.3; }
        93%, 95% { opacity: 1; }
      }
    `}</style>
  </svg>
);

const getWeatherGradient = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'sunny':
      return 'from-amber-100 via-orange-50 to-yellow-100 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-yellow-900/30';
    case 'partly_cloudy':
      return 'from-sky-100 via-blue-50 to-amber-50 dark:from-sky-900/30 dark:via-blue-900/20 dark:to-amber-900/20';
    case 'cloudy':
      return 'from-slate-200 via-gray-100 to-slate-100 dark:from-slate-800/50 dark:via-gray-800/40 dark:to-slate-800/50';
    case 'rainy':
      return 'from-blue-200 via-indigo-100 to-slate-200 dark:from-blue-900/40 dark:via-indigo-900/30 dark:to-slate-800/40';
    case 'stormy':
      return 'from-purple-200 via-indigo-200 to-slate-300 dark:from-purple-900/40 dark:via-indigo-900/40 dark:to-slate-800/50';
    default:
      return 'from-sky-100 via-blue-50 to-cyan-100 dark:from-sky-900/30 dark:via-blue-900/20 dark:to-cyan-900/30';
  }
};

const WeatherIcon = ({ condition, size = 'large' }: { condition: WeatherCondition; size?: 'large' | 'small' }) => {
  const sizeClass = size === 'large' ? 'w-20 h-20' : 'w-10 h-10';
  
  switch (condition) {
    case 'sunny':
      return <SunIcon className={sizeClass} />;
    case 'partly_cloudy':
      return <PartlyCloudyIcon className={sizeClass} />;
    case 'cloudy':
      return <CloudIcon className={sizeClass} dark />;
    case 'rainy':
      return <RainIcon className={sizeClass} />;
    case 'stormy':
      return <StormIcon className={sizeClass} />;
    default:
      return <PartlyCloudyIcon className={sizeClass} />;
  }
};

export function WeatherWidget() {
  const { weather, loading, getWeatherSuggestion, today } = useWeather();

  if (loading) {
    return (
      <Card className="p-4 overflow-hidden">
        <Skeleton className="h-40 w-full rounded-lg" />
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
      "relative overflow-hidden border-0 shadow-xl",
      `bg-gradient-to-br ${getWeatherGradient(today.condition)}`
    )}>
      {/* Background decorative element */}
      <div className="absolute -top-8 -right-8 opacity-20">
        <WeatherIcon condition={today.condition} size="large" />
      </div>
      
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
          <div className="flex items-center justify-center">
            <WeatherIcon condition={today.condition} size="large" />
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
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                {today.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-slate-500" />
                {today.windSpeed} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Weather Suggestion */}
        <div className="bg-background/70 backdrop-blur-sm rounded-xl p-3 mb-4 border border-border/50">
          <div className="flex items-start gap-2">
            <Thermometer className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              {getWeatherSuggestion(today.condition)}
            </p>
          </div>
        </div>

        {/* 5-day forecast */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {weather.map((day, index) => (
            <div 
              key={day.date}
              className={cn(
                "flex-1 min-w-[58px] flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                index === 0 
                  ? "bg-primary/15 border border-primary/30 shadow-sm" 
                  : "bg-background/50 hover:bg-background/70"
              )}
            >
              <span className={cn(
                "text-xs font-medium",
                index === 0 ? "text-primary" : "text-muted-foreground"
              )}>
                {formatDate(day.date)}
              </span>
              <WeatherIcon condition={day.condition} size="small" />
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
