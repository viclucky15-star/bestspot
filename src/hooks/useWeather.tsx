import { useState, useEffect, useCallback } from 'react';
import { WeatherData, WeatherCondition, NigerianState } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// State coordinates for fallback
const STATE_COORDS: Record<NigerianState, { lat: number; lon: number; city: string }> = {
  Abia: { lat: 5.5320, lon: 7.4860, city: 'Umuahia' },
  Anambra: { lat: 6.2100, lon: 7.0700, city: 'Awka' },
  Enugu: { lat: 6.4584, lon: 7.5464, city: 'Enugu' },
  Ebonyi: { lat: 6.3249, lon: 8.1137, city: 'Abakaliki' },
  Imo: { lat: 5.4836, lon: 7.0333, city: 'Owerri' },
};

const getWeatherIcon = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'sunny': return '☀️';
    case 'partly_cloudy': return '⛅';
    case 'cloudy': return '☁️';
    case 'rainy': return '🌧️';
    case 'stormy': return '⛈️';
    case 'windy': return '💨';
    default: return '🌤️';
  }
};

const mapCondition = (condition: string): WeatherCondition => {
  const conditionMap: Record<string, WeatherCondition> = {
    sunny: 'sunny',
    cloudy: 'cloudy',
    rainy: 'rainy',
    windy: 'cloudy',
    stormy: 'stormy',
  };
  return conditionMap[condition] || 'cloudy';
};

export function useWeather(state: NigerianState = 'Enugu') {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentCity, setCurrentCity] = useState(STATE_COORDS[state].city);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setCurrentCity(STATE_COORDS[state].city);
    
    try {
      // Try AccuWeather via edge function
      const { data, error: fnError } = await supabase.functions.invoke('get-weather', {
        body: { state }
      });

      if (fnError) throw fnError;

      if (data && data.current) {
        const condition = mapCondition(data.current.condition);
        
        // Current weather as first item
        const currentWeather: WeatherData = {
          date: new Date().toISOString().split('T')[0],
          temperature: data.current.temperature,
          condition,
          description: data.current.description,
          humidity: data.current.humidity,
          windSpeed: data.current.windSpeed,
          icon: getWeatherIcon(condition),
        };

        // Map forecast data
        const forecastWeather: WeatherData[] = data.forecast?.slice(1, 5).map((day: any) => {
          const dayCondition = mapCondition(day.condition);
          return {
            date: day.date.split('T')[0],
            temperature: Math.round((day.high + day.low) / 2),
            condition: dayCondition,
            description: day.description,
            humidity: data.current.humidity,
            windSpeed: data.current.windSpeed,
            icon: getWeatherIcon(dayCondition),
          };
        }) || [];

        setWeather([currentWeather, ...forecastWeather]);
        setCurrentCity(data.location || STATE_COORDS[state].city);
        setError(null);
      } else {
        throw new Error('Invalid weather data');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err as Error);
      // Fallback weather data
      setWeather([
        { date: new Date().toISOString().split('T')[0], temperature: 28, condition: 'sunny', description: 'Clear skies', humidity: 65, windSpeed: 12, icon: '☀️' },
        { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], temperature: 27, condition: 'partly_cloudy', description: 'Partly cloudy', humidity: 70, windSpeed: 10, icon: '⛅' },
        { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], temperature: 26, condition: 'cloudy', description: 'Overcast', humidity: 75, windSpeed: 8, icon: '☁️' },
        { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], temperature: 25, condition: 'rainy', description: 'Light rain', humidity: 85, windSpeed: 15, icon: '🌧️' },
        { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], temperature: 28, condition: 'sunny', description: 'Clear skies', humidity: 60, windSpeed: 11, icon: '☀️' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    fetchWeather();
    
    // Auto-refresh every 30 minutes (AccuWeather has rate limits)
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    // Refresh when window regains focus
    const handleFocus = () => fetchWeather();
    window.addEventListener('focus', handleFocus);
    
    // Refresh when user comes back online
    const handleOnline = () => fetchWeather();
    window.addEventListener('online', handleOnline);
    
    // Refresh when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchWeather();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchWeather]);

  const getWeatherSuggestion = (condition: WeatherCondition): string => {
    switch (condition) {
      case 'sunny':
        return "Perfect weather for a picnic or outdoor date! ☀️";
      case 'partly_cloudy':
        return "Great day for hiking or outdoor activities! ⛅";
      case 'cloudy':
        return "Good for outdoor events, won't be too hot! ☁️";
      case 'rainy':
        return "Consider indoor venues or cozy restaurants! 🌧️";
      case 'stormy':
        return "Stay indoors! Perfect for movie dates or lounges! ⛈️";
      default:
        return "Check the weather before heading out!";
    }
  };

  return { weather, loading, error, getWeatherSuggestion, today: weather[0], currentCity, state, refetch: fetchWeather };
}
