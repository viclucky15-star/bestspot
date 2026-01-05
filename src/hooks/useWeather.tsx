import { useState, useEffect, useCallback } from 'react';
import { WeatherData, WeatherCondition } from '@/types';

const ENUGU_LAT = 6.4584;
const ENUGU_LON = 7.5464;

const getWeatherCondition = (code: number): WeatherCondition => {
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2) return 'partly_cloudy';
  if (code === 3) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 80 && code <= 99) return 'stormy';
  return 'cloudy';
};

const getWeatherDescription = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'sunny': return 'Clear skies';
    case 'partly_cloudy': return 'Partly cloudy';
    case 'cloudy': return 'Overcast';
    case 'rainy': return 'Light rain';
    case 'stormy': return 'Thunderstorms';
    default: return 'Unknown';
  }
};

const getWeatherIcon = (condition: WeatherCondition): string => {
  switch (condition) {
    case 'sunny': return '☀️';
    case 'partly_cloudy': return '⛅';
    case 'cloudy': return '☁️';
    case 'rainy': return '🌧️';
    case 'stormy': return '⛈️';
    default: return '🌤️';
  }
};

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${ENUGU_LAT}&longitude=${ENUGU_LON}&daily=weathercode,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,windspeed_10m_max&timezone=Africa/Lagos`
      );

      if (!response.ok) throw new Error('Failed to fetch weather');

      const data = await response.json();

      const weatherData: WeatherData[] = data.daily.time.slice(0, 5).map((date: string, index: number) => {
        const code = data.daily.weathercode[index];
        const condition = getWeatherCondition(code);
        
        return {
          date,
          temperature: Math.round((data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2),
          condition,
          description: getWeatherDescription(condition),
          humidity: data.daily.relative_humidity_2m_max[index],
          windSpeed: Math.round(data.daily.windspeed_10m_max[index]),
          icon: getWeatherIcon(condition),
        };
      });

      setWeather(weatherData);
      setError(null);
    } catch (err) {
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
  }, []);

  useEffect(() => {
    fetchWeather();
    
    // Auto-refresh every 15 minutes for more up-to-date data
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    
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

  return { weather, loading, error, getWeatherSuggestion, today: weather[0] };
}
